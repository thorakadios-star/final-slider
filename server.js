// TrueStats - Proxy para SportAPI (RapidAPI) + Telegram con IMÁGENES
// Local:   node server.js  →  http://localhost:3000
// Render: deploy automático con PORT de entorno

const http  = require('http');
const https = require('https');
const url   = require('url');

const PORT    = process.env.PORT || 3000;
const SA_KEY  = '3b7d1aeeaamshce1e406a028e4adp1f3231jsn1132706d9b0b';
const SA_HOST = 'sportapi7.p.rapidapi.com';
const TG_TOKEN = '8318788764:AAF2RlJTfoGzgcMnAe2HJGdVRiid5Sa2_TU';

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Health check
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'TrueStats Proxy', endpoints: ['/sportapi/*', '/telegram', '/telegram-photo'] }));
    return;
  }

  // ═══════════════════════════════════════════════════════════════════
  // TELEGRAM - ENVIAR FOTO (IMAGEN)
  // ═══════════════════════════════════════════════════════════════════
  if (parsedUrl.pathname === '/telegram-photo' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { chat_id, photo, caption } = data;
        
        if (!chat_id || !photo) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, description: 'Faltan chat_id o photo' }));
          return;
        }
        
        // Convertir base64 a buffer
        const imageBuffer = Buffer.from(photo, 'base64');
        
        // Crear boundary para multipart
        const boundary = '----TrueStatsBoundary' + Date.now();
        
        // Construir el body multipart
        let multipartBody = '';
        
        // Campo chat_id
        multipartBody += `--${boundary}\r\n`;
        multipartBody += 'Content-Disposition: form-data; name="chat_id"\r\n\r\n';
        multipartBody += `${chat_id}\r\n`;
        
        // Campo caption (opcional)
        if (caption) {
          multipartBody += `--${boundary}\r\n`;
          multipartBody += 'Content-Disposition: form-data; name="caption"\r\n\r\n';
          multipartBody += `${caption}\r\n`;
        }
        
        // Campo photo (archivo)
        multipartBody += `--${boundary}\r\n`;
        multipartBody += 'Content-Disposition: form-data; name="photo"; filename="pick.png"\r\n';
        multipartBody += 'Content-Type: image/png\r\n\r\n';
        
        const multipartEnd = `\r\n--${boundary}--\r\n`;
        
        // Combinar todo en un buffer
        const bodyStart = Buffer.from(multipartBody, 'utf8');
        const bodyEnd = Buffer.from(multipartEnd, 'utf8');
        const fullBody = Buffer.concat([bodyStart, imageBuffer, bodyEnd]);
        
        const options = {
          hostname: 'api.telegram.org',
          path: `/bot${TG_TOKEN}/sendPhoto`,
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': fullBody.length
          }
        };
        
        console.log('📸 Enviando foto a Telegram...');
        
        const tgReq = https.request(options, (tgRes) => {
          let tgBody = '';
          tgRes.on('data', chunk => { tgBody += chunk; });
          tgRes.on('end', () => {
            console.log('✅ Telegram response:', tgBody);
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(tgBody);
          });
        });
        
        tgReq.on('error', (e) => {
          console.error('❌ Telegram error:', e.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, description: e.message }));
        });
        
        tgReq.write(fullBody);
        tgReq.end();
        
      } catch (e) {
        console.error('❌ Error parseando JSON:', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, description: 'JSON inválido: ' + e.message }));
      }
    });
    return;
  }

  // ═══════════════════════════════════════════════════════════════════
  // TELEGRAM - ENVIAR TEXTO
  // ═══════════════════════════════════════════════════════════════════
  if (parsedUrl.pathname === '/telegram' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { chat_id, text, parse_mode } = data;
        
        if (!chat_id || !text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, description: 'Faltan chat_id o text' }));
          return;
        }
        
        const postData = JSON.stringify({ chat_id, text, parse_mode: parse_mode || 'HTML' });
        
        const options = {
          hostname: 'api.telegram.org',
          path: `/bot${TG_TOKEN}/sendMessage`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
        };
        
        const tgReq = https.request(options, (tgRes) => {
          let tgBody = '';
          tgRes.on('data', chunk => { tgBody += chunk; });
          tgRes.on('end', () => {
            console.log('✅ Telegram:', tgBody);
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(tgBody);
          });
        });
        
        tgReq.on('error', (e) => {
          console.error('❌ Telegram error:', e.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, description: e.message }));
        });
        
        tgReq.write(postData);
        tgReq.end();
        
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, description: 'JSON inválido' }));
      }
    });
    return;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SPORTAPI PROXY
  // ═══════════════════════════════════════════════════════════════════
  if (parsedUrl.pathname.startsWith('/sportapi/')) {
    const apiPath = parsedUrl.pathname.replace('/sportapi', '') + (parsedUrl.search || '');
    const options = {
      hostname: SA_HOST,
      path:     `/api/v1${apiPath}`,
      method:   'GET',
      headers:  { 'x-rapidapi-key': SA_KEY, 'x-rapidapi-host': SA_HOST, 'Accept': 'application/json' }
    };
    console.log(`→ /api/v1${apiPath}`);
    const proxyReq = https.request(options, (proxyRes) => {
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
