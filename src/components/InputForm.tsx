import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

type InputMode = 'pr' | 'repo';

interface InputFormProps {
  onSubmit: (url: string, mode: InputMode) => void;
  isLoading: boolean;
}

const prExamples = [
  { label: 'shadcn-ui/ui', url: 'https://github.com/shadcn-ui/ui/pull/9156' },
  { label: 'oven-sh/bun', url: 'https://github.com/oven-sh/bun/pull/7748' },
  { label: 'anthropics/python', url: 'https://github.com/anthropics/anthropic-sdk-python/pull/1086' },
  { label: 'pi-mono/process-cleanup', url: 'https://github.com/badlogic/pi-mono/pull/3056' },
];

const repoExamples = [
  { label: 'facebook/react', url: 'https://github.com/facebook/react' },
  { label: 'oven-sh/bun', url: 'https://github.com/oven-sh/bun' },
  { label: 'shadcn-ui/ui', url: 'https://github.com/shadcn-ui/ui' },
  { label: 'microsoft/vscode', url: 'https://github.com/microsoft/vscode' },
];

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState<InputMode>('pr');
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = url.trim().includes('github.com') && (mode === 'pr' ? url.includes('/pull/') : !url.includes('/pull/'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(url.trim(), mode);
    }
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    inputRef.current?.focus();
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    setUrl(''); // Clear URL when switching modes
  };

  const examples = mode === 'pr' ? prExamples : repoExamples;

  return (
    <form onSubmit={handleSubmit} className="input-form">
      {/* Mode Toggle with Animated Background */}
      <div className="mode-toggle">
        <motion.div
          className="mode-toggle-bg"
          initial={false}
          animate={{
            x: mode === 'pr' ? 0 : '100%',
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />
        <button
          type="button"
          onClick={() => handleModeChange('pr')}
          className={`mode-btn ${mode === 'pr' ? 'active' : ''}`}
        >
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            animate={{ scale: mode === 'pr' ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5.085V4.122A2.25 2.25 0 001.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
          </motion.svg>
          <motion.span
            animate={{ y: mode === 'pr' ? 0 : 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            Pull Request
          </motion.span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('repo')}
          className={`mode-btn ${mode === 'repo' ? 'active' : ''}`}
        >
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            animate={{ scale: mode === 'repo' ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.3-1.2 1.3 1.2a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-2.5a.25.25 0 00-.25.25z"/>
          </motion.svg>
          <motion.span
            animate={{ y: mode === 'repo' ? 0 : 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            Repository
          </motion.span>
        </button>
      </div>

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
            placeholder={mode === 'pr' ? 'github.com/owner/repo/pull/123' : 'github.com/owner/repo'}
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
          Enter a valid GitHub {mode === 'pr' ? 'PR URL' : 'repository URL'}
        </p>
      )}

      <div className="examples">
        <span className="examples-label">{mode === 'pr' ? 'Try PRs:' : 'Try repos:'}</span>
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

        .mode-toggle {
          display: flex;
          gap: var(--space-1);
          padding: 4px;
          background: var(--bg-secondary);
          border-radius: 12px;
          width: fit-content;
          position: relative;
        }

        .mode-toggle-bg {
          position: absolute;
          top: 4px;
          left: 4px;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          background: var(--bg-primary);
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          z-index: 0;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-muted);
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          z-index: 1;
          transition: color var(--duration-fast) var(--ease-out-quart);
        }

        .mode-btn.active {
          color: var(--ink-primary);
        }

        .mode-btn:hover:not(.active) {
          color: var(--ink-secondary);
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
