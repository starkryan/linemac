import { NextRequest, NextResponse } from 'next/server';

// Mock RDService response for development environments
const MOCK_RD_SERVICE_RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<RDService>
  <Info>
    <Param name="status" value="true"/>
    <Param name="datetime" value="${new Date().toISOString()}"/>
    <Param name="model" value="Mantra MFS100"/>
    <Param name="firmware" value="1.0.0"/>
    <Param name="serial" value="DEV-MOCK-001"/>
    <Param name="library" value="development-mock"/>
  </Info>
</RDService>`;

// Helper function to parse XML response
function parseXmlResponse(xmlString: string): any {
  try {
    const result: any = { info: {} };
    const infoMatch = xmlString.match(/<Info>([\s\S]*?)<\/Info>/);
    if (infoMatch) {
      const paramMatches = infoMatch[1].match(/<Param name="([^"]*)" value="([^"]*)"/g);
      if (paramMatches) {
        paramMatches.forEach(param => {
          const match = param.match(/<Param name="([^"]*)" value="([^"]*)"/);
          if (match) {
            result.info[match[1]] = match[2];
          }
        });
      }
    }
    return result;
  } catch (error) {
    return { error: 'Failed to parse XML response' };
  }
}

// Helper function to extract error codes from error messages
function extractErrorCode(errorMessage: string): string {
  if (errorMessage.includes('ECONNREFUSED')) return 'ECONNREFUSED';
  if (errorMessage.includes('timeout')) return 'TIMEOUT';
  if (errorMessage.includes('ENOTFOUND')) return 'ENOTFOUND';
  if (errorMessage.includes('EHOSTUNREACH')) return 'EHOSTUNREACH';
  return 'UNKNOWN';
}

function callRdSingle(port: number, method: string, path = '/', body = null, timeout = 5000): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const opts = {
      host: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        Host: `127.0.0.1:${port}`,
        'Content-Type': 'text/xml',
        'Content-Length': body ? Buffer.byteLength(body) : 0,
        'User-Agent': 'Mantra-RDService-Client/1.0'
      },
      rejectUnauthorized: false,
      timeout,
      family: 4
    };

    const req = require('https').request(opts, (res: any) => {
      const chunks: any[] = [];
      res.on('data', (c: any) => chunks.push(c));
      res.on('end', () => {
        const sb = Buffer.concat(chunks).toString('utf8');
        resolve({ statusCode: res.statusCode, headers: res.headers, body: sb });
      });
    });

    req.on('error', (err: any) => {
      console.error('RDService connection error:', {
        code: err.code,
        message: err.message,
        port: port,
        method: method,
        path: path
      });
      reject(err);
    });

    req.on('timeout', () => {
      const timeoutError = new Error(`Connection timeout after ${timeout}ms`);
      console.error('RDService timeout:', timeoutError.message);
      req.destroy(timeoutError);
      reject(timeoutError);
    });

    if (body) req.write(body);
    req.end();
  });
}

function callRdWithRetry(port: number, method: string, path = '/', body = null, timeout = 5000, maxRetries = 3): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise(async (resolve, reject) => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await callRdSingle(port, method, path, body, timeout);
        resolve(result);
        return;
      } catch (error: any) {
        lastError = error;
        console.log(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`);

        // Don't retry on certain errors
        if (error.code === 'ECONNREFUSED' && attempt === maxRetries) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    reject(lastError);
  });
}

export async function GET(request: NextRequest) {
  const port = 11101;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/mantra/rdservice', '');

  // Support different HTTP methods like the Express server
  let httpMethod = 'RDSERVICE'; // Default for this endpoint
  if (method === 'GET') {
    // For GET requests, check if it's trying to use RDService verb
    const rdServiceParam = url.searchParams.get('method');
    if (rdServiceParam) {
      httpMethod = rdServiceParam.toUpperCase();
    }
  }

  try {

    // In development mode, return mock response if RDService is not available
    if (isDevelopment) {
      console.log('Development mode: Using mock RDService response for mantra device (rdservice)');
      const parsedResult = parseXmlResponse(MOCK_RD_SERVICE_RESPONSE);
      return NextResponse.json({
        ok: true,
        port,
        method: httpMethod,
        result: {
          statusCode: 200,
          headers: { 'content-type': 'text/xml' },
          body: MOCK_RD_SERVICE_RESPONSE,
          parsed: parsedResult
        },
        mock: true,
        message: 'Development mode - mock RDService response (rdservice)'
      });
    }

    // Production mode: try to connect to actual RDService with retry logic
    const result = await callRdWithRetry(port, httpMethod, path, null, 5000, 3);
    if (result && result.statusCode === 200 && result.body && result.body.includes('<RDService')) {
      const parsedResult = parseXmlResponse(result.body);
      return NextResponse.json({
        ok: true,
        port,
        method: httpMethod,
        result: {
          ...result,
          parsed: parsedResult
        }
      });
    }

    return NextResponse.json({
      ok: false,
      method: httpMethod,
      message: 'No RDService XML from ' + port,
      suggestion: 'Please ensure Mantra RDService is running on port ' + port
    }, { status: 502 });
  } catch (err) {
    const errorMessage = String(err);

    // Handle connection errors gracefully in development
    if (isDevelopment && errorMessage.includes('ECONNREFUSED')) {
      console.log('Development mode: RDService not available, using mock response (rdservice)');
      const parsedResult = parseXmlResponse(MOCK_RD_SERVICE_RESPONSE);
      return NextResponse.json({
        ok: true,
        port,
        method: httpMethod,
        result: {
          statusCode: 200,
          headers: { 'content-type': 'text/xml' },
          body: MOCK_RD_SERVICE_RESPONSE,
          parsed: parsedResult
        },
        mock: true,
        message: 'Development mode - mock RDService response (service not running, rdservice)'
      });
    }

    // Provide specific troubleshooting suggestions based on error type
    let suggestion = '';
    if (errorMessage.includes('ECONNREFUSED')) {
      suggestion = 'Connection refused. Please ensure:\n1. Mantra RDService is installed and running\n2. The service is listening on port ' + port + '\n3. Check Windows Firewall settings\n4. Try restarting the RDService';
    } else if (errorMessage.includes('timeout')) {
      suggestion = 'Connection timeout. This could indicate:\n1. Network connectivity issues\n2. RDService is busy or unresponsive\n3. Firewall blocking the connection\n4. Port ' + port + ' is not accessible';
    } else if (errorMessage.includes('ENOTFOUND')) {
      suggestion = 'Host not found. Check network configuration and DNS settings.';
    } else {
      suggestion = isDevelopment ? 'Running in development mode with mock service' :
        'Please ensure Mantra RDService is installed and running on port ' + port;
    }

    return NextResponse.json({
      ok: false,
      method: httpMethod,
      message: errorMessage,
      suggestion: suggestion,
      error_code: extractErrorCode(errorMessage),
      port: port,
      timestamp: new Date().toISOString()
    }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}