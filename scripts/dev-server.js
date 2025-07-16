// server.js
const express = require('express')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const watcher = require('./watcher')

const app = express()
const PORT = 3000
const DOCS_DIR = path.join(__dirname, '../docs')
const SRC_DIR = path.join(__dirname, '../src')

let clients = []

// 1. SSE reload endpoint
app.get('/reload', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  clients.push(res)
  req.on('close', () => {
    clients = clients.filter(c => c !== res)
  })
})

// 2. HTML injector + static server (unchanged)
function injectReloadScript(html) {
  const snippet = `
<script>
  const es = new EventSource('/reload');
  es.onmessage = () => location.reload();
</script>`
  return html.replace(/<\/body>/i, snippet + '</body>')
}

app.use((req, res, next) => {
  let reqPath = req.path === '/' ? '/index.html' : req.path
  let filePath = path.join(DOCS_DIR, reqPath)

  if (!path.extname(filePath)) {
    const htmlPath = filePath + '.html'
    if (fs.existsSync(htmlPath)) filePath = htmlPath
  }

  if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
    fs.promises
      .readFile(filePath, 'utf8')
      .then(html => res.send(injectReloadScript(html)))
      .catch(next)
  } else {
    express.static(DOCS_DIR)(req, res, next)
  }
})

// 3. Centralized watcher + builder
watcher({
  paths: SRC_DIR,
  delay: 500,

  // your real build command
  exec: () =>
    new Promise((resolve, reject) => {
      console.log('▶️  Running build…')
      const p = spawn('node', [path.join(__dirname, 'build.js')], {
        stdio: 'inherit',
      })
      p.on('close', code => (code === 0 ? resolve() : reject(code)))
    }),

  // fire an SSE reload on every build completion
  afterExec: () => {
    console.log('🔄 Builds done — reloading clients')
    clients.forEach(res => res.write('data: reload\n\n'))
  },
})

// 4. Start server
app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`)
})
