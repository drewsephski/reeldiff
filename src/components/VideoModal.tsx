import { useEffect, useCallback } from 'react';
import type { ComponentType } from 'react';
import { Player } from '@remotion/player';
import { PatchPlayComposition } from '../video/Composition';
import { RepoComposition } from '../video/RepoComposition';
import { calculateDuration } from '../video/durations';
import type { VideoData } from '../types';
import { isRepoVideoScript } from '../types';

interface VideoModalProps {
  videoData: VideoData;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ videoData, isOpen, onClose }: VideoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="video-modal">
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal content */}
      <div className="modal-content">
        {/* Close button */}
        <button onClick={onClose} className="modal-close" aria-label="Close video">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
          </svg>
        </button>

        {/* Video container */}
        <div className="video-container">
          <Player
            component={(
              isRepoVideoScript(videoData) 
                ? RepoComposition 
                : PatchPlayComposition
            ) as unknown as ComponentType<Record<string, unknown>>}
            inputProps={videoData as unknown as Record<string, unknown>}
            durationInFrames={calculateDuration(videoData.summary.bullets.length)}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            autoPlay
            style={{
              width: '100%',
              borderRadius: 8,
            }}
            controls
          />
        </div>

        {/* Video info */}
        <div className="video-meta">
          <span className="text-caption-accent">Generated video</span>
          <span className="text-small">
            {videoData.meta.repoName}
            {isRepoVideoScript(videoData) 
              ? ` · ⭐ ${videoData.meta.stars.toLocaleString()} stars` 
              : ` · PR #${videoData.meta.prNumber}`}
          </span>
        </div>
      </div>

      <style>{`
        .video-modal {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
          animation: fade-in 0.3s var(--ease-out-quart);
        }

        .modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(26, 22, 18, 0.9);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          width: 100%;
          max-width: 1100px;
          animation: reveal-scale 0.3s var(--ease-out-expo);
        }

        .modal-close {
          position: absolute;
          top: -48px;
          right: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink-muted);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out-quart);
        }

        .modal-close:hover {
          color: var(--ink-primary);
          background: var(--bg-secondary);
          border-color: var(--border-strong);
        }

        .video-container {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 60px -12px rgba(26, 22, 18, 0.4);
        }

        .video-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-4);
          padding: var(--space-3) 0;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 768px) {
          .video-modal {
            padding: var(--space-4);
          }

          .modal-close {
            top: -40px;
          }

          .video-meta {
            flex-direction: column;
            gap: var(--space-2);
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
