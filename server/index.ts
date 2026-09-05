// API route handlers for Vite dev server middleware.
// Uses Connect-style middleware for compatibility with Vite's configureServer.

import type { IncomingMessage, ServerResponse } from 'http'
import { URL } from 'url'
import { analyzeRepository } from './analysis.ts'
import { generateReadme } from './ai.ts'
import { fetchFileContent } from './github.ts'
import { ApiError } from './types.ts'
import type { AnalyzeRequest } from './types.ts'
import type { ProjectContext, ReadmeStyle } from '../src/types/index.ts'

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function sendError(res: ServerResponse, error: unknown) {
  if (error instanceof ApiError) {
    sendJson(res, error.status, {
      message: error.message,
      code: error.code,
      status: error.status,
    })
  } else {
    sendJson(res, 500, {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      status: 500,
    })
  }
}

const MAX_BODY_BYTES = 512 * 1024 // 512 KB — generous for project context JSON

const RATE_WINDOW_MS = 60_000
const rateBuckets = new Map<string, { startedAt: number; count: number }>()

function getClientKey(req: IncomingMessage): string {
  if (process.env.TRUST_PROXY !== 'true') {
    return req.socket.remoteAddress ?? 'unknown'
  }
  const forwarded = req.headers['x-forwarded-for']
  const address = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]
  return (address ?? req.socket.remoteAddress ?? 'unknown').trim()
}

function enforceRateLimit(req: IncomingMessage, res: ServerResponse, limit: number): boolean {
  const now = Date.now()
  const key = `${getClientKey(req)}:${limit}`
  const bucket = rateBuckets.get(key)
  const current = bucket && now - bucket.startedAt < RATE_WINDOW_MS
    ? bucket
    : { startedAt: now, count: 0 }

  current.count += 1
  rateBuckets.set(key, current)

  if (current.count <= limit) return true

  const retryAfter = Math.max(1, Math.ceil((RATE_WINDOW_MS - (now - current.startedAt)) / 1000))
  res.setHeader('Retry-After', String(retryAfter))
  sendJson(res, 429, {
    message: 'Too many requests. Please try again shortly.',
    code: 'RATE_LIMITED',
    status: 429,
  })
  return false
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    let totalBytes = 0
    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length
      if (totalBytes > MAX_BODY_BYTES) {
        req.destroy()
        reject(new ApiError('Request body too large', 'INVALID_REQUEST', 413))
        return
      }
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

async function handleAnalyze(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = await readBody(req)
    let parsed: AnalyzeRequest
    try {
      parsed = JSON.parse(body) as AnalyzeRequest
    } catch {
      sendJson(res, 400, { message: 'Invalid JSON body', code: 'INVALID_REQUEST', status: 400 })
      return
    }
    const { repoUrl } = parsed

    if (!repoUrl || typeof repoUrl !== 'string') {
      sendJson(res, 400, {
        message: 'Please enter a valid public GitHub repository URL',
        code: 'INVALID_URL',
        status: 400,
      })
      return
    }

    const result = await analyzeRepository(repoUrl)
    sendJson(res, 200, result)
  } catch (error) {
    sendError(res, error)
  }
}

interface GenerateRequestBody {
  projectContext?: ProjectContext
  style?: ReadmeStyle
  personalization?: string
}

const README_STYLES: ReadmeStyle[] = ['standard', 'detailed', 'minimal']

async function handleGenerate(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = await readBody(req)
    let parsed: GenerateRequestBody
    try {
      parsed = JSON.parse(body) as GenerateRequestBody
    } catch {
      sendJson(res, 400, { message: 'Invalid JSON body', code: 'INVALID_REQUEST', status: 400 })
      return
    }
    const { projectContext, style, personalization } = parsed

    if (!projectContext || typeof projectContext !== 'object') {
      sendJson(res, 400, {
        message: 'A valid projectContext is required.',
        code: 'INVALID_REQUEST',
        status: 400,
      })
      return
    }

    if (personalization !== undefined && typeof personalization !== 'string') {
      sendJson(res, 400, {
        message: 'personalization must be a string.',
        code: 'INVALID_REQUEST',
        status: 400,
      })
      return
    }

    if (style !== undefined && !README_STYLES.includes(style)) {
      sendJson(res, 400, {
        message: 'style must be standard, detailed, or minimal.',
        code: 'INVALID_REQUEST',
        status: 400,
      })
      return
    }

    const result = await generateReadme(
      projectContext,
      style ?? 'standard',
      personalization
    )
    sendJson(res, 200, result)
  } catch (error) {
    sendError(res, error)
  }
}

// Maximum size (chars) of a file we'll return to the client for preview.
const MAX_FILE_CHARS = 120 * 1024 // ~120 KB

const SAFE_SEGMENT = /^[\w.-]+$/

interface FileRequestBody {
  owner?: string
  repo?: string
  path?: string
}

async function handleFile(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = await readBody(req)
    let parsed: FileRequestBody
    try {
      parsed = JSON.parse(body) as FileRequestBody
    } catch {
      sendJson(res, 400, { message: 'Invalid JSON body', code: 'INVALID_REQUEST', status: 400 })
      return
    }
    const { owner, repo, path } = parsed

    if (
      typeof owner !== 'string' ||
      typeof repo !== 'string' ||
      typeof path !== 'string' ||
      !owner ||
      !repo ||
      !path
    ) {
      sendJson(res, 400, {
        message: 'owner, repo and path are required.',
        code: 'INVALID_REQUEST',
        status: 400,
      })
      return
    }

    // Path safety: reject absolute paths, traversal, and Windows separators so
    // we can never resolve a file outside the requested repository tree.
    if (
      path.startsWith('/') ||
      path.split('/').some((seg) => seg === '..' || !SAFE_SEGMENT.test(seg)) ||
      path.includes('\\')
    ) {
      sendJson(res, 400, { message: 'Invalid file path.', code: 'INVALID_PATH', status: 400 })
      return
    }

    const content = await fetchFileContent(owner, repo, path)
    if (content === null) {
      sendJson(res, 404, {
        message: 'File not found or could not be read.',
        code: 'FILE_NOT_FOUND',
        status: 404,
      })
      return
    }

    let truncated = false
    let safeContent = content
    if (safeContent.length > MAX_FILE_CHARS) {
      safeContent = safeContent.slice(0, MAX_FILE_CHARS)
      truncated = true
    }

    sendJson(res, 200, { path, content: safeContent, truncated })
  } catch (error) {
    sendError(res, error)
  }
}

export function createServer() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const path = url.pathname

    const limit = path === '/generate' || path === '/ai/generate-readme' ? 10 : 60
    if (!enforceRateLimit(req, res, limit)) return

    // POST /api/analyze  (and /api/github/analyze alias)
    if (
      req.method === 'POST' &&
      (path === '/analyze' || path === '/github/analyze')
    ) {
      await handleAnalyze(req, res)
      return
    }

    // POST /api/generate  (and /api/ai/generate-readme alias)
    if (
      req.method === 'POST' &&
      (path === '/generate' || path === '/ai/generate-readme')
    ) {
      await handleGenerate(req, res)
      return
    }

    // POST /api/file — fetch a single file's contents for preview
    if (req.method === 'POST' && path === '/file') {
      await handleFile(req, res)
      return
    }

    // Not found - pass to next middleware
    next()
  }
}