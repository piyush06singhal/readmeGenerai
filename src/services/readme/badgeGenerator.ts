// Deterministic, repo-aware README badge generation.
//
// Badges are derived exclusively from information actually present in the
// analyzed repository context. Nothing here is invented, and the AI model is
// never asked to construct badge URLs. The generator is a pure function: same
// repository in, same badges out.

import type { ProjectContext } from '../../types/index.js';
import type { BadgeKey, ReadmeBadge } from '../../types/readme.js';

// Stable display order so badges never jump around when toggled.
const BADGE_ORDER: BadgeKey[] = [
  'license',
  'stars',
  'forks',
  'issues',
  'language',
  'framework',
  'repo',
];

const BADGE_LABELS: Record<BadgeKey, string> = {
  license: 'License',
  stars: 'Stars',
  forks: 'Forks',
  issues: 'Issues',
  language: 'Language',
  framework: 'Framework',
  repo: 'Repository',
};

/** shields.io flat-square badge URL with URL-safe segment encoding. */
function shield(label: string, message: string, color: string): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/_/g, '__'));
  return `https://img.shields.io/badge/${enc(label)}-${enc(message)}-${color}?style=for-the-badge`;
}

/** Compact star/other count, e.g. 1234 -> '1.2k'. */
function compact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(n);
}

/**
 * Which badge kinds this repository can genuinely support.
 * A badge is only available when the underlying metadata exists.
 */
export function availableBadgeKeys(ctx: ProjectContext): BadgeKey[] {
  const repo = ctx.repo;
  const keys: BadgeKey[] = [];
  if (repo.license && repo.hasLicense) keys.push('license');
  if (repo.stars > 0) keys.push('stars');
  if (repo.forks > 0) keys.push('forks');
  keys.push('issues'); // issues count is meaningful even at zero
  if (repo.language) keys.push('language');
  if (ctx.techStack.frameworks?.[0]) keys.push('framework');
  keys.push('repo'); // the repo itself is always known
  return keys;
}

/**
 * Generate the badge definitions for a repository.
 * `enabled` filters which kinds to include (the UI toggles drive this).
 * Only badges whose metadata is actually known are ever produced.
 */
export function generateBadges(
  ctx: ProjectContext,
  enabled: BadgeKey[] = BADGE_ORDER,
  limit = 4,
): ReadmeBadge[] {
  const repo = ctx.repo;
  const allowed = new Set(enabled);
  const badges: ReadmeBadge[] = [];

  if (allowed.has('license') && repo.license && repo.hasLicense) {
    badges.push({
      key: 'license',
      label: BADGE_LABELS.license,
      alt: `License: ${repo.license}`,
      imageUrl: shield('License', repo.license, '10b981'),
      targetUrl: repo.htmlUrl,
    });
  }

  if (allowed.has('stars') && repo.stars > 0) {
    badges.push({
      key: 'stars',
      label: BADGE_LABELS.stars,
      alt: `${repo.stars} stars`,
      imageUrl: shield('Stars', compact(repo.stars), 'e4b521'),
      targetUrl: `${repo.htmlUrl}/stargazers`,
    });
  }

  if (allowed.has('forks') && repo.forks > 0) {
    badges.push({
      key: 'forks',
      label: BADGE_LABELS.forks,
      alt: `${repo.forks} forks`,
      imageUrl: shield('Forks', compact(repo.forks), '6366f1'),
      targetUrl: `${repo.htmlUrl}/network/members`,
    });
  }

  if (allowed.has('issues')) {
    badges.push({
      key: 'issues',
      label: BADGE_LABELS.issues,
      alt: `${repo.openIssues} open issues`,
      imageUrl: shield('Issues', String(repo.openIssues), 'ef4444'),
      targetUrl: `${repo.htmlUrl}/issues`,
    });
  }

  if (allowed.has('language') && repo.language) {
    badges.push({
      key: 'language',
      label: BADGE_LABELS.language,
      alt: `Language: ${repo.language}`,
      imageUrl: shield('Language', repo.language, '06b6d4'),
      targetUrl: repo.htmlUrl,
    });
  }

  if (allowed.has('framework') && ctx.techStack.frameworks?.[0]) {
    badges.push({
      key: 'framework',
      label: BADGE_LABELS.framework,
      alt: `Built with: ${ctx.techStack.frameworks[0]}`,
      imageUrl: shield('Built with', ctx.techStack.frameworks[0], '8b5cf6'),
      targetUrl: repo.htmlUrl,
    });
  }

  if (allowed.has('repo')) {
    const name = repo.name || repo.fullName;
    badges.push({
      key: 'repo',
      label: BADGE_LABELS.repo,
      alt: name,
      imageUrl: shield(name, repo.visibility === 'private' ? 'private' : 'public', '4a4a5a'),
      targetUrl: repo.htmlUrl,
    });
  }

  // Keep the badge row unobtrusive — don't ever overwhelm the README.
  return badges.slice(0, limit);
}

/** Render the badges as a block of Markdown image-links. */
export function renderBadgeMarkdown(badges: ReadmeBadge[]): string {
  return badges.map((b) => `[![${b.alt}](${b.imageUrl})](${b.targetUrl})`).join(' ');
}

/**
 * Insert the badge markdown directly below the document title, so the badges
 * appear where readers expect them. Pure and idempotent at the client side —
 * this is what gets copied/downloaded, keeping the editor document clean.
 */
export function injectBadges(markdown: string, badges: ReadmeBadge[]): string {
  if (!markdown || badges.length === 0) return markdown;
  const lines = markdown.split('\n');
  const titleIdx = lines.findIndex((l) => /^#{1,6}\s+\S/.test(l.trim()));
  if (titleIdx === -1) return markdown;

  const badgeLines = [renderBadgeMarkdown(badges), ''];

  // Insert after the title line, preserving a blank-line separation both above
  // and below the badge row.
  const next = lines[titleIdx + 1];
  let insertAt = titleIdx + 1;
  if (next !== undefined && next.trim() === '') {
    lines.splice(insertAt, 1, ...badgeLines);
  } else {
    lines.splice(insertAt, 0, '', ...badgeLines);
  }

  return lines.join('\n');
}