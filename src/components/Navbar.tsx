import { CreditDisplay } from './CreditDisplay';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onBuyCredits: () => void;
}

export function Navbar({ onBuyCredits }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="var(--accent)"/>
            <path d="M10 12h12M10 16h8M10 20h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">ReelDiff</span>
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          <CreditDisplay onBuyCredits={onBuyCredits} />
        </div>
      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
        }

        .navbar-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 1.375rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--ink-primary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .navbar-content {
            padding: 0.75rem 1rem;
          }

          .logo-text {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </nav>
  );
}
