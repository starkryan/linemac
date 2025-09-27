import { NextRequest, NextResponse } from 'next/server';

function callRd(port: number, method: string, path = '/', body = null, timeout = 2000): Promise<{ statusCode: number; headers: any; body: string }> {
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
      rejectUnauthorized: false, // dev only. Use CA in prod.
      timeout
    };

    const req = require('https').request(opts, (res: any) => {
      const chunks: any[] = [];
      res.on('data', (c: any) => chunks.push(c));
      res.on('end', () => {
        const sb = Buffer.concat(chunks).toString('utf8');
        resolve({ statusCode: res.statusCode, headers: res.headers, body: sb });
      });
    });

    req.on('error', (err: any) => reject(err));
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

export async function GET(request: NextRequest) {
  const port = 11101;
  try {
    const result = await callRd(port, 'RDSERVICE', '/', null, 2000);
    if (result && result.statusCode === 200 && result.body && result.body.includes('<RDService')) {
      return NextResponse.json({ ok: true, port, result });
    }
    return NextResponse.json({ ok: false, message: 'No RDService XML from ' + port }, { status: 502 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: String(err) }, { status: 502 });
  }
}