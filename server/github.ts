import type {
  GitHubRepoResponse,
  GitHubTreeResponse,
  GitHubLanguagesResponse,
  GitHubContentResponse,
} from './types.ts'
import { ApiError as ApiErrorClass } from './types.ts'

const GITHUB_API = 'https://api.github.com'

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'README-3D-Generator',
  }
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (token) {
    headers.Authorization = token.startsWith('Bearer ') || token.startsWith('token ') ? token : `token ${token}`
  }
  return headers
}

async function fetchGitHub<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: getHeaders() })

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiErrorClass('Repository not found', 'NOT_FOUND', 404)
    }
    if (response.status === 403) {
      throw new ApiErrorClass(
        'GitHub API rate limit exceeded. Please try again later or configure a GITHUB_TOKEN.',
        'RATE_LIMITED',
        429
      )
    }
    if (response.status === 409) {
      throw new ApiErrorClass(
        'Repository is empty',
        'EMPTY_REPO',
        422
      )
    }
    throw new ApiErrorClass(
      'Failed to fetch from GitHub API',
      'GITHUB_API_ERROR',
      502
    )
  }

  return response.json() as Promise<T>
}

export async function fetchRepo(
  owner: string,
  repo: string
): Promise<GitHubRepoResponse> {
  return fetchGitHub<GitHubRepoResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}`
  )
}

export async function fetchFileTree(
  owner: string,
  repo: string,
  sha: string
): Promise<GitHubTreeResponse> {
  return fetchGitHub<GitHubTreeResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`
  )
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      { headers: getHeaders() }
    )

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as GitHubContentResponse

    if (!data || typeof data !== 'object' || !('content' in data)) {
      return null
    }

    if (data.encoding === 'base64' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    }

    return typeof data.content === 'string' ? data.content : null
  } catch {
    return null
  }
}

export async function fetchLanguages(
  owner: string,
  repo: string
): Promise<GitHubLanguagesResponse> {
  return fetchGitHub<GitHubLanguagesResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}/languages`
  )
}

export function parseRepoUrl(
  url: string
): { owner: string; repo: string } | null {
  if (!url || typeof url !== 'string') return null
  const cleaned = url.trim().split('?')[0].split('#')[0].replace(/\/+$/, '')
  const match = cleaned.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i
  )
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}