import type {
  ProjectContext,
} from '../../types/index.js';
import type {
  ReadmeQualityResult,
  ReadmeSectionId,
  ReadmeSectionResult,
  ReadmeSectionStatus,
  ReadmeSuggestion,
  MarkdownIssue,
  Applicability,
} from '../../types/readme.js';
import {
  parseHeadings,
  extractSectionBody,
  findHeadingForSection,
  countCodeFences,
  countWords,
  hasCodeFence,
  hasInlineCode,
  hasCommand,
  hasSetupCommand,
  hasRunCommand,
  hasNumberedList,
  hasTable,
  hasKeyValuePair,
  hasBadge,
  hasTreeChars,
  fencesAreClosed,
  getTopLevelTitle,
  isGenericTitle,
  findHierarchyIssues,
  findLinkIssues,
  type ParsedHeading,
} from './sectionDetector.js';

const WEIGHTED: ReadmeSectionId[] = [
  'overview',
  'features',
  'techStack',
  'installation',
  'usage',
  'envVariables',
  'projectStructure',
  'contributing',
  'license',
];

const SUPPLEMENTAL: ReadmeSectionId[] = ['api', 'deployment'];

function countBullets(text: string): number {
  return (text.match(/(^|\n)\s*[-*+•]\s+\S/g) || []).length;
}

