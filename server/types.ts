// Server-side types for GitHub API responses and internal processing.

export interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  license: { spdx_id: string } | null;
  visibility: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
}

export interface GitHubTreeResponse {
  sha: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
}

export interface GitHubLanguagesResponse {
  [language: string]: number;
}

export interface GitHubContentResponse {
  name: string;
  path: string;
  content: string;
  encoding: string;
  size: number;
}

export interface AnalyzeRequest {
  repoUrl: string;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  status: number;
}

export type ErrorCode =
  | 'INVALID_URL'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'EMPTY_REPO'
  | 'GITHUB_API_ERROR'
  | 'NETWORK_ERROR'
  | 'CONFIG_ERROR'
  | 'PROVIDER_ERROR'
  | 'TIMEOUT'
  | 'EMPTY_OUTPUT'
  | 'EMPTY_CONTEXT'
  | 'INVALID_OUTPUT'
  | 'INVALID_REQUEST';

export class ApiError extends Error {
  code: ErrorCode;
  status: number;

  constructor(message: string, code: ErrorCode, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}