import { NextRequest, NextResponse } from 'next/server';

// Mock capture response for development environments
const MOCK_CAPTURE_RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<PidData>
  <DeviceInfo>
    <Param name="status" value="true"/>
    <Param name="datetime" value="${new Date().toISOString()}"/>
    <Param name="model" value="Mantra MFS100"/>
    <Param name="serial" value="DEV-MOCK-001"/>
  </DeviceInfo>
  <Resp>
    <Param name="errCode" value="0"/>
    <Param name="errInfo" value="Success"/>
    <Param name="fCount" value="1"/>
    <Param name="fType" value="0"/>
    <Param name="iCount" value="0"/>
    <Param name="pCount" value="0"/>
    <Param name="pgCount" value="2"/>
    <Param name="quality" value="95"/>
    <Param name="qScore" value="95"/>
  </Resp>
  <Data>
    <Pid status="true" type="0" qScore="95">
      <CustOdata>
        <Param name="mantrakey" value=""/>
      </CustOdata>
    </Pid>
  </Data>
  <Skey>
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA MOCK_DEVELOPMENT_KEY
  </Skey>
  <Hmac>MOCK_DEVELOPMENT_HMAC</Hmac>
</PidData>`;

// Helper function to parse XML response
function parseXmlResponse(xmlString: string): any {
  try {
    const result: any = { deviceInfo: {}, resp: {}, data: {} };

    // Parse DeviceInfo
    const deviceInfoMatch = xmlString.match(/<DeviceInfo>([\s\S]*?)<\/DeviceInfo>/);
    if (deviceInfoMatch) {
      const paramMatches = deviceInfoMatch[1].match(/<Param name="([^"]*)" value="([^"]*)"/g);
      if (paramMatches) {
        paramMatches.forEach(param => {
          const match = param.match(/<Param name="([^"]*)" value="([^"]*)"/);
          if (match) {
            result.deviceInfo[match[1]] = match[2];
          }
        });
      }
    }

    // Parse Resp
    const respMatch = xmlString.match(/<Resp>([\s\S]*?)<\/Resp>/);
    if (respMatch) {
      const paramMatches = respMatch[1].match(/<Param name="([^"]*)" value="([^"]*)"/g);
      if (paramMatches) {
        paramMatches.forEach(param => {
          const match = param.match(/<Param name="([^"]*)" value="([^"]*)"/);
          if (match) {
            result.resp[match[1]] = match[2];
          }
        });
      }
    }

    // Parse Data (simplified)
    const dataMatch = xmlString.match(/<Data>([\s\S]*?)<\/Data>/);
    if (dataMatch) {
      result.data.raw = dataMatch[1];

      // Extract Pid attributes
      const pidMatch = dataMatch[1].match(/<Pid([^>]*)>/);
      if (pidMatch) {
        result.data.pid = {};
        const attrMatches = pidMatch[1].match(/(\w+)="([^"]*)"/g);
        if (attrMatches) {
          attrMatches.forEach(attr => {
            const match = attr.match(/(\w+)="([^"]*)"/);
            if (match) {
              result.data.pid[match[1]] = match[2];
            }
          });
        }
      }
    }

    return result;
  } catch (error) {
    return { error: 'Failed to parse XML response' };
  }
}

function callRd(port: number, method: string, path = '/rd/capture', body = '', timeout = 20000): Promise<{ statusCode: number; headers: any; body: string }> {
  return new Promise((resolve, reject) => {
    const opts = {
      host: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        Host: `127.0.0.1:${port}`,
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(body || '')
      },
      rejectUnauthorized: false,
      timeout
    };
    const req = require('https').request(opts, (r: any) => {
      const ch: any[] = [];
      r.on('data', (c: any) => ch.push(c));
      r.on('end', () => resolve({ statusCode: r.statusCode, headers: r.headers, body: Buffer.concat(ch).toString('utf8') }));
    });
    req.on('error', (e: any) => reject(e));
    req.on('timeout', () => req.destroy(new Error('timeout')));
    if (body) req.write(body);
    req.end();
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const port = body?.port ?? 11101;
  const pidOptions = body?.pidOptions;
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!pidOptions) {
    return NextResponse.json({ ok: false, message: 'missing pidOptions' }, { status: 400 });
  }

  try {
    // In development mode, return mock response if RDService is not available
    if (isDevelopment) {
      console.log('Development mode: Using mock capture response for mantra device');
      const parsedResult = parseXmlResponse(MOCK_CAPTURE_RESPONSE);
      return NextResponse.json({
        ok: true,
        port,
        method: 'CAPTURE',
        result: {
          statusCode: 200,
          headers: { 'content-type': 'text/xml' },
          body: MOCK_CAPTURE_RESPONSE,
          parsed: parsedResult
        },
        mock: true,
        message: 'Development mode - mock capture response',
        suggestion: 'This is a mock response for development. In production, connect to actual Mantra RDService.'
      });
    }

    // Production mode: first try CAPTURE verb
    try {
      const cap = await callRd(port, 'CAPTURE', '/rd/capture', pidOptions, 20000);
      if (cap && cap.statusCode === 200) {
        const parsedResult = parseXmlResponse(cap.body);
        return NextResponse.json({
          ok: true,
          port,
          method: 'CAPTURE',
          result: {
            ...cap,
            parsed: parsedResult
          }
        });
      }
      // else fall through to POST
    } catch (e) {
      // continue to fallback
    }

    // fallback to POST
    const postResp = await callRd(port, 'POST', '/rd/capture', pidOptions, 20000);
    const parsedResult = parseXmlResponse(postResp.body);
    return NextResponse.json({
      ok: true,
      port,
      method: 'POST',
      result: {
        ...postResp,
        parsed: parsedResult
      }
    });
  } catch (err) {
    const errorMessage = String(err);

    // Handle connection errors gracefully in development
    if (isDevelopment && errorMessage.includes('ECONNREFUSED')) {
      console.log('Development mode: RDService not available, using mock capture response');
      const parsedResult = parseXmlResponse(MOCK_CAPTURE_RESPONSE);
      return NextResponse.json({
        ok: true,
        port,
        method: 'CAPTURE',
        result: {
          statusCode: 200,
          headers: { 'content-type': 'text/xml' },
          body: MOCK_CAPTURE_RESPONSE,
          parsed: parsedResult
        },
        mock: true,
        message: 'Development mode - mock capture response (service not running)',
        suggestion: 'This is a mock response for development. In production, connect to actual Mantra RDService.'
      });
    }

    return NextResponse.json({
      ok: false,
      port,
      method: 'CAPTURE',
      error: errorMessage,
      suggestion: isDevelopment ? 'Running in development mode with mock service' : 'Please ensure Mantra RDService is installed and running',
      timestamp: new Date().toISOString()
    }, { status: 502 });
  }
}