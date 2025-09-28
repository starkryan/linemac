import { getMantraConfig } from './mantra-config';

interface RdClientOptions {
  host?: string;
  port?: number;
  timeout?: number;
  authKey?: string;
}

export class RemoteRdClient {
  private config = getMantraConfig();

  async callRdService(
    method: string,
    path = '/',
    body?: string,
    options: RdClientOptions = {}
  ): Promise<{ statusCode: number; headers: any; body: string }> {
    const host = options.host || this.config.rdServiceHost;
    const port = options.port || this.config.rdServicePort;
    const timeout = options.timeout || 5000;

    return new Promise((resolve, reject) => {
      const opts = {
        host,
        port,
        path,
        method,
        headers: {
          Host: `${host}:${port}`,
          'Content-Type': 'text/xml',
          'Content-Length': body ? Buffer.byteLength(body) : 0,
          'User-Agent': 'Mantra-RDService-Client/1.0',
          ...(this.config.authKey && { 'X-Mantra-Auth': this.config.authKey }),
          ...(options.authKey && { 'Authorization': `Bearer ${options.authKey}` })
        },
        rejectUnauthorized: false,
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
        console.error('RDService connection error:', {
          code: err.code,
          message: err.message,
          host: host,
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

  async testConnection(options?: RdClientOptions): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const result = await this.callRdService('RDSERVICE', '/', undefined, options);
      const responseTime = Date.now() - startTime;

      return {
        connected: result.statusCode === 200 && result.body.includes('<RDService'),
        responseTime,
        error: result.statusCode !== 200 ? `HTTP ${result.statusCode}` : undefined
      };
    } catch (error: any) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }
}

export const remoteRdClient = new RemoteRdClient();