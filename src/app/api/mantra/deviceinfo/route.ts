import { NextRequest, NextResponse } from 'next/server';

// Mock device info response for development environments
const MOCK_DEVICE_INFO_RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<DeviceInfo>
  <Param name="status" value="true"/>
  <Param name="datetime" value="${new Date().toISOString()}"/>
  <Param name="model" value="Mantra MFS100"/>
  <Param name="serial" value="DEV-MOCK-001"/>
  <Param name="firmware" value="1.0.0"/>
  <Param name="library" value="development-mock"/>
  <Param name="manufacturer" value="Mantra"/>
  <Param name="type" value="Fingerprint Scanner"/>
</DeviceInfo>`;

// Helper function to parse XML response
function parseXmlResponse(xmlString: string): any {
  try {
    const result: any = { deviceInfo: {} };
    const paramMatches = xmlString.match(/<Param name="([^"]*)" value="([^"]*)"/g);
    if (paramMatches) {
      paramMatches.forEach(param => {
        const match = param.match(/<Param name="([^"]*)" value="([^"]*)"/);
        if (match) {
          result.deviceInfo[match[1]] = match[2];
        }
      });
    }
    return result;
  } catch (error) {
    return { error: 'Failed to parse XML response' };
  }
}

function callRd(port: number, method: string, path = '/rd/info', body = null, timeout = 5000): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const opts = {
      host: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        Host: `127.0.0.1:${port}`,
        'Content-Type': 'text/xml',
        'Content-Length': body ? Buffer.byteLength(body) : 0
      },
      rejectUnauthorized: false,
      timeout
    };
    const req = require('https').request(opts, (r: any) => {
      const chunks: any[] = [];
      r.on('data', (c: any) => chunks.push(c));
      r.on('end', () => resolve({ statusCode: r.statusCode, headers: r.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', (e: any) => reject(e));
    req.on('timeout', () => req.destroy(new Error('timeout')));
    if (body) req.write(body);
    req.end();
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const port = parseInt(body?.port?.toString() || process.env.MANTRA_RD_PORT || '11101');
  const host = process.env.MANTRA_RD_HOST || '127.0.0.1';
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // Always try to connect to actual RDService first
    console.log(`Attempting to get device info from Mantra RDService at ${host}:${port}`);
    const result = await callRd(port, 'DEVICEINFO', '/rd/info', null, 5000);
    const parsedResult = parseXmlResponse(result.body);

    console.log('Successfully got device info from Mantra RDService');
    return NextResponse.json({
      ok: true,
      port,
      method: 'DEVICEINFO',
      result: {
        ...result,
        parsed: parsedResult
      }
    });
  } catch (err) {
    const errorMessage = String(err);

    // Only use mock response as last resort in development if explicitly enabled
    const useMockFallback = process.env.MANTRA_USE_MOCK === 'true';

    if (isDevelopment && useMockFallback && errorMessage.includes('ECONNREFUSED')) {
      console.log('Development mode: RDService not available, using mock device info response');
      const parsedResult = parseXmlResponse(MOCK_DEVICE_INFO_RESPONSE);
      return NextResponse.json({
        ok: true,
        port,
        method: 'DEVICEINFO',
        result: {
          statusCode: 200,
          headers: { 'content-type': 'text/xml' },
          body: MOCK_DEVICE_INFO_RESPONSE,
          parsed: parsedResult
        },
        mock: true,
        message: 'Development mode - mock device info response (service not running)'
      });
    }

    return NextResponse.json({
      ok: false,
      port,
      method: 'DEVICEINFO',
      error: errorMessage,
      suggestion: 'Please ensure Mantra RDService is installed and running on port ' + port,
      timestamp: new Date().toISOString()
    }, { status: 502 });
  }
}