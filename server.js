const https = require('https');
const http = require('http');

const key = process.env.ANTHROPIC_API_KEY;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const body = [];
  req.on('data', chunk => body.push(chunk));
  req.on('end', () => {
    const data = Buffer.concat(body);
    const apiReq = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }, apiRes => {
      const out = [];
      apiRes.on('data', c => out.push(c));
      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode, {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'POST, OPTIONS'
        });
        res.end(Buffer.concat(out));
      });
    });
    apiReq.on('error', e => {
      res.writeHead(500);
      res.end(JSON.stringify({error: e.message}));
    });
    apiReq.end(data);
  });
}).listen(process.env.PORT || 3001, () => console.log('Proxy ready'));
