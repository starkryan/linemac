import { NextRequest, NextResponse } from 'next/server';
import { remoteRdClient } from '@/lib/remote-rd-client';
import { getMantraConfig, validateMantraConfig } from '@/lib/mantra-config';

// Mock RDService response for development or fallback
const MOCK_RD_SERVICE_RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<RDService>
  <Info>
    <Param name="status" value="true"/>
    <Param name="datetime" value="${new Date().toISOString()}"/>
    <Param name="model" value="Mantra MFS100"/>
    <Param name="firmware" value="1.0.0"/>
    <Param name="serial" value="DEV-MOCK-001"/>
    <Param name="library" value="remote-mock"/>
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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { host, port, authKey, useFallback = true } = body || {};
  const isDevelopment = process.env.NODE_ENV === 'development';

  const config = getMantraConfig();

  try {
    // Validate configuration
    const configErrors = validateMantraConfig(config);
    if (configErrors.length > 0) {
      return NextResponse.json({
        ok: false,
        error: 'Configuration error',
        details: configErrors
      }, { status: 400 });
    }

    // Try to connect to specified RDService
    const options: any = {};
    if (host) options.host = host;
    if (port) options.port = port;
    if (authKey) options.authKey = authKey;

    console.log(`Testing RDService connection to ${host || config.rdServiceHost}:${port || config.rdServicePort}`);

    const connectionTest = await remoteRdClient.testConnection(options);

    if (connectionTest.connected) {
      // If connected, perform actual discovery
      const result = await remoteRdClient.callRdService('RDSERVICE', '/', undefined, options);
      const parsedResult = parseXmlResponse(result.body);

      return NextResponse.json({
        ok: true,
        host: host || config.rdServiceHost,
        port: port || config.rdServicePort,
        method: 'RDSERVICE',
        responseTime: connectionTest.responseTime,
        result: {
          statusCode: result.statusCode,
          headers: result.headers,
          body: result.body,
          parsed: parsedResult
        },
        connection: {
          connected: true,
          remote: host !== '127.0.0.1' && host !== 'localhost',
          responseTime: connectionTest.responseTime
        }
      });
    }

    // If connection failed but fallback is enabled
    if (useFallback && (isDevelopment || config.useMockInProduction)) {
      console.log('RDService not available, using mock response');
      const parsedResult = parseXmlResponse(MOCK_RD_SERVICE_RESPONSE);

      return NextResponse.json({
        ok: true,
        host: host || config.rdServiceHost,
        port: port || config.rdServicePort,
        method: 'RDSERVICE',
        result: {
          statusCode: 200,
          headers: { 'content-type': 'text/xml' },
          body: MOCK_RD_SERVICE_RESPONSE,
          parsed: parsedResult
        },
        mock: true,
        connection: {
          connected: false,
          error: connectionTest.error,
          fallback: true
        },
        message: 'RDService not available - using mock response'
      });
    }

    // Connection failed and no fallback
    return NextResponse.json({
      ok: false,
      host: host || config.rdServiceHost,
      port: port || config.rdServicePort,
      error: 'RDService connection failed',
      connection: {
        connected: false,
        error: connectionTest.error,
        responseTime: connectionTest.responseTime
      },
      troubleshooting: [
        'Verify RDService is running on the target machine',
        'Check firewall settings for the RDService port',
        'Ensure network connectivity between servers',
        'Verify authentication credentials if using remote access'
      ]
    }, { status: 502 });

  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: 'Remote discovery failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}