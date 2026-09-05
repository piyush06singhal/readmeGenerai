// Server-side Groq service for README generation.
//
// The Groq API key and model live ONLY here, read from environment variables.
// The client never touches Groq directly — it calls /api/generate, which
// proxies to this service. This module is the SINGLE point of configuration
// for the AI model and is responsible for:
//   - building a sanitized, size-limited context from ProjectContext
//   - composing the documentation-writer system prompt
//   - calling the Groq API
//   - returning clean Markdown (no prose, no wrappers)

import type {
  ProjectContext,
  ReadmeStyle,
  GenerateReadmeResponse,
} from '../src/types/index.ts'
import { ApiError } from './types.ts'

const GROQ_DEFAULT_BASE_URL = 'https://api.groq.com/openai/v1'
// Single configuration point for the model — override with GROQ_MODEL.
// Defaults to a current, widely-available Groq model.
const AI_DEFAULT_MODEL = 'openai/gpt-oss-120b'

const MAX_OUTPUT_TOKENS = 4096
const REQUEST_TIMEOUT_MS = 90_000

// --- Context size budgets (characters), prioritized per the spec ---
const BUDGET = {
  repoMetadata: 2000,
  techStack: 1200,
  dependencyManifest: 3500,
  scripts: 1500,
  structure: 4000,
  importantFiles: 1200,
  existingReadme: 9000,
  envExample: 2000,
  representativeSource: 3000,
}

function clamp(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value
  return value.slice(0, maxChars - 1) + '\n…(truncated)'
}

/** Render the project structure tree as an indented text listing. */
function renderStructure(
  nodes: ProjectContext['projectStructure'],
  depth = 0
): string {
  const lines: string[] = []
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    if (node.type === 'directory' && node.children?.length) {
      lines.push(`${indent}${node.name}/`)
      lines.push(renderStructure(node.children, depth + 1))
    } else {
      lines.push(`${indent}${node.name}`)
    }
  }
  return lines.join('\n')
}

/** Render a dependency map as "name@version" lines, capped in count. */
function renderDeps(
  deps: Record<string, string>,
  maxEntries = 80
): string[] {
  return Object.entries(deps)
    .slice(0, maxEntries)
    .map(([name, version]) => `${name}@${version}`)
}

/**
 * Build a sanitized, size-limited textual context from ProjectContext.
 * Explicitly excludes lockfiles, build artifacts, binaries and any secrets.
 */
