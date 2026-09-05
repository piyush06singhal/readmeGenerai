// Workspace-specific types for the README editor.
// These extend the core types in index.ts with editor/preview state.

export interface ReadmeDocument {
  markdown: string;
  originalMarkdown: string;
  isDirty: boolean;
  wordCount: number;
  lineCount: number;
}
