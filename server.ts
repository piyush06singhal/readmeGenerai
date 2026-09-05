// Production server entry point.
// Serves the built static files and handles API routes.

import { createServer as createHttpServer } from 'http'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createServer } from './server/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = parseInt(process.env.PORT || '3000', 10)
const DIST_DIR = join(__dirname, 'dist')

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const apiHandler = createServer()

const server = createHttpServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

  // Handle API routes. The middleware expects the path without the /api
  // prefix (Vite's Connect mount strips it automatically), so mirror that
  // here so the same handler matches /api/* requests.
  if (url.pathname.startsWith('/api')) {
    req.url = url.pathname.replace(/^\/api/, '') + url.search
    apiHandler(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Not found', code: 'NOT_FOUND', status: 404 }))
    })
    return
  }

  // Serve static files from dist
  let filePath = join(DIST_DIR, url.pathname === '/' ? 'index.html' : url.pathname)

  // Check if file exists, if not serve index.html (SPA routing)
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    filePath = join(DIST_DIR, 'index.html')
  }

  try {
    const content = readFileSync(filePath)
    const ext = extname(filePath)
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>404 Not Found</h1>')
  }
})

server.listen(PORT, () => {
  console.log(`🚀 README server running at http://localhost:${PORT}`)
})