// Repository analysis pipeline.
// Fetches data from GitHub API, inspects files, detects tech stack,
// and builds a structured ProjectContext.

import type {
  GitHubRepoInfo,
  ProjectContext,
  ProjectStructureNode,
  TechStack,
  DependencyInfo,
  EnvVariable,
} from '../src/types/index.js'
import type { GitHubRepoResponse, GitHubTreeItem } from './types.js'
import { ApiError } from './types.js'
import {
  fetchRepo,
  fetchFileTree,
  fetchFileContent,
  fetchLanguages,
  parseRepoUrl,
} from './github.js'

// Priority files to fetch (P0 = highest priority)
const PRIORITY_FILES = [
  'package.json',
  'Cargo.toml',
  'pyproject.toml',
  'go.mod',
  'pom.xml',
  'Gemfile',
  'composer.json',
  'requirements.txt',
  'setup.py',
]

const ENV_FILES = ['.env.example', '.env.sample']

const CONFIG_FILES = [
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'vite.config.ts',
  'vite.config.js',
  'tailwind.config.ts',
  'tailwind.config.js',
  'webpack.config.js',
  '.prettierrc',
  '.prettierrc.json',
  'babel.config.js',
  '.babelrc',
  'jest.config.js',
  'vitest.config.ts',
]

const ENTRY_POINTS = [
  'src/index.ts',
  'src/index.tsx',
  'src/main.ts',
  'src/main.tsx',
  'src/App.tsx',
  'src/App.ts',
  'app.ts',
  'app.tsx',
  'main.ts',
  'main.tsx',
  'index.ts',
  'index.tsx',
  'lib/main.py',
  'src/main.rs',
  'main.go',
]

// Tech stack detection maps
const FRAMEWORK_DEPS: Record<string, string> = {
  react: 'React',
  'react-dom': 'React',
  'next': 'Next.js',
  'nuxt': 'Nuxt.js',
  'vue': 'Vue.js',
  'svelte': 'Svelte',
  'angular': 'Angular',
  'express': 'Express',
  'fastify': 'Fastify',
  'hono': 'Hono',
  'nestjs': 'NestJS',
  'graphql': 'GraphQL',
  'tailwindcss': 'Tailwind CSS',
  'styled-components': 'Styled Components',
  'framer-motion': 'Framer Motion',
  'three': 'Three.js',
  'redux': 'Redux',
  'zustand': 'Zustand',
  'jotai': 'Jotai',
  'prisma': 'Prisma',
  'drizzle': 'Drizzle ORM',
  'typeorm': 'TypeORM',
}

const TOOL_DEPS: Record<string, string> = {
  'vite': 'Vite',
  'webpack': 'Webpack',
  'esbuild': 'ESBuild',
  'typescript': 'TypeScript',
  'eslint': 'ESLint',
  'prettier': 'Prettier',
  'oxlint': 'OxLint',
  'jest': 'Jest',
  'vitest': 'Vitest',
  'mocha': 'Mocha',
  'playwright': 'Playwright',
  'cypress': 'Cypress',
  'tailwindcss': 'Tailwind CSS',
  'postcss': 'PostCSS',
  'autoprefixer': 'Autoprefixer',
  'husky': 'Husky',
  'lint-staged': 'lint-staged',
  'turbo': 'Turborepo',
  'nx': 'Nx',
  'lerna': 'Lerna',
}

const RUNTIME_DEPS: Record<string, string> = {
  'node': 'Node.js',
  'deno': 'Deno',
  'bun': 'Bun',
}

function mapRepoResponse(
  response: GitHubRepoResponse,
  languages: string[],
  hasReadme: boolean,
  hasPackageJson: boolean,
  hasLicense: boolean
): GitHubRepoInfo {
  return {
    name: response.name,
    fullName: response.full_name,
    description: response.description,
    htmlUrl: response.html_url,
    homepage: response.homepage,
    language: response.language,
    languages,
    topics: [],
    stars: response.stargazers_count,
    forks: response.forks_count,
    watchers: response.watchers_count,
    openIssues: response.open_issues_count,
    license: response.license?.spdx_id ?? null,
    visibility: response.visibility ?? 'public',
    defaultBranch: response.default_branch,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    pushedAt: response.pushed_at,
    size: response.size,
    hasReadme,
    hasPackageJson,
    hasLicense,
  }
}

