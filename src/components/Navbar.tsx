import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SignInButton, UserButton, useAuth } from '@clerk/clerk-react';
import { CreditDisplay } from './CreditDisplay';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onBuyCredits: () => void;
}

export function Navbar({ onBuyCredits }: NavbarProps) {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handlePricingClick = () => {
    if (location.pathname === '/') {
      // Already on home page, just open the modal
      onBuyCredits();
    } else {
      // Navigate to home with pricing param
      navigate('/?pricing=true');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="var(--accent)"/>
            <path d="M10 12h12M10 16h8M10 20h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">ReelDiff</span>
        </Link>

        <div className="nav-actions">
          {isSignedIn && (
<<<<<<< HEAD
            <>
              <Link to="/projects" className="nav-link">
                Projects
              </Link>
              <Link to="/videos" className="nav-link">
                Videos
              </Link>
            </>
=======
            <Link to="/projects" className="nav-link">
              Projects
            </Link>
>>>>>>> origin/feat/webhook-automation
          )}
          <button className="pricing-link" onClick={handlePricingClick}>
            Pricing
          </button>
          <ThemeToggle />
          {isSignedIn ? (
            <>
              <CreditDisplay onBuyCredits={onBuyCredits} />
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="sign-in-btn">Sign In</button>
            </SignInButton>
          )}
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
          text-decoration: none;
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

        .pricing-link {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pricing-link:hover {
          color: var(--accent);
        }

        .nav-link {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: var(--accent);
        }

        .sign-in-btn {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-primary);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sign-in-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
        }

        @media (max-width: 640px) {
          .navbar-content {
            padding: 0.75rem 1rem;
          }

          .logo-text {
            font-size: 1.25rem;
          }

          .sign-in-btn {
            padding: 0.375rem 0.75rem;
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </nav>
  );
}
