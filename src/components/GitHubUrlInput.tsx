import { useCallback, useRef, useState, type FormEvent } from 'react';
import { Button } from './ui';
import { isValidGitHubUrl } from '../utils/validation';

interface GitHubUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function GitHubUrlInput({
  onSubmit,
  isLoading = false,
  placeholder = 'https://github.com/username/project',
}: GitHubUrlInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const trimmed = value.trim();

      if (!trimmed) {
        setError('Please enter a GitHub repository URL.');
        inputRef.current?.focus();
        return;
      }

      if (!isValidGitHubUrl(trimmed)) {
        setError('That doesn\'t look like a valid GitHub repository URL.');
        inputRef.current?.focus();
        return;
      }

      setError(undefined);
      onSubmit(trimmed);
    },
    [value, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div
        className={`
          relative flex flex-col sm:flex-row gap-3 p-2 rounded-2xl
          bg-white backdrop-blur-xl transition-all duration-300
          shadow-[0_0_0_1px_rgba(15,23,42,0.1),0_4px_24px_rgba(15,23,42,0.08)]
          focus-within:shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_0_30px_rgba(99,102,241,0.15),0_4px_24px_rgba(15,23,42,0.08)]
          ${error ? 'shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_4px_24px_rgba(15,23,42,0.08)]' : ''}
        `}
      >
        <div className="flex items-center gap-3 flex-1 px-3">
          <svg
            className="w-5 h-5 text-text-tertiary shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(undefined);
            }}
            placeholder={placeholder}
            aria-label="GitHub repository URL"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'github-url-error' : undefined}
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted text-sm sm:text-base py-2 focus:outline-none font-mono"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="sm:self-stretch justify-center"
        >
          Analyze Repository
        </Button>
      </div>
      {error && (
        <p id="github-url-error" role="alert" className="mt-2 text-sm text-error flex items-center gap-2 px-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </p>
      )}
    </form>
  );
}