function buildProjectStructure(
  items: GitHubTreeItem[],
  maxDepth: number = 3,
  maxChildrenPerDir: number = 24
): ProjectStructureNode[] {
  const root: ProjectStructureNode[] = []
  const pathMap = new Map<string, ProjectStructureNode>()
  const TOTAL_NODE_CAP = 400

  // Sort items by path for proper tree building
  const sorted = [...items].sort((a, b) => a.path.localeCompare(b.path))
  let count = 0

  for (const item of sorted) {
    if (count >= TOTAL_NODE_CAP) break
    const parts = item.path.split('/')
    if (parts.length > maxDepth + 1) continue

    const name = parts[parts.length - 1]
    const node: ProjectStructureNode = {
      name,
      path: item.path,
      type: item.type === 'tree' ? 'directory' : 'file',
      size: item.size,
    }

    pathMap.set(item.path, node)
    count++

    if (parts.length === 1) {
      root.push(node)
    } else {
      const parentPath = parts.slice(0, -1).join('/')
      const parent = pathMap.get(parentPath)
      if (parent) {
        if (!parent.children) parent.children = []
        if (parent.children.length < maxChildrenPerDir) {
          parent.children.push(node)
        }
      }
    }
  }

  return root
}

function detectTechStack(
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  languages: string[],
  configFiles: string[],
  packageJson: Record<string, unknown> | null
): TechStack {
  const allDeps = { ...dependencies, ...devDependencies }
  const frameworks: string[] = []
  const tools: string[] = []
  const runtimes: string[] = []

  // Detect frameworks
  for (const [dep, name] of Object.entries(FRAMEWORK_DEPS)) {
    if (allDeps[dep]) frameworks.push(name)
  }

  // Detect tools
  for (const [dep, name] of Object.entries(TOOL_DEPS)) {
    if (allDeps[dep]) tools.push(name)
  }

  // Detect runtimes
  for (const [dep, name] of Object.entries(RUNTIME_DEPS)) {
    if (allDeps[dep]) runtimes.push(name)
  }

  // Detect from config files
  if (configFiles.some((f) => f.includes('vite'))) tools.push('Vite')
  if (configFiles.some((f) => f.includes('webpack'))) tools.push('Webpack')
  if (configFiles.some((f) => f.includes('tailwind'))) tools.push('Tailwind CSS')
  if (configFiles.some((f) => f.includes('eslint'))) tools.push('ESLint')
  if (configFiles.some((f) => f.includes('prettier'))) tools.push('Prettier')

  // Deduplicate
  const uniqueFrameworks = [...new Set(frameworks)]
  const uniqueTools = [...new Set(tools)]
  const uniqueRuntimes = [...new Set(runtimes)]

  // Determine primary language
  const primary = languages[0] || 'Unknown'

  // Get unique languages
  const uniqueLanguages = [...new Set(languages)]

  // Detect Node.js from package.json engines or scripts
  if (packageJson) {
    const pkg = packageJson as Record<string, unknown>
    if (pkg.engines && typeof pkg.engines === 'object') {
      const engines = pkg.engines as Record<string, string>
      if (engines.node) uniqueRuntimes.push('Node.js')
      if (engines.deno) uniqueRuntimes.push('Deno')
      if (engines.bun) uniqueRuntimes.push('Bun')
    }
  }

  return {
    primary,
    frameworks: uniqueFrameworks,
    languages: uniqueLanguages,
    tools: uniqueTools,
    runtimes: [...new Set(uniqueRuntimes)],
  }
}

