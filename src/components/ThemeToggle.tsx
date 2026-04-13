import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={18} strokeWidth={2} />
      ) : (
        <Sun size={18} strokeWidth={2} />
      )}
      <style>{`
        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: transparent;
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all 150ms ease-out;
        }

        .theme-toggle:hover {
          background: var(--bg-secondary);
          border-color: var(--border-strong);
          color: var(--ink-primary);
        }

        .theme-toggle:active {
          transform: scale(0.96);
        }
      `}</style>
    </button>
  );
}
