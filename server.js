// TrueStats - Proxy para SportAPI (RapidAPI)
// Local:   node server.js  →  http://localhost:3000
// Railway: deploy automático con PORT de entorno

const http  = require('http');
const https = require('https');
const url   = require('url');

const PORT    = process.env.PORT || 3000;
const SA_KEY  = '3b7d1aeeaamshce1e406a028e4adp1f3231jsn1132706d9b0b';
const SA_HOST = 'sportapi7.p.rapidapi.com';

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Health check para Railway
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'TrueStats Proxy' }));
    return;
  }

  // Proxy SportAPI
  if (parsedUrl.pathname.startsWith('/sportapi/')) {
    const apiPath = parsedUrl.pathname.replace('/sportapi', '') + (parsedUrl.search || '');
    const options = {
      hostname: SA_HOST,
      path:     `/api/v1${apiPath}`,
      method:   'GET',
      headers:  { 'x-rapidapi-key': SA_KEY, 'x-rapidapi-host': SA_HOST, 'Accept': 'application/json' }
    };
    console.log(`→ /api/v1${apiPath}`);
    const proxyReq = require('https').request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      proxyRes.pipe(res);
    });
    proxyReq.on('error', (e) => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
    proxyReq.end();
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => console.log(`TrueStats Proxy activo en puerto ${PORT}`));
