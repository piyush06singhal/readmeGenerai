export interface GitHubRepoInfo {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  languages: string[];
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  license: string | null;
  visibility: string;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  hasReadme: boolean;
  hasPackageJson: boolean;
  hasLicense: boolean;
}

export interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
}

export interface AnalysisResult {
  repoInfo: GitHubRepoInfo;
  structure: RepoFile[];
  packageJson?: Record<string, unknown>;
  readmeContent?: string;
}

export type ReadmeStyle = 'standard' | 'detailed' | 'minimal';

export interface GenerateReadmeRequest {
  projectContext: ProjectContext;
  style?: ReadmeStyle;
  /** Optional free-form user instructions that the model must honor when writing the README. */
  personalization?: string;
}

export interface GenerateReadmeResponse {
  markdown: string;
}

export interface GenerationProgress {
  stage: 'preparing' | 'analyzing' | 'generating' | 'formatting' | 'complete';
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface TechStack {
  primary: string;
  frameworks: string[];
  languages: string[];
  tools: string[];
  runtimes: string[];
}

export interface DependencyInfo {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  pipDependencies: string[];
  otherDependencies: string[];
}

export interface EnvVariable {
  name: string;
  description?: string;
}

export interface ProjectStructureNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: ProjectStructureNode[];
  size?: number;
}

export interface ProjectContext {
  repo: GitHubRepoInfo;
  projectStructure: ProjectStructureNode[];
  techStack: TechStack;
  dependencies: DependencyInfo;
  existingReadme?: string;
  envExample?: string;
  envVariables: EnvVariable[];
  entryPoints: string[];
  configFiles: string[];
  sourceFiles: string[];
}

export interface AnalysisProgress {
  stage: 'validating' | 'fetching' | 'inspecting' | 'detecting' | 'extracting' | 'complete';
  message: string;
  progress?: number;
}

// Workspace types (editor, preview)
export type { ReadmeDocument } from './workspace.js';

// README quality analyzer types
export type {
  ReadmeSectionId,
  ReadmeSectionStatus,
  Applicability,
  ReadmeSectionResult,
  SuggestionSeverity,
  ReadmeSuggestion,
  MarkdownIssue,
  ReadmeDocumentStats,
  ReadmeQualityResult,
} from './readme.js';

// README badge types
export type { BadgeKey, ReadmeBadge } from './readme.js';
