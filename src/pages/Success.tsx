import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

/**
 * Success page - post-checkout sync
 * Following STRIPE.md pattern:
 * 1. User lands here after Stripe checkout
 * 2. We sync data to KV immediately (race condition prevention)
 * 3. Redirect back to app
 */
export default function Success() {
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your purchase...');

  useEffect(() => {
    if (!isSignedIn) {
      setStatus('error');
      setMessage('Please sign in to complete purchase');
      return;
    }

    const syncData = async () => {
      // Get session_id from URL params
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setMessage('Invalid session');
        return;
      }

      try {
        const token = await getToken();

        if (!token) {
          throw new Error('Not authenticated');
        }

        // Call sync endpoint
        const response = await fetch('/api/stripe/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Sync failed');
        }

        setStatus('success');
        setMessage('Credits added! Redirecting...');

        // Trigger global credit reload
        const reloadFn = (window as Window & { reloadCredits?: () => void }).reloadCredits;
        if (reloadFn) reloadFn();

        // Redirect after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        console.error('Sync error:', err);
        setStatus('error');
        setMessage('Something went wrong. Credits will appear shortly.');

        // Still redirect after delay - webhook will handle it
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    syncData();
  }, [isSignedIn, getToken, searchParams, navigate]);

  return (
    <div className="success-page">
      <div className="success-card">
        <div className={`status-icon ${status}`}>
          {status === 'loading' && <span className="spinner" />}
          {status === 'success' && <span>✅</span>}
          {status === 'error' && <span>⚠️</span>}
        </div>
        <h1>
          {status === 'loading' && 'Processing...'}
          {status === 'success' && 'Thank you!'}
          {status === 'error' && 'Almost there'}
        </h1>
        <p>{message}</p>
      </div>

      <style>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: var(--space-6);
        }

        .success-card {
          text-align: center;
          max-width: 400px;
        }

        .status-icon {
          font-size: 3rem;
          margin-bottom: var(--space-6);
        }

        .status-icon.loading .spinner {
          display: inline-block;
          width: 48px;
          height: 48px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        h1 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--ink-primary);
          margin-bottom: var(--space-3);
        }

        p {
          font-size: 1rem;
          color: var(--ink-secondary);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
