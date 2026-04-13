import { useState, useRef } from 'react';

interface InputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const examples = [
  { label: 'shadcn-ui/ui', url: 'https://github.com/shadcn-ui/ui/pull/9156' },
  { label: 'oven-sh/bun', url: 'https://github.com/oven-sh/bun/pull/7748' },
  { label: 'anthropics/python', url: 'https://github.com/anthropics/anthropic-sdk-python/pull/1086' },
  { label: 'pi-mono/process-cleanup', url: 'https://github.com/badlogic/pi-mono/pull/3056' },
  { label: 'pi-mono/local-llm', url: 'https://github.com/badlogic/pi-mono/pull/3081' },
  { label: 'pi-mono/npm-optimize', url: 'https://github.com/badlogic/pi-mono/pull/3063' },
  { label: 'clawrouter/routing-fix', url: 'https://github.com/BlockRunAI/ClawRouter/pull/149' },
  { label: 'clawrouter/wallet-config', url: 'https://github.com/BlockRunAI/ClawRouter/pull/140' },
];

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = url.trim().includes('github.com') && url.includes('/pull/');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(url.trim());
    }
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <div className={`input-wrapper ${isFocused ? 'focused' : ''}`}>
        <div className="input-inner">
          <svg
            className={`github-icon ${isFocused ? 'active' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>

          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="github.com/owner/repo/pull/123"
            disabled={isLoading}
            className="url-input"
          />

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className={`submit-btn ${isValid ? 'valid' : ''}`}
          >
            {isLoading ? (
              <span className="loading-content">
                <span className="spinner" />
                Processing
              </span>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>

      {url.trim() && !isValid && (
        <p className="validation-hint">
          Enter a valid GitHub PR URL
        </p>
      )}

      <div className="examples">
        <span className="examples-label">Try:</span>
        <div className="example-pills">
          {examples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => handleExampleClick(example.url)}
              className="example-pill"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .input-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .input-wrapper {
          position: relative;
          border-radius: 12px;
          padding: 2px;
          background: var(--border);
          transition: background var(--duration-fast) var(--ease-out-quart);
        }

        .input-wrapper.focused {
          background: var(--accent);
        }

        .input-inner {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-1) var(--space-2) var(--space-1) var(--space-4);
          background: var(--bg-primary);
          border-radius: 10px;
        }

        .github-icon {
          flex-shrink: 0;
          color: var(--ink-muted);
          transition: color var(--duration-fast) var(--ease-out-quart);
        }

        .github-icon.active {
          color: var(--accent);
        }

        .url-input {
          flex: 1;
          padding: var(--space-3) 0;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--ink-primary);
          background: transparent;
          border: none;
          outline: none;
        }

        .url-input::placeholder {
          color: var(--ink-muted);
        }

        .submit-btn {
          padding: var(--space-3) var(--space-5);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--ink-muted);
          background: var(--bg-secondary);
          border: none;
          border-radius: 8px;
          cursor: not-allowed;
          transition: all var(--duration-fast) var(--ease-out-quart);
        }

        .submit-btn.valid {
          color: white;
          background: var(--accent);
          cursor: pointer;
        }

        .submit-btn.valid:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .loading-content {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .validation-hint {
          font-size: 0.875rem;
          color: var(--accent);
          text-align: center;
          animation: reveal-up 0.3s var(--ease-out-expo);
        }

        .examples {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .examples-label {
          font-size: 0.8125rem;
          color: var(--ink-muted);
        }

        .example-pills {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .example-pill {
          padding: var(--space-1) var(--space-3);
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--ink-tertiary);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out-quart);
        }

        .example-pill:hover {
          color: var(--ink-primary);
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        @media (max-width: 640px) {
          .input-inner {
            flex-wrap: wrap;
          }

          .url-input {
            min-width: 200px;
          }

          .submit-btn {
            width: 100%;
          }

          .examples {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </form>
  );
};
