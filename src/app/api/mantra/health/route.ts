import { NextRequest, NextResponse } from 'next/server';

// Re-implement callRdSingle function for health check
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
      rejectUnauthorized: false, // dev only. Use CA in prod.
      timeout,
      family: 4 // Force IPv4
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
      reject(err);
    });

    req.on('timeout', () => {
      const timeoutError = new Error(`Connection timeout after ${timeout}ms`);
      req.destroy(timeoutError);
      reject(timeoutError);
    });

    if (body) req.write(body);
    req.end();
  });
}

export async function GET(request: NextRequest) {
  const port = 11101;
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // Check system information
    const systemInfo = {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    // Check if we're in development mode
    if (isDevelopment) {
      return NextResponse.json({
        status: 'healthy',
        mode: 'development',
        mantra_service: {
          status: 'mock',
          message: 'Development mode - using mock RDService responses',
          port: port
        },
        system: systemInfo,
        suggestions: [
          'In production, ensure Mantra RDService is installed and running',
          'Check Windows Firewall settings for port ' + port,
          'Verify RDService is listening on the correct port'
        ]
      });
    }

    // Production mode: try to connect to actual RDService

    try {
      const result = await callRdSingle(port, 'RDSERVICE', '/', null, 3000);

      if (result && result.statusCode === 200) {
        return NextResponse.json({
          status: 'healthy',
          mode: 'production',
          mantra_service: {
            status: 'connected',
            port: port,
            response_code: result.statusCode,
            service_detected: result.body.includes('<RDService')
          },
          system: systemInfo
        });
      } else {
        return NextResponse.json({
          status: 'unhealthy',
          mode: 'production',
          mantra_service: {
            status: 'error',
            port: port,
            response_code: result.statusCode,
            message: 'RDService returned non-200 status code'
          },
          system: systemInfo,
          troubleshooting: [
            'Check RDService logs for errors',
            'Restart the Mantra RDService',
            'Verify the device is properly connected'
          ]
        }, { status: 502 });
      }
    } catch (error: any) {
      return NextResponse.json({
        status: 'unhealthy',
        mode: 'production',
        mantra_service: {
          status: 'disconnected',
          port: port,
          error: error.message,
          error_code: error.code
        },
        system: systemInfo,
        troubleshooting: getTroubleshootingSteps(error)
      }, { status: 502 });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      system: {
        node_version: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}

function getTroubleshootingSteps(error: any): string[] {
  const steps: string[] = [];

  if (error.code === 'ECONNREFUSED') {
    steps.push(
      'Connection refused - RDService is not running',
      'Start Mantra RDService from Windows Services',
      'Check if port 11101 is available',
      'Restart the RDService application',
      'Check Windows Firewall settings'
    );
  } else if (error.message.includes('timeout')) {
    steps.push(
      'Connection timeout - RDService is not responding',
      'Check if RDService is busy or frozen',
      'Restart the RDService application',
      'Verify network connectivity to localhost',
      'Check for conflicting applications using port 11101'
    );
  } else if (error.code === 'ENOTFOUND') {
    steps.push(
      'Host resolution failed',
      'Check network configuration',
      'Verify localhost resolution in hosts file'
    );
  } else {
    steps.push(
      'Unknown error occurred',
      'Check RDService installation',
      'Reinstall Mantra RDService if necessary',
      'Contact system administrator'
    );
  }

  return steps;
}