// Serves the reference photos and prompts to the ChatGPT tab on localhost.
// CORS and Private Network Access headers let chatgpt.com fetch from it.
// Usage: node ref-server.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.argv[2] || 4747);
const RAW = path.join(__dirname, 'refs', 'raw');

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://chatgpt.com');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/prompts.json') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(fs.readFileSync(path.join(__dirname, 'prompts.json')));
    }
    const file = path.join(RAW, path.basename(url));
    if (url.startsWith('/refs/') && fs.existsSync(file)) {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        return res.end(fs.readFileSync(file));
    }
    res.writeHead(404); res.end();
}).listen(port, '127.0.0.1', () => console.log('ref server on ' + port));