// Text that sits between a top-level title and the first sub-heading — the
// common "description right under the title" pattern with no Overview heading.
function getIntroBlock(markdown: string, headings: ParsedHeading[]): string {
  const firstSub = headings.find((h) => h.level >= 2);
  const cut = firstSub ? firstSub.lineIndex : markdown.split('\n').length;
  const lines = markdown.split('\n').slice(0, cut);
  return lines
    .filter((l) => !/^\s*#{1,6}\s/.test(l))
    .join('\n')
    .trim();
}

function classifyProjectType(ctx: ProjectContext): string {
  const fw = (ctx.techStack.frameworks || []).map((f) => f.toLowerCase().trim());
  const tools = (ctx.techStack.tools || []).map((t) => t.toLowerCase().trim());
  const deps = Object.keys(ctx.dependencies.dependencies);
  const devDeps = Object.keys(ctx.dependencies.devDependencies);
  const joined = [...fw, ...tools, ...deps, ...devDeps].join(' ');

  if (/express|fastify|nestjs|\bnest\b|koa|hapi|django|flask|fastapi|spring\b|rails|laravel|phoenix|actix|rocket|gin\b|echo\b|graphql|grpc/i.test(joined)) {
    return 'Backend / API';
  }
  if (/react|vue\b|angular|svelte|next\.?js|nextjs|nuxt|gatsby|astro|vite|webpack|parcel|tailwind/i.test(joined)) {
    return 'Frontend application';
  }
  return 'Project / library';
}

function sectionApplicability(
  id: ReadmeSectionId,
  ctx: ProjectContext,
  projectType: string,
): Applicability {
  switch (id) {
    case 'overview':
    case 'features':
    case 'installation':
    case 'usage':
    case 'title':
      return 'required';
    case 'techStack':
    case 'projectStructure':
    case 'contributing':
      return 'recommended';
    case 'envVariables':
      return ctx.envVariables?.length || ctx.envExample ? 'required' : 'not-applicable';
    case 'license':
      return ctx.repo.license || ctx.repo.hasLicense ? 'required' : 'not-applicable';
    case 'api':
      return projectType.includes('Backend') || projectType.includes('library') ? 'recommended' : 'not-applicable';
    case 'deployment':
      return projectType.includes('Frontend') ? 'recommended' : 'not-applicable';
  }
}

interface Signals {
  signal: 'strong' | 'weak' | 'none';
  evidence: string[];
  missing: string[];
}

function evaluateOverview(body: string): Signals {
  const words = countWords(body);
  if (words >= 24) return { signal: 'strong', evidence: [`${words} words of description`], missing: [] };
  if (words >= 6) return { signal: 'weak', evidence: [`${words} words of description`], missing: ['Consider expanding the overview with a fuller description.'] };
  return { signal: 'none', evidence: [], missing: ['Add a meaningful overview paragraph.'] };
}

function evaluateFeatures(body: string): Signals {
  const bullets = countBullets(body);
  const words = countWords(body);
  if (bullets >= 2 || words >= 40) {
    return { signal: 'strong', evidence: [`${bullets} feature bullets`, `${words} words`], missing: [] };
  }
  if (bullets >= 1 || words >= 8) {
    return { signal: 'weak', evidence: [`${bullets} feature bullets`, `${words} words`], missing: ['List the main features as bullets or short entries.'] };
  }
  return { signal: 'none', evidence: [], missing: ['Describe the key features with bullet points.'] };
}

function evaluateTechStack(body: string): Signals {
  const bullets = countBullets(body);
  const words = countWords(body);
  const commaList = /,\s*\w+/.test(body);
  if (hasBadge(body) || hasTable(body) || bullets >= 2 || words >= 12 || commaList) {
    return { signal: 'strong', evidence: ['badges', 'comma-separated list', `${bullets} bullets`, `${words} words`].filter(Boolean), missing: [] };
  }
  if (bullets >= 1 || words >= 4) {
    return { signal: 'weak', evidence: [`${words} words`], missing: ['List the technologies as a structured list, table, or badges.'] };
  }
  return { signal: 'none', evidence: [], missing: ['Document the technologies this project is built with.'] };
}

function evaluateInstallation(body: string): Signals {
  const words = countWords(body);
  if (hasSetupCommand(body) || (hasCodeFence(body) && hasCommand(body))) {
    return { signal: 'strong', evidence: ['setup command detected', 'code block'], missing: [] };
  }
  if (hasInlineCode(body) || words >= 8) {
    return { signal: 'weak', evidence: [`${words} words`], missing: ['Include exact install/setup commands for getting started.'] };
  }
  return { signal: 'none', evidence: [], missing: ['Add a concrete setup command (e.g. npm install / pip install).'] };
}

function evaluateUsage(body: string): Signals {
  const words = countWords(body);
  if (hasRunCommand(body) || hasCommand(body) || hasCodeFence(body) || hasInlineCode(body) || words >= 24) {
    return { signal: 'strong', evidence: ['run command', 'code example', `${words} words`].filter(Boolean), missing: [] };
  }
  if (words >= 6) {
    return { signal: 'weak', evidence: [`${words} words`], missing: ['Add a concrete usage example or run command.'] };
  }
  return { signal: 'none', evidence: [], missing: ['Show how to actually use the project with an example.'] };
}

function evaluateEnvVariables(body: string): Signals {
  const words = countWords(body);
  if (hasKeyValuePair(body) || hasTable(body) || (hasCodeFence(body) && hasInlineCode(body))) {
    return { signal: 'strong', evidence: ['variable names', 'key=value entries'].filter(Boolean), missing: [] };
  }
  if (words >= 6) {
    return { signal: 'weak', evidence: [`${words} words`], missing: ['Document each required variable and its meaning.'] };
  }
  return { signal: 'none', evidence: [], missing: ['List the environment variables and their purpose.'] };
}

// Detects a code fence whose lines look like a directory listing (paths ending
// with /, indented subdirectories, or tree-drawing characters).
function looksLikeDirectoryTree(body: string): boolean {
  if (hasTreeChars(body)) return true;
  if (!hasCodeFence(body)) return false;
  const lines = body.split('\n').filter((l) => /^\s*[│├└]/.test(l) || /\/\s*$/.test(l) || /\/[a-z]/i.test(l));
  return lines.length >= 3;
}

function evaluateProjectStructure(body: string): Signals {
  const bullets = countBullets(body);
  if (looksLikeDirectoryTree(body) || hasTable(body) || bullets >= 3) {
    return { signal: 'strong', evidence: ['directory tree', `${bullets} bullets`, 'table'].filter(Boolean), missing: [] };
  }
  if (bullets >= 1 || hasInlineCode(body)) {
    return { signal: 'weak', evidence: [`${bullets} bullets`], missing: ['Show the layout with a tree or a concise list of key folders.'] };
  }
  return { signal: 'none', evidence: [], missing: ['Document the project structure.'] };
}

function evaluateContributing(body: string): Signals {
  const bullets = countBullets(body);
  const words = countWords(body);
  if (bullets >= 2 || hasNumberedList(body) || words >= 20) {
    return { signal: 'strong', evidence: [`${bullets} bullets`, 'steps'].filter(Boolean), missing: [] };
  }
  if (bullets >= 1 || words >= 6) {
    return { signal: 'weak', evidence: [`${words} words`], missing: ['Explain how others can contribute.'] };
  }
  return { signal: 'none', evidence: [], missing: ['Add a short contributing guide.'] };
}

function evaluateLicense(body: string): Signals {
  const words = countWords(body);
  if (/(MIT|Apache[- ]2\.0|GPL|BSD|ISC|MPL|Unlicense|CC0)/i.test(body) || /\[.*\]\(.*[Ll]icense\)/.test(body)) {
    return { signal: 'strong', evidence: ['license mentioned'], missing: [] };
  }
  if (words >= 6) {
    return { signal: 'weak', evidence: [`${words} words`], missing: ['Name the license or link to the LICENSE file.'] };
  }
  return { signal: 'none', evidence: [], missing: ['State the license or link to the LICENSE file.'] };
}

function evaluateApi(body: string): Signals {
  const words = countWords(body);
  if (hasCodeFence(body) || hasTable(body) || /(^|\n)\s*\/[a-z][a-z0-9/:_-]*/im.test(body) || (hasInlineCode(body) && words >= 4)) {
    return { signal: 'strong', evidence: ['endpoint', 'code example', 'table'].filter(Boolean), missing: [] };
  }
  if (words >= 8) {
    return { signal: 'weak', evidence: [`${words} words`], missing: ['Document endpoints and their request/response shape.'] };
  }
  return { signal: 'none', evidence: [], missing: ['Document the API endpoints.'] };
}

function evaluateDeployment(body: string): Signals {
  const words = countWords(body);
  if (hasCommand(body) || hasCodeFence(body) || words >= 10) {
    return { signal: 'strong', evidence: ['deploy command', `${words} words`].filter(Boolean), missing: [] };
  }
  if (words >= 5) {
    return { signal: 'weak', evidence: [`${words} words`], missing: ['Explain how to build and deploy the app.'] };
  }
  return { signal: 'none', evidence: [], missing: ['Add deployment instructions.'] };
}

const EVALUATORS: Partial<Record<ReadmeSectionId, (body: string) => Signals>> = {
  overview: evaluateOverview,
  features: evaluateFeatures,
  techStack: evaluateTechStack,
  installation: evaluateInstallation,
  usage: evaluateUsage,
  envVariables: evaluateEnvVariables,
  projectStructure: evaluateProjectStructure,
  contributing: evaluateContributing,
  license: evaluateLicense,
  api: evaluateApi,
  deployment: evaluateDeployment,
};

const LABELS: Record<ReadmeSectionId, string> = {
  title: 'Project Title',
  overview: 'Overview',
  features: 'Features',
  techStack: 'Tech Stack',
  installation: 'Installation',
  usage: 'Usage',
  envVariables: 'Environment Variables',
  projectStructure: 'Project Structure',
  contributing: 'Contributing',
  license: 'License',
  api: 'API Reference',
  deployment: 'Deployment',
};

function statusFromSignals(signal: Signals): { status: ReadmeSectionStatus; evidence: string[]; missing: string[] } {
  if (signal.signal === 'strong') return { status: 'complete', evidence: signal.evidence, missing: [] };
  if (signal.signal === 'weak') return { status: 'partial', evidence: [], missing: signal.missing };
  // A 'none' signal (no meaningful content, e.g. an empty section body) is a
  // genuinely missing section, not merely partial.
  return { status: 'missing', evidence: [], missing: signal.missing };
}

function analyzeTitle(headings: ParsedHeading[]): ReadmeSectionResult {
  const base = {
    id: 'title' as const,
    label: LABELS.title,
    weight: 0,
    applicability: 'required' as Applicability,
    matchedHeading: undefined as string | undefined,
    evidence: [] as string[],
    missing: [] as string[],
    earned: 0,
  };
  const title = getTopLevelTitle(headings);
  if (!title) {
    return { ...base, status: 'missing', missing: ['Add a clear project title (a single top-level heading).'] };
  }
  if (isGenericTitle(title)) {
    return { ...base, status: 'partial', matchedHeading: title, missing: ['The title is generic — use the project name.'] };
  }
  return { ...base, status: 'complete', matchedHeading: title, evidence: [`Title: "${title}"`] };
}

function analyzeGlobalSection(
  id: ReadmeSectionId,
  markdown: string,
  headings: ParsedHeading[],
  applicability: Applicability,
): ReadmeSectionResult {
  const base = {
    id,
    label: LABELS[id],
    weight: 0,
    applicability,
    matchedHeading: undefined as string | undefined,
    evidence: [] as string[],
    missing: [] as string[],
    earned: 0,
  };

  if (applicability === 'not-applicable') {
    return { ...base, status: 'not-applicable' };
  }

  const evaluator = EVALUATORS[id];
  const heading = findHeadingForSection(headings, id);

  if (!heading) {
    // Overview special case: when there is no dedicated heading, check the
    // intro block (text between title and first sub-heading) for a meaningful
    // description. This handles the very common "description under the title"
    // pattern without requiring a heading.
    if (id === 'overview') {
      const intro = getIntroBlock(markdown, headings);
      const words = countWords(intro);
      if (words >= 6) {
        const signals = evaluator!(intro);
        const { status, evidence, missing: miss } = statusFromSignals(signals);
        return { ...base, status, matchedHeading: '(intro paragraph)', evidence, missing: miss };
      }
      // Even a short intro is better than "missing" — treat as partial.
      if (words > 0) {
        return { ...base, status: 'partial', evidence: [`${words} word intro paragraph`], missing: ['Expand the overview with a fuller description.'] };
      }
    }
    const probe = evaluator ? evaluator('') : { signal: 'none' as const, evidence: [], missing: [] };
    return { ...base, status: 'missing', missing: probe.missing };
  }

  const body = extractSectionBody(markdown, heading);
  const signals = evaluator ? evaluator(body) : { signal: 'strong' as const, evidence: [body], missing: [] };
  const { status, evidence, missing } = statusFromSignals(signals);
  return { ...base, status, matchedHeading: heading.text, evidence, missing };
}

function computeEarned(status: ReadmeSectionStatus, weight: number): number {
  if (status === 'complete') return weight;
  if (status === 'partial') return Math.round(weight * 0.5);
  return 0;
}

function buildMarkdownIssues(markdown: string, headings: ParsedHeading[], titleSection: ReadmeSectionResult): MarkdownIssue[] {
  const issues: MarkdownIssue[] = [];
  if (titleSection.status === 'missing') {
    issues.push({ id: 'title-missing', severity: 'warning', message: 'README has no top-level project title.' });
  } else if (titleSection.status === 'partial') {
    issues.push({ id: 'title-generic', severity: 'info', message: 'The project title is generic or empty.' });
  }
  if (!fencesAreClosed(markdown)) {
    issues.push({ id: 'unclosed-fence', severity: 'warning', message: 'A fenced code block appears to be unclosed.' });
  }
  const words = countWords(markdown);
  if (words < 60) {
    issues.push({ id: 'too-short', severity: 'info', message: `README is quite short (${words} words).` });
  }
  for (const h of findHierarchyIssues(headings)) {
    issues.push({ id: 'hierarchy', severity: 'info', message: h });
  }
  for (const link of findLinkIssues(markdown)) {
    issues.push({ id: 'link', severity: 'warning', message: link });
  }
  return issues;
}

function suggestionForSection(section: ReadmeSectionResult, ctx: ProjectContext): ReadmeSuggestion[] {
  if (section.status === 'not-applicable' || section.status === 'complete') return [];
  const severity = section.applicability === 'required' ? 'critical' : 'warning';
  const base: ReadmeSuggestion = {
    id: `${section.id}-${section.status}`,
    severity,
    message: section.status === 'missing' ? `Add a ${section.label.toLowerCase()} section` : `Improve the ${section.label.toLowerCase()} section`,
    sectionId: section.id,
    reason: section.missing[0] ?? `Validation detected the section is ${section.status}.`,
  };
  const out: ReadmeSuggestion[] = [base];

  // Repository-aware, evidence-based suggestions.
  if (section.id === 'envVariables' && (ctx.envVariables?.length || ctx.envExample)) {
    out.push({
      id: 'env-document',
      severity,
      message: 'Document the environment variables required by this project',
      sectionId: 'envVariables',
      reason: `The repository ships an environment file (.env.example) with variables, but the README does not document them.`,
    });
  }
  if (section.id === 'usage') {
    const scripts = Object.keys(ctx.dependencies.scripts || {});
    const notable = ['dev', 'start', 'build', 'test', 'serve'].filter((s) => scripts.includes(s));
    if (notable.length > 0) {
      out.push({
        id: 'usage-scripts',
        severity,
        message: 'Add commands for running the project locally',
        sectionId: 'usage',
        reason: `The project defines scripts (${notable.join(', ')}) but the README lacks usage instructions.`,
      });
    }
  }
  if (section.id === 'title' && ctx.repo.name) {
    out[0].reason = `Every README should start with a clear title. Detected project name: "${ctx.repo.name}".`;
  }
  return out;
}

function buildSuggestions(
  sections: ReadmeSectionResult[],
  titleSection: ReadmeSectionResult,
  markdownIssues: MarkdownIssue[],
  ctx: ProjectContext,
): ReadmeSuggestion[] {
  const suggestions: ReadmeSuggestion[] = [];
  for (const section of sections.concat(titleSection)) {
    suggestions.push(...suggestionForSection(section, ctx));
  }
  for (const issue of markdownIssues) {
    suggestions.push({ id: issue.id, severity: issue.severity, message: issue.message, reason: 'Detected by structural Markdown checks.' });
  }
  return suggestions;
}

export function analyzeReadme(markdown: string, ctx: ProjectContext): ReadmeQualityResult {
  const headings = parseHeadings(markdown);
  const projectType = classifyProjectType(ctx);

  const titleSection = analyzeTitle(headings);

  const sections: ReadmeSectionResult[] = [];
  for (const id of WEIGHTED) {
    const applicability = sectionApplicability(id, ctx, projectType);
    sections.push(analyzeGlobalSection(id, markdown, headings, applicability));
  }
  for (const id of SUPPLEMENTAL) {
    const applicability = sectionApplicability(id, ctx, projectType);
    sections.push(analyzeGlobalSection(id, markdown, headings, applicability));
  }

  // Assign weights (after 'title' handled separately).
  const weightOf: Record<ReadmeSectionId, number> = {
    title: 0,
    overview: 15,
    features: 15,
    techStack: 10,
    installation: 20,
    usage: 15,
    envVariables: 10,
    projectStructure: 5,
    contributing: 5,
    license: 5,
    api: 0,
    deployment: 0,
  };
  for (const s of sections) s.weight = weightOf[s.id];

  // Set 'title' earned via its status.
  const withTitle = [titleSection, ...sections].map((s) => {
    const earned = s.id === 'title' ? computeEarned(s.status, 0) : computeEarned(s.status, s.weight);
    return { ...s, earned };
  });

  const applicable = withTitle.filter((s) => s.applicability !== 'not-applicable');
  const maxScore = applicable.reduce((sum, s) => sum + s.weight, 0);
  const earned = applicable.reduce((sum, s) => sum + s.earned, 0);
  const score = maxScore > 0 ? Math.round((earned / maxScore) * 100) : 0;

  const markdownIssues = buildMarkdownIssues(markdown, headings, titleSection);
  const suggestions = buildSuggestions(sections.filter((s) => s.id !== 'title'), titleSection, markdownIssues, ctx);

  const summary = withTitle.reduce(
    (acc, s) => {
      if (s.status === 'complete') acc.complete += 1;
      else if (s.status === 'partial') acc.partial += 1;
      else if (s.status === 'missing') acc.missing += 1;
      else acc.notApplicable += 1;
      return acc;
    },
    { complete: 0, partial: 0, missing: 0, notApplicable: 0, total: withTitle.length },
  );

  return {
    score,
    maxScore,
    documentStats: {
      wordCount: countWords(markdown),
      lineCount: markdown ? markdown.split('\n').length : 0,
      headings: headings.length,
      codeBlocks: Math.max(0, Math.round(countCodeFences(markdown) / 2)),
    },
    projectType,
    sections: withTitle,
    suggestions,
    markdownIssues,
    summary,
  };
}
