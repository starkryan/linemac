// rd-proxy.js — minimal dev proxy for RD Service
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
// serve static files from current folder
app.use(express.static(__dirname));

// simple CORS for dev (if you open UI from another origin)
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// helper to call RD service (method can be 'RDSERVICE','DEVICEINFO','CAPTURE' or 'POST')
function callRd(port, method, pathUrl, body, callback) {
  const opts = {
    host: '127.0.0.1',
    port: port,
    path: pathUrl,
    method: method,
    headers: {
      'Host': `127.0.0.1:${port}`,
      'Content-Type': 'text/xml',
      'Content-Length': body ? Buffer.byteLength(body) : 0
    },
    // dev-only TLS relaxed. Replace with proper CA in production:
    rejectUnauthorized: false
  };

  const req = https.request(opts, (res) => {
    const chunks = [];
    res.on('data', c => chunks.push(c));
    res.on('end', () => {
      const buf = Buffer.concat(chunks);
      callback(null, { statusCode: res.statusCode, headers: res.headers, body: buf.toString('utf8') });
    });
  });

  req.on('error', (e) => callback(e));
  if (body) req.write(body);
  req.end();
}

// Fast discover: check the known RD port 11101 and return result immediately
app.get('/api/discover', (req, res) => {
  const p = 11101; // known RD Service port in your environment
  callRd(p, 'RDSERVICE', '/', null, (err, result) => {
    if (err) {
      return res.status(502).json({ ok:false, message:'RD not found on port ' + p, error: String(err) });
    }
    if (!result || result.statusCode !== 200 || !result.body || !result.body.includes('<RDService')) {
      return res.status(502).json({ ok:false, message:'No RDService XML returned from port ' + p });
    }
    return res.json({ ok:true, port: p, result });
  });
});


// DeviceInfo proxy
app.post('/api/deviceinfo', (req, res) => {
  const port = req.body && req.body.port;
  if (!port) return res.status(400).json({ ok: false, message: 'missing port' });
  callRd(port, 'DEVICEINFO', '/rd/info', null, (err, result) => {
    if (err) return res.status(502).json({ ok: false, error: String(err) });
    res.json({ ok: true, used: 'DEVICEINFO', raw: result });
  });
});

// Capture proxy
app.post('/api/capture', (req, res) => {
  const port = req.body && req.body.port;
  const pidOptions = req.body && req.body.pidOptions;
  if (!port || !pidOptions) return res.status(400).json({ ok:false, message:'missing port or pidOptions' });

  // Try CAPTURE custom method
  callRd(port, 'CAPTURE', '/rd/capture', pidOptions, (err, result) => {
    if (!err && result && result.statusCode === 200) {
      return res.json({ ok:true, used:'CAPTURE', raw: result });
    }
    // fallback to POST if CAPTURE fails
    callRd(port, 'POST', '/rd/capture', pidOptions, (err2, result2) => {
      if (err2) return res.status(502).json({ ok:false, error: String(err2) });
      res.json({ ok:true, used:'POST', raw: result2 });
    });
  });
});

const PORT = 3000;
app.listen(PORT, ()=>console.log('rd-proxy listening on http://127.0.0.1:' + PORT));
