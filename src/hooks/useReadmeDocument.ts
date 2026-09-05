import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ReadmeDocument } from '../types/workspace';

/**
 * Central hook for managing README document state.
 * Tracks markdown content, original (AI-generated) content, dirty state,
 * and registers a beforeunload warning when the user has unsaved edits.
 */
export default function useReadmeDocument(initialMarkdown = '') {
  const [markdown, setMarkdownRaw] = useState(initialMarkdown);
  const [originalMarkdown, setOriginalMarkdown] = useState(initialMarkdown);

  const wordCount = useMemo(
    () => (markdown.trim() ? markdown.trim().split(/\s+/).length : 0),
    [markdown],
  );

  const lineCount = useMemo(
    () => (markdown ? markdown.split('\n').length : 0),
    [markdown],
  );

  const isDirty = markdown !== originalMarkdown;

  const document: ReadmeDocument = {
    markdown,
    originalMarkdown,
    isDirty,
    wordCount,
    lineCount,
  };

  const setMarkdown = useCallback((text: string) => {
    setMarkdownRaw(text);
  }, []);

  const replaceWithGenerated = useCallback((newMarkdown: string) => {
    setMarkdownRaw(newMarkdown);
    setOriginalMarkdown(newMarkdown);
  }, []);

  const resetToOriginal = useCallback(() => {
    setMarkdownRaw(originalMarkdown);
  }, [originalMarkdown]);

  const markClean = useCallback(() => {
    setOriginalMarkdown(markdown);
  }, [markdown]);

  // Browser close/navigate warning when there are unsaved edits.
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- required by browsers
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return {
    document,
    setMarkdown,
    replaceWithGenerated,
    resetToOriginal,
    markClean,
  };
}
