import { NextRequest, NextResponse } from 'next/server';

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
  if (!pidOptions) {
    return NextResponse.json({ ok: false, message: 'missing pidOptions' }, { status: 400 });
  }

  try {
    // first try CAPTURE verb
    try {
      const cap = await callRd(port, 'CAPTURE', '/rd/capture', pidOptions, 20000);
      if (cap && cap.statusCode === 200) {
        return NextResponse.json({ ok: true, used: 'CAPTURE', raw: cap });
      }
      // else fall through to POST
    } catch (e) {
      // continue to fallback
    }
    // fallback to POST
    const postResp = await callRd(port, 'POST', '/rd/capture', pidOptions, 20000);
    return NextResponse.json({ ok: true, used: 'POST', raw: postResp });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 502 });
  }
}