function buildContext(projectContext: ProjectContext): string {
  const { repo, techStack, dependencies } = projectContext

  const parts: string[] = []

  // 1. Repository metadata
  const meta = [
    `Repository: ${repo.fullName}`,
    repo.description ? `Description: ${repo.description}` : null,
    repo.language ? `Primary language: ${repo.language}` : null,
    techStack.languages.length
      ? `Detected languages: ${techStack.languages.join(', ')}`
      : null,
    repo.license ? `License: ${repo.license}` : null,
    repo.visibility ? `Visibility: ${repo.visibility}` : null,
    repo.topics.length ? `Topics: ${repo.topics.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n')
  if (meta) parts.push(`## Repository Metadata\n${clamp(meta, BUDGET.repoMetadata)}`)

  // 2. Technology stack (grouped)
  const techLines: string[] = []
  if (techStack.frameworks.length) techLines.push(`Frameworks: ${techStack.frameworks.join(', ')}`)
  if (techStack.languages.length) techLines.push(`Languages: ${techStack.languages.join(', ')}`)
  if (techStack.tools.length) techLines.push(`Tools: ${techStack.tools.join(', ')}`)
  if (techStack.runtimes.length) techLines.push(`Runtimes: ${techStack.runtimes.join(', ')}`)
  if (techLines.length) parts.push(`## Technology Stack\n${clamp(techLines.join('\n'), BUDGET.techStack)}`)

  // 3. Dependency manifests (no lockfiles — only the declared manifest deps)
  const depLines: string[] = []
  const prodDeps = renderDeps(dependencies.dependencies)
  if (prodDeps.length) depLines.push(`Dependencies:\n${prodDeps.join('\n')}`)
  const devDeps = renderDeps(dependencies.devDependencies)
  if (devDeps.length) depLines.push(`DevDependencies:\n${devDeps.join('\n')}`)
  if (dependencies.pipDependencies.length)
    depLines.push(`Python dependencies: ${dependencies.pipDependencies.join(', ')}`)
  if (dependencies.otherDependencies.length)
    depLines.push(`Other manifests present: ${dependencies.otherDependencies.join(', ')}`)
  if (depLines.length) parts.push(`## Dependencies\n${clamp(depLines.join('\n'), BUDGET.dependencyManifest)}`)

  // 4. Scripts (install / build / dev commands come from here)
  const scriptEntries = Object.entries(dependencies.scripts)
  if (scriptEntries.length) {
    const scriptText = scriptEntries
      .slice(0, 40)
      .map(([name, cmd]) => `${name}: ${cmd}`)
      .join('\n')
    parts.push(`## Package Scripts\n${clamp(scriptText, BUDGET.scripts)}`)
  }

  // 5. Project structure
  if (projectContext.projectStructure.length) {
    const tree = renderStructure(projectContext.projectStructure)
    parts.push(`## Project Structure\n${clamp(tree, BUDGET.structure)}`)
  }

  // 6. Important files (entry points + config files)
  const importantFiles = [
    ...(projectContext.entryPoints ?? []).map((f) => `entry: ${f}`),
    ...(projectContext.configFiles ?? []).map((f) => `config: ${f}`),
    ...(projectContext.sourceFiles ?? []),
  ]
  if (importantFiles.length) {
    parts.push(
      `## Important Files\n${clamp(importantFiles.slice(0, 120).join('\n'), BUDGET.importantFiles)}`
    )
  }

  // 7. Existing README (preserved as primary context, size-limited)
  if (projectContext.existingReadme) {
    parts.push(
      `## Existing README\n${clamp(projectContext.existingReadme, BUDGET.existingReadme)}`
    )
  }

  // 8. Environment variable examples (names/descriptions only, never values of real .env)
  if (projectContext.envVariables?.length) {
    const envLines = projectContext.envVariables
      .slice(0, 40)
      .map((v) => (v.description ? `${v.name} — ${v.description}` : v.name))
    parts.push(`## Environment Variables\n${clamp(envLines.join('\n'), BUDGET.envExample)}`)
  }

  return parts.join('\n\n')
}

/** Build the system prompt for a technical documentation writer. */
function buildSystemPrompt(style: ReadmeStyle): string {
  const styleGuidance: Record<ReadmeStyle, string> = {
    standard:
      'Produce a professional, balanced README. Include the sections that the repository actually supports. Aim for accuracy over length.',
    detailed:
      'Produce a thorough, more detailed README. Where the context supports it, expand explanations, add an API reference, troubleshooting, examples and deeper documentation. Never add detail the context does not support.',
    minimal:
      'Produce a concise, minimal README. Keep only the essential sections (description, quick start, tech stack, structure, license) and keep each section short.',
  }

  return `You are a senior technical documentation writer. You write clear, accurate, and concise README files.

## Core rules
- Use ONLY information supported by the supplied project context.
- Do NOT invent features, APIs, installation commands, environment variables, database technologies, deployment configuration, or dependencies.
- Do NOT claim a technology merely because it is common for the project type.
- If information is unavailable, OMIT the section, or clearly mark it as "to be provided".
- Preserve useful project-specific information from the Existing README when present. Improve organization and fix formatting problems, but do not delete important details.
- Installation and run commands MUST come from the actual package scripts / dependency manifests supplied. Do not assume npm for non-Node projects.
- Only generate an API Reference section if actual endpoints are identifiable from the context. Otherwise omit it rather than invent it.
- Do not exaggerate features. A dependency is not automatically a "feature".
- Prefer concise, technically accurate documentation. Accuracy beats impressive-sounding content.

## README structure
Use a standard structure (# Project, description, Features, Tech Stack, Getting Started / Prerequisites / Installation / Environment Variables / Running Locally, Usage, Project Structure, API Reference, Contributing, License) but include ONLY the sections that make sense for the analyzed repository. Adapt to whether the project is a library, a frontend app, a backend service, or a CLI.

Style: ${styleGuidance[style]}

Return ONLY the final Markdown document. Do not wrap it in a code fence. Do not add any preamble like "Here is your README:".`
}

interface GroqChatResponse {
  choices?: { message?: { content?: string } }[]
  error?: { message?: string; type?: string; code?: string }
}

/**
 * Generate a README from an analyzed repository context.
 * @throws ApiError with a user-safe code/message on any failure.
 */
export async function generateReadme(
  projectContext: ProjectContext,
  style: ReadmeStyle = 'standard',
  personalization?: string
): Promise<GenerateReadmeResponse> {
  // Read config from the environment at call time. This is important in dev:
  // Vite imports this module during config load — before the api plugin's
  // configureServer() runs loadEnv(.env) — so a module-level read would pin
  // GROQ_API_KEY to 'undefined'. Reading lazily works for both Vite dev and
  // the standalone server (node --env-file=.env).
  const GROQ_API_KEY = process.env.GROQ_API_KEY
  const GROQ_BASE_URL = process.env.GROQ_BASE_URL ?? GROQ_DEFAULT_BASE_URL
  const AI_MODEL = process.env.GROQ_MODEL ?? AI_DEFAULT_MODEL

  if (!GROQ_API_KEY) {
    throw new ApiError(
      'The Groq API key is not configured on the server.',
      'CONFIG_ERROR',
      500
    )
  }
  if (!AI_MODEL) {
    throw new ApiError(
      'The Groq model is not configured on the server.',
      'CONFIG_ERROR',
      500
    )
  }

  const userContext = buildContext(projectContext)
  if (!userContext.trim()) {
    throw new ApiError(
      'No usable repository context was available to generate from.',
      'EMPTY_CONTEXT',
      422
    )
  }

  const systemPrompt = buildSystemPrompt(style)

  // Optional user-provided instructions take precedence over generic guidance.
  // Clamped so a single prompt can't blow the request budget.
  const personalizationBlock = personalization?.trim()
    ? `## User requirements (follow these EXACTLY when writing the README)\n${clamp(personalization.trim(), 2000)}\n\nThese are hard constraints from the reader. Structure, tone, sections, and emphasis must match them, unless they contradict the project context.`
    : null

  const userPrompt = [
    `Analyze the supplied project context and write a README.md for this repository.`,
    `Project context:\n\n${userContext}`,
    personalizationBlock,
  ]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join('\n\n')

  // Request timeout via AbortController
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let json: GroqChatResponse
  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: style === 'minimal' ? 0.4 : 0.7,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      // Surface provider errors without leaking internals or the key.
      if (response.status === 401 || response.status === 403) {
        throw new ApiError(
          'The AI service rejected the request. Please check the server configuration.',
          'CONFIG_ERROR',
          500
        )
      }
      if (response.status === 429) {
        throw new ApiError(
          'The AI service is busy. Please try again in a moment.',
          'RATE_LIMITED',
          429
        )
      }
      let providerMessage: string | undefined
      try {
        const body = (await response.json()) as GroqChatResponse
        providerMessage = body.error?.message
      } catch {
        // ignore — fall back to generic message
      }
      if (providerMessage?.toLowerCase().includes('model')) {
        throw new ApiError(
          'The configured AI model is unavailable. Please check the server configuration.',
          'CONFIG_ERROR',
          500
        )
      }
      throw new ApiError(
        'The AI service returned an error. Please try again in a moment.',
        'PROVIDER_ERROR',
        502
      )
    }

    json = (await response.json()) as GroqChatResponse
  } catch (error) {
    if (error instanceof ApiError) throw error
    const aborted = error instanceof Error && error.name === 'AbortError'
    throw new ApiError(
      aborted
        ? 'The AI service took too long to respond. Please try again.'
        : 'Could not reach the AI service. Please try again in a moment.',
      aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
      aborted ? 504 : 503
    )
  } finally {
    clearTimeout(timeout)
  }

  let markdown = json.choices?.[0]?.message?.content?.trim() ?? ''

  if (!markdown) {
    throw new ApiError(
      'The AI service returned an empty response. Please try again.',
      'EMPTY_OUTPUT',
      502
    )
  }

  // Strip a single wrapping code fence if the provider returned one.
  const fenced = markdown.match(/^```(?:markdown|md)?\n([\s\S]*?)\n```$/)
  if (fenced) markdown = fenced[1].trim()

  if (!/^#\s+\S/m.test(markdown) || (markdown.match(/```/g)?.length ?? 0) % 2 !== 0) {
    throw new ApiError(
      'The AI service returned malformed Markdown. Please try again.',
      'INVALID_OUTPUT',
      502
    )
  }

  return { markdown }
}

export default generateReadme