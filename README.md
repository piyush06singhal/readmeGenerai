# README

An AI-powered README generator. Paste a public GitHub repository URL, and README analyzes the codebase, detects its tech stack and dependencies, and writes a tailored, accurate `README.md` — complete with a 3D landing page, a split-pane markdown editor, and one-click copy / download.

![vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white) ![react](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![typescript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white) ![tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?logo=tailwindcss&logoColor=white) ![Node](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)

## Features

- 🧠 **Real repository analysis** — fetches the GitHub file tree, package manifests, language stats, scripts, and existing README to build an accurate picture of the project.
- ✍️ **AI-generated READMEs** — generates a structured, professional README from the analyzed context, in three styles: **Standard**, **Detailed**, and **Minimal**.
- 🎛️ **Markdown workspace** — responsive split-pane editor: CodeMirror 6 for editing with live preview via `react-markdown` + GFM, syntax-highlighted code blocks, and a quality score that updates as you type.
- 📋 **Export** — copy to clipboard or download `README.md` in one click.
- 🪟 **Rich 3D landing page** — Three.js / React Three Fiber scene with postprocessing effects and a Framer Motion animation layer.
- 🔒 **Server-side secrets** — the AI provider key and model live only on the server; the browser never touches them.

## Tech Stack

| Category       | Technology                                             |
|----------------|--------------------------------------------------------|
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS v4            |
| 3D & motion    | Three.js, React Three Fiber, Drei, postprocessing, Framer Motion |
| Editor         | CodeMirror 6 (`@uiw/react-codemirror`), react-markdown, remark-gfm, rehype-sanitize, rehype-highlight |
| Server         | Node.js (type-stripped TypeScript), GitHub REST API, Groq Chat Completions |
| Concurrency     | React Router 7 route-level code splitting (`lazy` + `Suspense`) |

## Getting Started

### Prerequisites

- **Node.js 20+** (the server runs on native type-stripping)
- A **Groq API key** (<https://console.groq.com>) — required for the AI generation endpoint only; repo analysis works without it.

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file with your Groq key
cp .env.example .env   # then edit .env
```

`.env` (this file is gitignored and must never be committed):

```
GROQ_API_KEY=
# Optional:
# GROQ_MODEL=llama-3.3-70b-versatile
# GITHUB_TOKEN=your_github_token  # Optional: increases GitHub API limit from 60 to 5,000 req/hr
# GROQ_BASE_URL=https://api.groq.com/openai/v1
# TRUST_PROXY=true  # only when running behind a trusted reverse proxy
```

> The default model is `llama-3.3-70b-versatile`. You can override it with `GROQ_MODEL`.

### Running the dev server

```bash
npm run dev
# → http://localhost:3000
```

The Vite dev server mounts the API middleware at `/api` and injects `.env` values server-side, so the key never reaches the client bundle. Open the app, paste a public repo URL, and follow Analyze → Generate → Edit → Download.

### Other scripts

| Script             | Description                                         |
|--------------------|-----------------------------------------------------|
| `npm run build`    | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview`  | Preview the production build locally                |
| `npm run server`   | Run the standalone production server (`server.ts`)  |
| `npm run lint`     | Lint with Oxlint                                    |
| `npm test`         | Run the Node test suite                             |

### Testing

Run the fast verification suite before opening a pull request:

```bash
npm test
npm run build
npm run lint
```

The current tests cover GitHub URL validation, repository extraction, README
heading aliases, and Markdown code-fence validation. Keep pure parsing,
validation, badge, and quality-analysis logic covered with unit tests. Add
browser-level tests for the analyze, generate, edit, copy, and download flows
when deploying this as a public service.

### Accessibility

The interface supports keyboard focus styles, labeled icon controls, live
loading and error announcements, sanitized Markdown previews, responsive
layouts, and `prefers-reduced-motion`. Decorative landing-page controls are
intentionally non-interactive; the real copy and download controls are exposed
in the README workspace.

### Deploying to Vercel

This repository includes a native Vercel setup with Vercel Serverless Functions (`api/`) and `vercel.json` rewrites.

1. Push your repository to GitHub.
2. Import the repository into **Vercel**.
3. In your Vercel Project Settings under **Environment Variables**, add:
   - `GROQ_API_KEY`: Your Groq API Key
   - `GROQ_MODEL` *(Optional)*: `llama-3.3-70b-versatile`
   - `GITHUB_TOKEN` *(Optional)*: GitHub Personal Access Token (recommended to avoid GitHub rate limits on shared Vercel serverless IPs)
4. Click **Deploy**. Vercel will automatically build the static frontend (`npm run build`) and host the API routes on Vercel Serverless Functions (`/api/analyze`, `/api/generate`, `/api/file`).

### Running standalone in Node.js production

Build, then launch the standalone Node.js server, which serves `dist/` and the API together:

```bash
npm run build
node --env-file=.env server.ts
# → http://localhost:3000
```

## How It Works

1. **Analyze** — `POST /api/analyze` fetches repo metadata, the recursive git tree, language stats, and priority files (`package.json`, `requirements.txt`, config files, `.env.example`, existing README).
2. **Context** — the analysis is reduced to a sanitized, size-budgeted textual context (metadata, tech stack, dependencies, scripts, structure, environment variable names — never secret values).
3. **Generate** — `POST /api/generate` sends that context to Groq with a documentation-writer system prompt and returns clean, unwrapped Markdown.
4. **Edit** — the workspace lets you refine the result with live preview, quality scoring, and export.

## API Reference

All endpoints are JSON. The `ProjectContext` returned by `analyze` is a complete description of the repository.

### `POST /api/analyze`

Analyzes a public GitHub repository.

```json
{ "repoUrl": "https://github.com/owner/repo" }
```

**200** → returns the `ProjectContext` (repo info, project structure, tech stack, dependencies, scripts, environment variables, source files). **400** on an invalid URL, **404** on missing repo, **422** on an empty repository.

### `POST /api/generate`

Generates a README from an analyzed context.

```json
{
  "projectContext": { "…": "…" },
  "style": "standard"     // "standard" | "detailed" | "minimal"
}
```

**200** → `{ "markdown": "# …" }`. Provider and configuration errors are returned as structured `{ message, code, status }` responses.

## Security

- The Groq API key and model are read **server-side only** from environment variables and are never bundled into the client or logged.
- The analysis context is sanitized before it is sent to the AI provider: no secrets, lockfiles, binaries, or build artifacts.
- Repository content fetch sizes are bounded, and the tree walk is depth- and count-limited.
- Previewed Markdown is sanitized (`rehype-sanitize` + a safe-URL guard) to strip dangerous HTML/XSS.
- Incoming request bodies are size-limited (512 KB).
- API requests are rate-limited per process; set `TRUST_PROXY=true` only when a trusted proxy supplies client IPs.

For multi-instance production deployments, move rate limiting to a shared store
or edge provider. The built-in limiter is intended for a single server process.

## Project Structure

```
├── src/                  # React client
│   ├── pages/            # Landing, About, Analyze (workspace)
│   ├── components/       # UI, 3D scene, workspace editor
│   ├── services/         # API client for /api/*
│   ├── hooks/            # Document state, quality scoring
│   └── types/            # Shared TypeScript types
├── server/               # Node server middleware (type-stripped TS)
│   ├── index.ts          # API route handlers
│   ├── analysis.ts       # Repo analysis pipeline
│   ├── ai.ts             # Groq generation (key + model config live here)
│   ├── github.ts         # GitHub REST client
│   └── types.ts
├── server.ts             # Standalone production server entry point
├── vite.config.ts        # Vite config + API dev middleware
└── dist/                 # Production build (generated)
```

## License

This project is private / unlicensed unless a license file is added.
