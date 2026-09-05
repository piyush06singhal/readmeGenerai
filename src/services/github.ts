// GitHub repository analysis service.
//
// The client talks ONLY to our own API routes (see services/api). It never
// talks to api.github.com directly with a token, so credentials stay on the
// server. These functions are exercised by the analysis workflow.

import { apiFetch } from '../lib/api';
import type { ProjectContext } from '../types';

/**
 * Analyze a public GitHub repository.
 * @throws ApiError when the repository is empty, missing, or oversized.
 */
export async function analyzeRepository(repoUrl: string): Promise<ProjectContext> {
  const result = await apiFetch<ProjectContext>('/api/github/analyze', {
    method: 'POST',
    body: JSON.stringify({ repoUrl }),
  });
  return result;
}

export interface FileContentResult {
  path: string;
  content: string;
  truncated: boolean;
}

/**
 * Fetch a single file's contents for on-demand preview.
 * Goes through our server so the client never hits api.github.com directly.
 * @throws ApiError if the file cannot be found or read.
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<FileContentResult> {
  const result = await apiFetch<FileContentResult>('/api/file', {
    method: 'POST',
    body: JSON.stringify({ owner, repo, path }),
  });
  return result;
}
