import { NextRequest, NextResponse } from 'next/server';

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
  const port = body?.port ?? 11101;
  try {
    const result = await callRd(port, 'DEVICEINFO', '/rd/info', null, 5000);
    return NextResponse.json({ ok: true, raw: result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 502 });
  }
}