// AI generation service.
//
// The Groq API key lives ONLY on the server. The client calls our own
// /api/generate route, which proxies to Groq. No secrets touch the browser.

import { apiFetch } from '../lib/api';
import type { GenerateReadmeRequest, GenerateReadmeResponse } from '../types';

/**
 * Generate a README from a repository analysis.
 * @throws ApiError if generation fails or the server is unreachable.
 */
export async function generateReadme(
  request: GenerateReadmeRequest
): Promise<GenerateReadmeResponse> {
  const result = await apiFetch<GenerateReadmeResponse>('/api/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return result;
}
