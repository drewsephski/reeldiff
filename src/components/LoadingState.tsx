import { useEffect, useState } from 'react';

const stages = [
  { label: 'Fetching PR', description: 'Retrieving pull request data' },
  { label: 'Analyzing changes', description: 'Reading diff and context' },
  { label: 'Crafting narrative', description: 'Building video storyboard' },
  { label: 'Generating video', description: 'Rendering scenes' },
];

export const LoadingState: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, stages.length - 1));
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 0.8, 98));
    }, 100);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStage = stages[stageIndex];

  return (
    <div className="loading-state animate-reveal">
      <div className="loading-visual">
        {/* Minimal progress indicator */}
        <div className="progress-ring">
          <svg className="progress-svg" viewBox="0 0 100 100">
            <circle
              className="progress-track"
              cx="50"
              cy="50"
              r="44"
            />
            <circle
              className="progress-fill"
              cx="50"
              cy="50"
              r="44"
              style={{
                strokeDasharray: 276,
                strokeDashoffset: 276 - (276 * progress) / 100,
              }}
            />
          </svg>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="loading-content">
        <div className="stage-info">
          <span className="text-caption-accent stage-number">
            Step {stageIndex + 1} of {stages.length}
          </span>
          <h2 className="text-title stage-label">{currentStage.label}</h2>
          <p className="text-body stage-description">{currentStage.description}</p>
        </div>

        {/* Stage indicators */}
        <div className="stage-indicators">
          {stages.map((_, index) => (
            <div
              key={index}
              className={`stage-dot ${index <= stageIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-8) 0;
        }

        .loading-visual {
          position: relative;
        }

        .progress-ring {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .progress-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .progress-track {
          fill: none;
          stroke: var(--border);
          stroke-width: 3;
        }

        .progress-fill {
          fill: none;
          stroke: var(--accent);
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.1s linear;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-body);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ink-primary);
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
          text-align: center;
        }

        .stage-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .stage-number {
          color: var(--accent);
        }

        .stage-label {
          font-size: 1.5rem;
          animation: reveal-up 0.4s var(--ease-out-expo);
        }

        .stage-description {
          color: var(--ink-tertiary);
          animation: reveal-up 0.4s var(--ease-out-expo) 0.05s forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .stage-indicators {
          display: flex;
          gap: var(--space-2);
        }

        .stage-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border);
          transition: all var(--duration-normal) var(--ease-out-quart);
        }

        .stage-dot.active {
          background: var(--accent);
          transform: scale(1.2);
        }

        @media (max-width: 640px) {
          .loading-state {
            gap: var(--space-6);
          }

          .progress-ring {
            width: 100px;
            height: 100px;
          }

          .progress-text {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
};
