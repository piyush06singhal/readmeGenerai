import { useMemo } from 'react';
import type { ProjectContext, ReadmeQualityResult } from '../types';
import { analyzeReadme } from '../services/readme/qualityAnalyzer';

/**
 * Runs the deterministic quality analyzer against the current markdown.
 * Pure + cheap, so it runs synchronously every time the markdown changes —
 * the score always reflects the current document.
 */
export default function useReadmeQuality(
  markdown: string,
  context: ProjectContext,
): ReadmeQualityResult {
  return useMemo(() => analyzeReadme(markdown, context), [markdown, context]);
}
