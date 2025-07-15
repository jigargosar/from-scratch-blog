// dev-server.js
// Express server for static file serving and live reload (SSE)

const express = require('express');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;
const DOCS_DIR = path.join(__dirname, '../docs');
const SRC_DIR = path.join(__dirname, '../src');

let clients = [];

// SSE endpoint
app.get('/reload', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Inject reload script into HTML
function injectReloadScript(html) {
  const script = `\n<script>\n  const es = new EventSource('/reload');\n  es.onmessage = () => location.reload();\n</script>\n`;
  return html.replace(/<\/body>/i, script + '</body>');
}

// Serve static files, inject script for HTML
app.use(async (req, res, next) => {
  const filePath = path.join(DOCS_DIR, req.path === '/' ? '/index.html' : req.path);
  if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
    let html = await fs.promises.readFile(filePath, 'utf8');
    html = injectReloadScript(html);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } else {
    express.static(DOCS_DIR)(req, res, next);
  }
});

// Watch src for changes and run build
chokidar.watch(SRC_DIR, { ignoreInitial: true }).on('all', (event, pathChanged) => {
  console.log(`File changed: ${pathChanged}`);
  const build = spawn('node', [path.join(SRC_DIR, 'build.js')]);
  build.on('close', () => {
    clients.forEach(res => res.write('data: reload\n\n'));
  });
});

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
