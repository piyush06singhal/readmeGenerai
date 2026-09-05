// Types for the deterministic, project-aware README quality analyzer.

export type ReadmeSectionId =
  | 'title'
  | 'overview'
  | 'features'
  | 'techStack'
  | 'installation'
  | 'usage'
  | 'envVariables'
  | 'projectStructure'
  | 'contributing'
  | 'license'
  | 'api'
  | 'deployment';

export type ReadmeSectionStatus = 'complete' | 'partial' | 'missing' | 'not-applicable';

export type Applicability = 'required' | 'recommended' | 'not-applicable';

export interface ReadmeSectionResult {
  id: ReadmeSectionId;
  label: string;
  status: ReadmeSectionStatus;
  applicability: Applicability;
  // Contribution toward the weighted score (0 for supplemental checks).
  weight: number;
  // Points actually earned (0, half-weight, or full weight).
  earned: number;
  matchedHeading?: string;
  evidence: string[];
  missing: string[];
}

export type SuggestionSeverity = 'info' | 'warning' | 'critical';

/** Badge kinds the generator can produce, derived from real repo metadata. */
export type BadgeKey =
  | 'license'
  | 'stars'
  | 'forks'
  | 'issues'
  | 'language'
  | 'framework'
  | 'repo';

export interface ReadmeBadge {
  key: BadgeKey;
  label: string;
  imageUrl: string;
  alt: string;
  targetUrl: string;
}

export interface ReadmeSuggestion {
  id: string;
  severity: SuggestionSeverity;
  message: string;
  reason: string;
  sectionId?: ReadmeSectionId;
}

export interface MarkdownIssue {
  id: string;
  severity: 'warning' | 'info';
  message: string;
}

export interface ReadmeDocumentStats {
  wordCount: number;
  lineCount: number;
  headings: number;
  codeBlocks: number;
}

export interface ReadmeQualityResult {
  score: number;
  // Highest achievable score given the sections that actually apply.
  maxScore: number;
  documentStats: ReadmeDocumentStats;
  projectType: string;
  sections: ReadmeSectionResult[];
  suggestions: ReadmeSuggestion[];
  markdownIssues: MarkdownIssue[];
  summary: {
    complete: number;
    partial: number;
    missing: number;
    notApplicable: number;
    total: number;
  };
}