/** Parse a requirements.txt into a concise list of package names. */
function parseRequirements(content: string): string[] {
  const packages: string[] = []
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('-')) continue
    // Skip editable / URL installs, keep plain package specs
    if (line.startsWith('-e ') || line.startsWith('git+')) continue
    if (line.includes('://')) continue
    // Strip version specifiers and extras
    const name = line
      .split(/[=<>!~[;]/)[0]
      .trim()
      .replace(/\s+$/, '')
    if (name && !name.startsWith('_')) packages.push(name)
  }
  return [...new Set(packages)]
}

/** Extract variable names (and any leading comment) from an example env file. */
function parseEnvVariables(content: string): EnvVariable[] {
  const variables: EnvVariable[] = []
  let pendingDescription: string | undefined
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line) {
      pendingDescription = undefined
      continue
    }
    if (line.startsWith('#')) {
      const text = line.replace(/^#+\s*/, '').trim()
      if (text) pendingDescription = text
      continue
    }
    // Match NAME or NAME=value or NAME:value
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:[=:]\s*(.*))?$/)
    if (match) {
      variables.push({
        name: match[1],
        description: pendingDescription,
      })
      pendingDescription = undefined
    }
  }
  return variables
}

function extractDependencies(
  packageJson: Record<string, unknown> | null,
  pipDependencies: string[],
  otherDependencies: string[]
): DependencyInfo {
  if (!packageJson) {
    return {
      dependencies: {},
      devDependencies: {},
      scripts: {},
      pipDependencies,
      otherDependencies,
    }
  }

  const deps =
    packageJson.dependencies &&
    typeof packageJson.dependencies === 'object'
      ? (packageJson.dependencies as Record<string, string>)
      : {}

  const devDeps =
    packageJson.devDependencies &&
    typeof packageJson.devDependencies === 'object'
      ? (packageJson.devDependencies as Record<string, string>)
      : {}

  const scripts =
    packageJson.scripts && typeof packageJson.scripts === 'object'
      ? (packageJson.scripts as Record<string, string>)
      : {}

  return {
    dependencies: deps,
    devDependencies: devDeps,
    scripts,
    pipDependencies,
    otherDependencies,
  }
}

