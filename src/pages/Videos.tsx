import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Play, Clock, CheckCircle, XCircle, Film, ExternalLink, ChevronLeft, GitBranch, AppWindow } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase, type Video, type Project } from '../lib/supabase';
import { Navbar } from '../components/Navbar';

interface VideoWithProject extends Video {
  projects?: Project;
}

type SourceFilter = 'all' | 'webhook' | 'app';

export default function Videos() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [videos, setVideos] = useState<VideoWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithProject | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  const loadVideos = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('videos')
        .select(`
          *,
          projects!inner(*)
        `)
        .eq('projects.user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setVideos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/');
      return;
    }
    loadVideos();
  }, [isSignedIn, navigate, user, supabase, loadVideos]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="status-icon completed" />;
      case 'failed':
        return <XCircle size={18} className="status-icon failed" />;
      case 'processing':
        return <Film size={18} className="status-icon processing" />;
      default:
        return <Clock size={18} className="status-icon pending" />;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'webhook':
        return <GitBranch size={14} />;
      case 'app':
        return <AppWindow size={14} />;
      default:
        return <Film size={14} />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'webhook':
        return 'GitHub';
      case 'app':
        return 'App';
      default:
        return source;
    }
  };

  const filteredVideos = videos.filter(video => 
    sourceFilter === 'all' || video.source === sourceFilter
  );

  const webhookCount = videos.filter(v => v.source === 'webhook').length;
  const appCount = videos.filter(v => v.source === 'app').length;

  return (
    <div className="videos-page">
      <Navbar onBuyCredits={() => {}} />

      <main className="videos-content">
        <div className="videos-header">
          <div className="header-left">
            <h1 className="text-headline">Your Videos</h1>
            <p className="text-body">
              {videos.length} video{videos.length !== 1 ? 's' : ''} generated
              {webhookCount > 0 && ` · ${webhookCount} from GitHub`}
              {appCount > 0 && ` · ${appCount} from app`}
            </p>
          </div>
          <div className="source-filter">
            <button
              className={`filter-tab ${sourceFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSourceFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-tab ${sourceFilter === 'webhook' ? 'active' : ''}`}
              onClick={() => setSourceFilter('webhook')}
            >
              <GitBranch size={14} />
              GitHub
            </button>
            <button
              className={`filter-tab ${sourceFilter === 'app' ? 'active' : ''}`}
              onClick={() => setSourceFilter('app')}
            >
              <AppWindow size={14} />
              App
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={loadVideos}>Retry</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="loading-state-enhanced"
            >
              <div className="loading-header">
                <div className="loading-spinner-ring">
                  <div className="spinner-track" />
                  <div className="spinner-fill" />
                </div>
                <div className="loading-text">
                  <span className="loading-title">Loading videos</span>
                  <span className="loading-subtitle">Fetching your content...</span>
                </div>
              </div>
              <div className="skeleton-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="skeleton-thumbnail">
                      <div className="skeleton-shimmer" />
                    </div>
                    <div className="skeleton-content">
                      <div className="skeleton-line short" />
                      <div className="skeleton-line long" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : filteredVideos.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="empty-state"
            >
              <div className="empty-icon">
                <Film size={48} />
              </div>
              <h3 className="text-title">
                {sourceFilter === 'all' ? 'No videos yet' : `No ${sourceFilter} videos`}
              </h3>
              <p className="text-body">
                {sourceFilter === 'webhook'
                  ? 'Connect a GitHub repository and merge a PR to generate videos.'
                  : sourceFilter === 'app'
                  ? 'Generate videos from the playground or demo to see them here.'
                  : 'Connect a GitHub repository or generate videos from the app to get started.'}
              </p>
              <button onClick={() => navigate('/projects')} className="btn-primary">
                Go to Projects
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="videos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="videos-grid"
            >
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  layout
                  className="video-card"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="video-thumbnail">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt="Video thumbnail" />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <Film size={32} />
                      </div>
                    )}
                    <div className={`status-badge ${video.status}`}>
                      {getStatusIcon(video.status)}
                      <span>{video.status}</span>
                    </div>
                    <div className={`source-badge ${video.source}`}>
                      {getSourceIcon(video.source)}
                      <span>{getSourceLabel(video.source)}</span>
                    </div>
                  </div>

                  <div className="video-info">
                    <div className="video-meta">
                      <span className="project-name">
                        {video.projects?.repo_owner}/{video.projects?.repo_name}
                      </span>
                      <span className="video-date">{formatDate(video.created_at)}</span>
                    </div>
                    <h4 className="video-title">
                      {video.trigger_event === 'pr_merge' ? 'PR Merged' : video.trigger_event}
                    </h4>
                    {video.status === 'failed' && video.error_message && (
                      <p className="error-text">{video.error_message}</p>
                    )}
                  </div>

                  {video.status === 'completed' && (
                    <button className="btn-play">
                      <Play size={20} fill="currentColor" />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
            />
            <motion.div
              className="video-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="video-modal-header">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="btn-back"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
                <h3>
                  {selectedVideo.projects?.repo_owner}/{selectedVideo.projects?.repo_name}
                </h3>
              </div>

              <div className="video-player">
                {selectedVideo.video_url ? (
                  <video
                    src={selectedVideo.video_url}
                    controls
                    poster={selectedVideo.thumbnail_url || undefined}
                  />
                ) : (
                  <div className="video-placeholder">
                    <Film size={64} />
                    <p>Video not available</p>
                  </div>
                )}
              </div>

              <div className="video-details">
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value ${selectedVideo.status}`}>
                    {getStatusIcon(selectedVideo.status)}
                    {selectedVideo.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{formatDate(selectedVideo.created_at)}</span>
                </div>
                {selectedVideo.completed_at && (
                  <div className="detail-row">
                    <span className="detail-label">Completed</span>
                    <span className="detail-value">{formatDate(selectedVideo.completed_at)}</span>
                  </div>
                )}
                {selectedVideo.video_url && (
                  <a
                    href={selectedVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-download"
                  >
                    <ExternalLink size={16} />
                    Open Video
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .videos-page {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .videos-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .videos-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-6);
        }

        .header-left h1 {
          margin: 0 0 var(--space-1);
        }

        .header-left p {
          color: var(--ink-muted);
          margin: 0;
        }

        .error-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) var(--space-4);
          background: rgba(196, 92, 62, 0.1);
          border: 1px solid var(--accent);
          border-radius: 12px;
          margin-bottom: var(--space-4);
        }

        .error-banner span {
          font-size: 0.9375rem;
          color: var(--ink-secondary);
        }

        .error-banner button {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          background: var(--accent);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out-quart);
        }

        .error-banner button:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .error-banner button:active {
          transform: translateY(0);
        }

        .loading-state-enhanced {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
          padding: var(--space-8) 0;
        }

        .loading-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-8) 0 var(--space-4);
        }

        .loading-spinner-ring {
          position: relative;
          width: 56px;
          height: 56px;
        }

        .spinner-track {
          position: absolute;
          inset: 0;
          border: 3px solid var(--border);
          border-radius: 50%;
        }

        .spinner-fill {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        .loading-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
        }

        .loading-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ink-primary);
          animation: reveal-up 0.5s var(--ease-out-expo);
        }

        .loading-subtitle {
          font-size: 0.9375rem;
          color: var(--ink-muted);
          animation: reveal-up 0.5s var(--ease-out-expo) 0.1s both;
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-4);
          animation: fade-in 0.6s var(--ease-out-quart) 0.2s both;
        }

        .skeleton-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          animation: skeleton-reveal 0.5s var(--ease-out-expo) both;
        }

        .skeleton-thumbnail {
          position: relative;
          aspect-ratio: 16/9;
          background: var(--bg-tertiary);
          overflow: hidden;
        }

        .skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          animation: shimmer 1.6s infinite;
        }

        .skeleton-content {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .skeleton-line {
          height: 12px;
          background: var(--bg-tertiary);
          border-radius: 6px;
          overflow: hidden;
        }

        .skeleton-line.short {
          width: 40%;
        }

        .skeleton-line.long {
          width: 75%;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes skeleton-reveal {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-16);
          gap: var(--space-6);
        }

        .empty-icon {
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: 24px;
          color: var(--accent);
        }

        .videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-4);
        }

        .video-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .video-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .video-thumbnail {
          position: relative;
          aspect-ratio: 16/9;
          background: var(--bg-tertiary);
        }

        .video-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink-muted);
        }

        .status-badge {
          position: absolute;
          top: var(--space-2);
          left: var(--space-2);
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-2);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.completed {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .status-badge.processing {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .status-badge.failed {
          background: rgba(196, 92, 62, 0.2);
          color: var(--accent);
        }

        .status-badge.pending {
          background: rgba(148, 163, 184, 0.2);
          color: var(--ink-muted);
        }

        .video-info {
          padding: var(--space-4);
        }

        .video-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
          font-size: 0.8125rem;
        }

        .project-name {
          color: var(--accent);
          font-weight: 500;
        }

        .video-date {
          color: var(--ink-muted);
        }

        .video-title {
          margin: 0;
          font-size: 1rem;
          color: var(--ink-primary);
        }

        .error-text {
          font-size: 0.8125rem;
          color: var(--accent);
          margin: var(--space-2) 0 0;
        }

        .btn-play {
          position: absolute;
          bottom: var(--space-2);
          right: var(--space-2);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-play:hover {
          transform: scale(1.1);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 100;
        }

        .video-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 800px;
          background: var(--bg-primary);
          border-radius: 20px;
          overflow: hidden;
          z-index: 101;
        }

        .video-modal-header {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          border-bottom: 1px solid var(--border);
        }

        .video-modal-header h3 {
          margin: 0;
          font-size: 1rem;
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--ink-secondary);
          cursor: pointer;
        }

        .video-player {
          aspect-ratio: 16/9;
          background: black;
        }

        .video-player video {
          width: 100%;
          height: 100%;
        }

        .video-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--ink-muted);
          gap: var(--space-3);
        }

        .video-details {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-size: 0.875rem;
          color: var(--ink-muted);
        }

        .detail-value {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .detail-value.completed {
          color: #10b981;
        }

        .detail-value.failed {
          color: var(--accent);
        }

        .detail-value.processing {
          color: #f59e0b;
        }

        .btn-download {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--accent);
          border-radius: 10px;
          color: white;
          text-decoration: none;
          font-weight: 500;
          margin-top: var(--space-2);
        }

        .source-filter {
          display: flex;
          gap: var(--space-2);
          background: var(--bg-secondary);
          padding: var(--space-1);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .filter-tab {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-secondary);
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .filter-tab:hover {
          color: var(--ink-primary);
          background: var(--bg-tertiary);
        }

        .filter-tab.active {
          color: var(--accent);
          background: var(--bg-primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .source-badge {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-2);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .source-badge.webhook {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .source-badge.app {
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }

        @media (max-width: 640px) {
          .videos-grid,
          .skeleton-grid {
            grid-template-columns: 1fr;
          }

          .loading-header {
            padding: var(--space-6) 0 var(--space-4);
          }

          .loading-title {
            font-size: 1.25rem;
          }

          .videos-header {
            flex-direction: column;
            gap: var(--space-4);
            align-items: flex-start;
          }

          .source-filter {
            width: 100%;
            justify-content: stretch;
          }

          .filter-tab {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
