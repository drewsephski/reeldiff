import { useState, useEffect } from 'react';
import { getCredits, getEffectiveCredits, type CreditInfo } from '../lib/credits';

interface CreditDisplayProps {
  onBuyCredits: () => void;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ onBuyCredits }) => {
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const info = await getCredits();
      setCreditInfo(info);
    } catch (error) {
      console.error('Failed to load credits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose reload method globally for other components
  useEffect(() => {
    (window as Window & { reloadCredits?: () => void }).reloadCredits = loadCredits;
    return () => {
      delete (window as Window & { reloadCredits?: () => void }).reloadCredits;
    };
  }, []);

  if (loading) {
    return (
      <div className="credit-display loading">
        <span className="credit-icon">💳</span>
        <span className="credit-text">...</span>
      </div>
    );
  }

  if (!creditInfo) {
    return null;
  }

  const effectiveCredits = getEffectiveCredits(creditInfo);
  const isLow = effectiveCredits <= 1;

  return (
    <button
      className={`credit-display ${isLow ? 'low' : ''}`}
      onClick={onBuyCredits}
      title={isLow ? 'Running low on credits!' : 'Click to buy more credits'}
    >
      <span className="credit-icon">💳</span>
      <span className="credit-text">
        {effectiveCredits} {effectiveCredits === 1 ? 'credit' : 'credits'}
      </span>
      <style>{`
        .credit-display {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out-quart);
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-secondary);
        }

        .credit-display:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
          transform: translateY(-1px);
        }

        .credit-display.low {
          background: rgba(196, 92, 62, 0.08);
          border-color: rgba(196, 92, 62, 0.3);
          color: var(--accent);
          animation: pulse-credit 2s ease-in-out infinite;
        }

        .credit-display.low:hover {
          background: rgba(196, 92, 62, 0.12);
          border-color: var(--accent);
        }

        .credit-display.loading {
          opacity: 0.5;
          cursor: default;
        }

        .credit-display.loading:hover {
          transform: none;
          background: var(--bg-secondary);
        }

        .credit-icon {
          font-size: 1rem;
        }

        @keyframes pulse-credit {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196, 92, 62, 0.2); }
          50% { box-shadow: 0 0 0 4px rgba(196, 92, 62, 0); }
        }
      `}</style>
    </button>
  );
};
