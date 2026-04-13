import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useSupabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isSignedIn } = useUser();
  const supabase = useSupabase();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to GitHub...');
  const [projectId, setProjectId] = useState<string | null>(null);

  const installationId = searchParams.get('installation_id');
  const state = searchParams.get('state'); // We can pass projectId as state

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/');
      return;
    }

    handleGitHubCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, navigate]);

  const handleGitHubCallback = async () => {
    if (!installationId) {
      setStatus('error');
      setMessage('No installation ID received from GitHub');
      return;
    }

    try {
      // If we have a state parameter with projectId, update that project
      if (state) {
        setProjectId(state);
        
        // Update the project with the GitHub installation ID
        const { error } = await supabase
          .from('projects')
          .update({ github_app_installation_id: installationId })
          .eq('id', state)
          .eq('user_id', user?.id || '');

        if (error) throw error;

        setStatus('success');
        setMessage('GitHub App installed successfully!');
      } else {
        // No specific project, just show generic success
        setStatus('success');
        setMessage('GitHub App installed! You can now use it with any of your projects.');
      }
    } catch (err) {
      console.error('Failed to save installation:', err);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const handleContinue = () => {
    if (projectId) {
      // Go back to the setup wizard for this project
      navigate(`/projects?setup=${projectId}`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="callback-page">
      <Navbar onBuyCredits={() => {}} />

      <main className="callback-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="callback-card"
        >
          {status === 'loading' && (
            <div className="status-icon loading">
              <Loader2 size={48} className="spin" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="status-icon success">
              <CheckCircle2 size={48} />
            </div>
          )}
          
          {status === 'error' && (
            <div className="status-icon error">
              <AlertCircle size={48} />
            </div>
          )}

          <h1 className="callback-title">
            {status === 'loading' && 'Connecting...'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h1>

          <p className="callback-message">{message}</p>

          {status === 'success' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleContinue}
              className="btn-continue"
            >
              Continue Setup
              <ArrowRight size={18} />
            </motion.button>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="error-actions"
            >
              <button onClick={() => navigate('/projects')} className="btn-secondary">
                Go to Projects
              </button>
              <a 
                href={`https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_SLUG || 'reeldiff-webhook'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-retry"
              >
                Try Again
              </a>
            </motion.div>
          )}

          {installationId && (
            <div className="debug-info">
              <p>Installation ID: {installationId}</p>
            </div>
          )}
        </motion.div>
      </main>

      <style>{`
        .callback-page {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .callback-content {
          max-width: 480px;
          margin: 0 auto;
          padding: var(--space-8) var(--space-4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
        }

        .callback-card {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: var(--space-8);
          text-align: center;
        }

        .status-icon {
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 0 auto var(--space-5);
        }

        .status-icon.loading {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .status-icon.success {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .status-icon.error {
          background: rgba(196, 92, 62, 0.15);
          color: var(--accent);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .callback-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 var(--space-3);
          color: var(--ink-primary);
        }

        .callback-message {
          font-size: 1rem;
          color: var(--ink-secondary);
          margin: 0 0 var(--space-5);
          line-height: 1.5;
        }

        .btn-continue {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-6);
          background: var(--accent);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-continue:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(196, 92, 62, 0.3);
        }

        .error-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: center;
        }

        .btn-secondary {
          padding: var(--space-3) var(--space-4);
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--ink-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }

        .btn-retry {
          padding: var(--space-3) var(--space-4);
          background: var(--accent);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }

        .debug-info {
          margin-top: var(--space-6);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .debug-info p {
          font-size: 0.75rem;
          color: var(--ink-muted);
          font-family: var(--font-mono);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
