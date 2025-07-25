const express = require('express')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const watcher = require('./watcher')
// const open = require('open').default
const notifier = require('node-notifier')
const clipboard = require('clipboardy').default

const app = express()
const PORT = 3000
const DOCS_DIR = path.join(__dirname, '../docs')
const SRC_DIR = path.join(__dirname, '../src')

let clients = []

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

function injectReloadScript(html) {
  const snippet = `
<script>
  const es = new EventSource('/reload');
  es.onmessage = () => location.reload();
</script>`
  return html.replace(/<\/body>/i, snippet + '</body>')
}


app.use((req, res, next) => {
  let reqPath = req.path === '/' ? '/index.html' : req.path;
  let filePath = path.join(DOCS_DIR, reqPath);

  if (!path.extname(filePath)) {
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) filePath = htmlPath;
  }

  if (fs.existsSync(filePath)) {
    if (filePath.endsWith('.html')) {
      fs.promises
        .readFile(filePath, 'utf8')
        .then(html => res.send(injectReloadScript(html)))
        .catch(next);
    } else {
      res.sendFile(filePath);
    }
  } else {
    res.status(404).send(injectReloadScript(NOT_FOUND_HTML));
  }
})

const NOT_FOUND_HTML = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Site Error</title>
      <style>
        body { font-family: sans-serif; background: #222; color: #eee; text-align: center; padding: 4rem; }
        h1 { color: #ff4081; }
        a { color: #00ffe1; text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>Something Went Wrong</h1>
      <p>The page or resource you requested could not be found, or there was a problem with the server.<br>
      Please check the URL or <a href="/">return to the homepage</a>.</p>
    </body>
  </html>
`

watcher({
  paths: SRC_DIR,
  delay: 500,

  exec: () =>
    new Promise((resolve, reject) => {
      console.log('▶️  Running build…')
      const p = spawn('node', [path.join(__dirname, 'build.js')], {
        stdio: 'inherit',
      })
      p.on('close', function (code) {
        if (code === 0) {
          return resolve()
        } else {
          const message = 'Build Failed: ' + code
          console.error(message)
          notifier.notify(message)
          return reject(code)
        }
      })
    }),

  afterExec: () => {
    console.log('🔄 Builds done — reloading clients')
    clients.forEach(res => res.write('data: reload\n\n'))
  },
})

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`
  // console.log(`Dev server running at ${url}`)
  // console.log(open(url))
  void copyUrlToClipboard(url)
})

async function copyUrlToClipboard(url) {
  try {
    await clipboard.write(url)
    console.log(`Copied server URL to clipboard: ${url}`)
  } catch (error) {
    console.error(`Failed to copy URL: ${url}`, error)
  }
}
