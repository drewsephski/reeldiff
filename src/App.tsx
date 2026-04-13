import { useState } from 'react';
import { InputForm } from './components/InputForm';
import { LoadingState } from './components/LoadingState';
import { VideoModal } from './components/VideoModal';
import { analyzePR, analyzeRepo } from './lib/api';
import type { VideoData } from './types';
import { isRepoVideoScript } from './types';

type AppState = 'input' | 'loading' | 'preview';
type InputMode = 'pr' | 'repo';

function App() {
  const [state, setState] = useState<AppState>('input');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (url: string, mode: InputMode) => {
    setState('loading');
    setError(null);

    try {
      const data = mode === 'pr' ? await analyzePR(url) : await analyzeRepo(url);
      setVideoData(data);
      setState('preview');
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('input');
    }
  };

  const handleReset = () => {
    setState('input');
    setVideoData(null);
    setError(null);
    setIsModalOpen(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header animate-reveal">
        <div className="logo-mark">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="var(--accent)"/>
            <path d="M10 12h12M10 16h8M10 20h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">ReelDiff</span>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {state === 'input' && (
          <div className="input-section">
            <div className="hero-text animate-reveal">
              <span className="text-caption-accent">Diff to Reel</span>
              <h1 className="text-display">
                Turn code changes<br />
                <span className="text-display-italic">into visual stories</span>
              </h1>
              <p className="text-lead hero-subtitle">
                Paste a GitHub PR or repo link. Get a shareable video in seconds.
              </p>
            </div>

            <div className="form-wrapper animate-reveal-delay-1">
              <InputForm onSubmit={handleSubmit} isLoading={false} />
              {error && (
                <div className="error-message animate-fade">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {state === 'loading' && <LoadingState />}

        {state === 'preview' && videoData && (
          <>
            <VideoModal
              videoData={videoData}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />

            {!isModalOpen && videoData && (
              <div className="result-section animate-reveal">
                <div className="result-card card">
                  <div className="result-header">
                    <img
                      src={videoData.meta.ownerAvatar}
                      alt={isRepoVideoScript(videoData) ? videoData.meta.owner : videoData.meta.author}
                      className="avatar"
                    />
                    <div className="result-meta">
                      <span className="text-title" style={{ fontSize: '1.125rem' }}>
                        {videoData.meta.repoName}
                      </span>
                      <span className="text-label">
                        {isRepoVideoScript(videoData) ? (
                          <>⭐ {videoData.meta.stars.toLocaleString()} stars · {videoData.meta.language}</>
                        ) : (
                          <>PR #{videoData.meta.prNumber} by @{videoData.meta.author}</>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="result-actions">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="btn-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 2.5a.5.5 0 0 0-1 0v5.793L5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8 8.293V2.5z"/>
                        <path d="M3.5 9.5a.5.5 0 0 0-1 0v2A2.5 2.5 0 0 0 5 14h6a2.5 2.5 0 0 0 2.5-2.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 1 11 13H5a1.5 1.5 0 0 1-1.5-1.5v-2z"/>
                      </svg>
                      Watch video
                    </button>
                    <button
                      onClick={handleReset}
                      className="btn-secondary"
                    >
                      Try another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer animate-reveal-delay-2">
        <span className="text-label">Made for developers who share</span>
        <a
          href="https://github.com/drewsephski"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link text-small"
        >
          @drewsephski
        </a>
      </footer>

      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .app-header {
          padding: var(--space-6) var(--space-6) 0;
        }

        .logo-mark {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 1.375rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--ink-primary);
        }

        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: var(--space-8) var(--space-6);
          max-width: 720px;
          margin: 0 auto;
          width: 100%;
        }

        .input-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .hero-text {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .hero-text .text-caption-accent {
          margin-bottom: var(--space-1);
        }

        .hero-text .text-display-italic {
          color: var(--accent);
        }

        .hero-subtitle {
          max-width: 480px;
        }

        .form-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .error-message {
          padding: var(--space-4) var(--space-5);
          background: rgba(196, 92, 62, 0.08);
          border: 1px solid rgba(196, 92, 62, 0.2);
          border-radius: 10px;
          color: var(--accent);
          font-size: 0.875rem;
          text-align: center;
        }

        .result-section {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .result-card {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding-bottom: var(--space-5);
          border-bottom: 1px solid var(--border);
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid var(--border);
        }

        .result-meta {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .result-actions {
          display: flex;
          gap: var(--space-3);
        }

        .result-actions button {
          flex: 1;
        }

        .app-footer {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }

        .footer-link {
          color: var(--ink-tertiary);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color var(--duration-fast) var(--ease-out-quart);
        }

        .footer-link:hover {
          color: var(--accent);
        }

        @media (max-width: 640px) {
          .app-main {
            padding: var(--space-6) var(--space-4);
          }

          .result-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
