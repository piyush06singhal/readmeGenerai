import type { ReadmeSectionId } from '../../types/readme.js';

export interface ParsedHeading {
  level: number;
  text: string;
  lineIndex: number;
}

export function normalizeHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/#/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[:：.!?；;，,]+$/g, '')
    .trim();
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;

export function parseHeadings(markdown: string): ParsedHeading[] {
  const lines = markdown.split('\n');
  const headings: ParsedHeading[] = [];
  lines.forEach((line, lineIndex) => {
    const m = line.match(HEADING_RE);
    if (m) {
      headings.push({ level: m[1].length, text: m[2].trim(), lineIndex });
    }
  });
  return headings;
}

/**
 * Extract the body of a section: everything between the given heading and the
 * next heading of the same or higher level (sub-headings are included).
 */
export function extractSectionBody(markdown: string, heading: ParsedHeading): string {
  const lines = markdown.split('\n');
  const body: string[] = [];
  for (let i = heading.lineIndex + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (m) {
      if (m[1].length <= heading.level) break;
    }
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}

// Allowed heading aliases (normalized) per section. These let a README use a
// different but equivalent heading without being flagged as missing.
export const SECTION_ALIASES: Partial<Record<ReadmeSectionId, string[]>> = {
  overview: [
    'overview',
    'introduction',
    'about',
    'about the project',
    'description',
    'project description',
    'summary',
    'what is',
    'what is this',
  ],
  features: [
    'features',
    'key features',
    'highlights',
    "what's inside",
    "what's included",
    'capabilities',
    'main features',
    'why',
    'why this',
  ],
  techStack: [
    'tech stack',
    'technologies',
    'built with',
    'technology',
    'stack',
    'languages & tools',
    'languages and tools',
    'libraries',
    'dependencies',
    'tech',
    'tools',
  ],
  installation: [
    'installation',
    'install',
    'installing',
    'setup',
    'set up',
    'getting started',
    'quick start',
    'prerequisites',
    'requirements',
    'run locally',
    'local setup',
    'local development',
    'getting started with',
  ],
  usage: [
    'usage',
    'how to use',
    'how to run',
    'how it works',
    'examples',
    'example',
    'quick start',
    'getting started',
    'commands',
    'consumer guide',
    'using',
    'how to',
  ],
  envVariables: [
    'environment variables',
    'environment',
    'env',
    'env variables',
    'environment config',
    'configuration',
    'environment setup',
  ],
  projectStructure: [
    'project structure',
    'directory structure',
    'file structure',
    'folder structure',
    'structure',
    'file layout',
    'project layout',
  ],
  contributing: [
    'contributing',
    'contribution',
    'contributions',
    'how to contribute',
    'community',
    'development',
    'developing',
    'code of conduct',
  ],
  license: ['license', 'licence', 'licensing', 'legal', 'copyright', 'license information'],
  api: [
    'api',
    'api reference',
    'api documentation',
    'api docs',
    'endpoints',
    'rest api',
    'http api',
    'web api',
    'api endpoints',
    'developer api',
    'graphql',
  ],
  deployment: [
    'deployment',
    'deploy',
    'deploying',
    'hosting',
    'production',
    'docker',
    'clever cloud',
    'vercel',
    'netlify',
  ],
};

function aliasMatches(normalized: string, alias: string): boolean {
  if (normalized === alias) return true;
  if (normalized.startsWith(alias + ' ')) return true;
  if (normalized.startsWith(alias + ':')) return true;
  return false;
}

export function findHeadingForSection(
  headings: ParsedHeading[],
  id: ReadmeSectionId,
): ParsedHeading | undefined {
  const aliases = SECTION_ALIASES[id];
  if (!aliases) return undefined;
  return headings.find((h) => aliases.some((a) => aliasMatches(normalizeHeading(h.text), a)));
}

/* ── Content signal helpers ────────────────────────────────────────────── */

export function countCodeFences(text: string): number {
  return (text.match(/```/g) || []).length;
}
export function hasCodeFence(text: string): boolean {
  return countCodeFences(text) > 0;
}
export function hasInlineCode(text: string): boolean {
  return /`[^`\n]+`/.test(text);
}
export function hasCommand(text: string): boolean {
  return /(^|\n)\s*(\$|>)\s+\S|npm\s+(install|run|start|dev|build|ci|test)|yarn\s+(install|add|run|start|dev|build|test)|pnpm\s+(install|add|run|start|dev|build|test)|npx\s+|npm\s+init|pip\s+(install|import)|pip3\s+|pipenv\s+|poetry\s+|cargo\s+(build|run|install|test)|go\s+(build|run|install|get|mod)|brew\s+install|apt(-get)?\s+install|git\s+clone|docker\s+(run|build|compose)|python(\d+)?\s+(app|main|manage|server|index)\.py|pnpm\/npm\/yarn/i.test(
    text,
  );
}
export function hasSetupCommand(text: string): boolean {
  return /(^|\n)\s*(\$|>)\s+\S{3,}|npm\s+(install|ci)|yarn\s+(install)|pnpm\s+install|pip\s+install|pipenv\s+install|poetry\s+install|cargo\s+build|go\s+(build|mod\s+download)|bundle\s+install|mix\s+deps\.get|composer\s+install|gem\s+install/.test(
    text,
  );
}
export function hasRunCommand(text: string): boolean {
  return /(^|\n)\s*(\$|>)\s+\S{3,}|npm\s+(run|start|dev|build)|yarn\s+(run|start|dev|build)|pnpm\s+(run|start|dev|build)|python(\d+)?\s+(app|main|manage|server|index)\.py|cargo\s+run|go\s+run|docker\s+run|node\s+\S+\.(js|mjs|ts)/.test(
    text,
  );
}
export function hasBullets(text: string): boolean {
  return /(^|\n)\s*[-*+•]\s+\S/.test(text);
}
export function hasNumberedList(text: string): boolean {
  return /(^|\n)\s*\d+[.)]\s+\S/.test(text);
}
export function hasTable(text: string): boolean {
  return /(^|\n)\|[\s\S]*\|[^\n]*\n\|[\s:-]*\|/.test(text);
}
export function hasKeyValuePair(text: string): boolean {
  return /[A-Za-z_][A-Za-z0-9_]*\s*=\s*["']?[^"'\s]{1,}/.test(text);
}
export function hasLink(text: string): boolean {
  return /\[[^\]]+\]\([^)\s]+\)/.test(text);
}
export function hasBadge(text: string): boolean {
  return /!\[[^\]]*\]\([^)]*shields\.io/.test(text);
}
export function hasTreeChars(text: string): boolean {
  return /[├└│┌┐]/.test(text);
}
export function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

/* ── Structural / markdown checks ──────────────────────────────────────── */

export function fencesAreClosed(markdown: string): boolean {
  return countCodeFences(markdown) % 2 === 0;
}

// Returns true if a plausible top-level H1 title exists near the top.
export function hasTopLevelTitle(headings: ParsedHeading[]): boolean {
  return headings.length > 0 && headings[0].level === 1;
}

export function getTopLevelTitle(headings: ParsedHeading[]): string | undefined {
  if (!hasTopLevelTitle(headings)) return undefined;
  return headings[0].text;
}

const GENERIC_TITLES = new Set(['readme', 'readme.md', 'read me', 'my project', 'project', 'the project', 'title']);

export function isGenericTitle(title: string): boolean {
  return GENERIC_TITLES.has(normalizeHeading(title));
}

// Detect jumps in heading hierarchy (e.g. H1 -> H3 with no H2 in between).
export function findHierarchyIssues(headings: ParsedHeading[]): string[] {
  const issues: string[] = [];
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const curr = headings[i];
    if (curr.level - prev.level > 1) {
      issues.push(
        `Heading "${curr.text}" (H${curr.level}) skips a level after "${prev.text}" (H${prev.level}).`,
      );
    }
  }
  return issues;
}

// Detect malformed markdown links, e.g. empty destinations or spaces.
export function findLinkIssues(markdown: string): string[] {
  const issues: string[] = [];
  const re = /\[[^\]]+\]\(\s*([^)]*)\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const dest = m[1];
    if (dest === '' || /\s/.test(dest)) {
      issues.push(`Malformed link in markdown: "${m[0].slice(0, 60)}".`);
    }
  }
  return issues;
}
