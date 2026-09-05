import assert from 'node:assert/strict';
import test from 'node:test';
import { extractRepoFromUrl, formatNumber, isValidGitHubUrl } from '../src/utils/validation.ts';
import { fencesAreClosed, findHeadingForSection, parseHeadings } from '../src/services/readme/sectionDetector.ts';

test('accepts only repository-shaped GitHub URLs', () => {
  assert.equal(isValidGitHubUrl('https://github.com/example/project'), true);
  assert.equal(isValidGitHubUrl('https://github.com/example/project/'), true);
  assert.equal(isValidGitHubUrl('https://gitlab.com/example/project'), false);
  assert.equal(isValidGitHubUrl('https://github.com/example/project/issues'), false);
});

test('extracts repository owner and name', () => {
  assert.deepEqual(extractRepoFromUrl('https://github.com/example/project'), {
    owner: 'example',
    repo: 'project',
  });
  assert.equal(extractRepoFromUrl('not-a-url'), null);
});

test('formats repository counts consistently', () => {
  assert.equal(formatNumber(42), '42');
  assert.equal(formatNumber(1200), '1.2K');
  assert.equal(formatNumber(1_500_000), '1.5M');
});

test('parses README headings and recognizes aliases', () => {
  const markdown = '# Project\n\n## Getting Started\n\n```bash\nnpm install\n```';
  const headings = parseHeadings(markdown);
  assert.equal(headings.length, 2);
  assert.equal(findHeadingForSection(headings, 'installation')?.text, 'Getting Started');
  assert.equal(fencesAreClosed(markdown), true);
  assert.equal(fencesAreClosed(`${markdown}\n\`\`\``), false);
});