export async function analyzeRepository(
  repoUrl: string
): Promise<ProjectContext> {
  // Parse URL
  const parsed = parseRepoUrl(repoUrl)
  if (!parsed) {
    throw new ApiError('Invalid GitHub repository URL', 'INVALID_URL', 400)
  }

  const { owner, repo } = parsed

  // Fetch repo metadata
  const repoResponse = await fetchRepo(owner, repo)

  // A repo with no bytes is effectively empty — surface a clear error.
  if (repoResponse.size === 0) {
    throw new ApiError(
      'Repository is empty',
      'EMPTY_REPO',
      422
    )
  }

  // Fetch file tree
  const treeResponse = await fetchFileTree(
    owner,
    repo,
    repoResponse.default_branch
  )

  if (treeResponse.truncated) {
    // Tree is too large, we'll work with what we have
  }

  // Find priority files
  const treeItems = treeResponse?.tree || []
  const filesToFetch: string[] = []

  for (const priorityFile of PRIORITY_FILES) {
    if (treeItems.some((item) => item.path === priorityFile)) {
      filesToFetch.push(priorityFile)
    }
  }

  for (const envFile of ENV_FILES) {
    if (treeItems.some((item) => item.path === envFile)) {
      filesToFetch.push(envFile)
    }
  }

  // Find config files — only shallow ones (root or one level deep in src/
  // or config dirs) to avoid picking up test fixtures and nested examples.
  const foundConfigFiles: string[] = []
  for (const item of treeItems) {
    const parts = item.path.split('/')
    if (parts.length > 2) continue
    if (parts.length === 2 && parts[0] !== 'src' && parts[0] !== '.config' && parts[0] !== 'config') continue
    const fileName = parts[parts.length - 1]
    if (
      CONFIG_FILES.some(
        (config) => fileName === config || fileName.startsWith(config + '.')
      )
    ) {
      foundConfigFiles.push(item.path)
    }
  }

  // Find entry points
  const foundEntryPoints: string[] = []
  for (const entryPoint of ENTRY_POINTS) {
    if (treeItems.some((item) => item.path === entryPoint)) {
      foundEntryPoints.push(entryPoint)
    }
  }

  // Find README
  const readmeItem = treeItems.find(
    (item) =>
      item.path.toLowerCase() === 'readme.md' ||
      item.path.toLowerCase() === 'readme.rst' ||
      item.path.toLowerCase() === 'readme.txt'
  )

  // Fetch all needed files in parallel
  const fetchPromises: Promise<[string, string | null]>[] = []

  for (const filePath of filesToFetch) {
    fetchPromises.push(
      fetchFileContent(owner, repo, filePath).then((content) => [
        filePath,
        content,
      ])
    )
  }

  if (readmeItem) {
    fetchPromises.push(
      fetchFileContent(owner, repo, readmeItem.path).then((content) => [
        readmeItem.path,
        content,
      ])
    )
  }

  // Fetch languages safely (don't fail analysis if language call fails)
  fetchPromises.push(
    fetchLanguages(owner, repo)
      .then((langs) => {
        const sorted = Object.entries(langs || {}).sort(([, a], [, b]) => b - a)
        return ['__languages__', JSON.stringify(sorted.map(([l]) => l))] as [
          string,
          string | null,
        ]
      })
      .catch(() => ['__languages__', JSON.stringify([])] as [string, string | null])
  )

  const results = await Promise.all(fetchPromises)

  // Manifests for ecosystems other than Node (NAME-only detection)
  const OTHER_ECOSYSTEM_MANIFESTS = [
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
    'Gemfile',
    'composer.json',
  ]

  // Process results
  let packageJson: Record<string, unknown> | null = null
  let envExample: string | undefined
  let readmeContent: string | undefined
  let requirementsContent: string | undefined
  const otherManifests: string[] = []
  let languages: string[] = []

  for (const [path, content] of results) {
    if (path === '__languages__' && content) {
      languages = JSON.parse(content)
    } else if (path === 'package.json' && content) {
      try {
        packageJson = JSON.parse(content)
      } catch {
        // Invalid JSON — ignore
      }
    } else if (path === 'requirements.txt' && content) {
      requirementsContent = content
    } else if (OTHER_ECOSYSTEM_MANIFESTS.includes(path)) {
      otherManifests.push(path)
    } else if (ENV_FILES.includes(path) && content) {
      envExample = content
    } else if (readmeItem && path === readmeItem.path && content) {
      readmeContent = content
    }
  }

  // Python dependencies from requirements.txt
  const pipDependencies = requirementsContent
    ? parseRequirements(requirementsContent)
    : []

  // Build repo info
  const repoInfo = mapRepoResponse(
    repoResponse,
    languages,
    !!readmeContent,
    !!packageJson,
    !!repoResponse.license
  )

  // Build project structure
  const projectStructure = buildProjectStructure(treeItems)

  // Extract dependencies
  const dependencies = extractDependencies(
    packageJson,
    pipDependencies,
    otherManifests
  )

  // Detect tech stack
  const techStack = detectTechStack(
    dependencies.dependencies,
    dependencies.devDependencies,
    languages,
    foundConfigFiles,
    packageJson
  )

  // Get source files
  const sourceFiles = treeItems
    .filter((item) => {
      if (item.type === 'tree') return false
      const ext = item.path.split('.').pop()?.toLowerCase()
      return ['ts', 'tsx', 'js', 'jsx', 'vue', 'svelte', 'py', 'rs', 'go'].includes(ext || '')
    })
    .slice(0, 50)
    .map((item) => item.path)

  return {
    repo: repoInfo,
    projectStructure,
    techStack,
    dependencies,
    existingReadme: readmeContent,
    envExample,
    envVariables: envExample ? parseEnvVariables(envExample) : [],
    entryPoints: foundEntryPoints,
    configFiles: foundConfigFiles,
    sourceFiles,
  }
}