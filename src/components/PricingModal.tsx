import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser } from '@clerk/clerk-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$5',
    credits: 5,
    popular: false,
    description: 'Perfect for trying it out',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$15',
    credits: 20,
    popular: true,
    description: 'Best value for creators',
    savings: '25% savings',
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePurchase = async (tier: string) => {
    setLoading(tier);
    setError(null);

    try {
      const token = await getToken();
      const email = user?.primaryEmailAddress?.emailAddress;

      if (!token) {
        throw new Error('Not authenticated');
      }
      if (!email) {
        throw new Error('Email required for checkout');
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="pricing-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="pricing-modal-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="pricing-modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.92, y: isOpen ? 0 : 24 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            >
            <div className="pricing-header">
              <div className="pricing-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                  <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="16" cy="16" r="3" fill="currentColor"/>
                </svg>
              </div>
              <h2>Buy Credits</h2>
              <p>Generate more videos from your PRs and repos</p>
              <button className="close-btn" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L7 7M7 7L1 13M7 7L13 1M7 7L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {error && (
              <div className="pricing-error">{error}</div>
            )}

            <div className="pricing-tiers">
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`pricing-tier ${tier.popular ? 'popular' : ''}`}
                >
                  {tier.popular && <span className="popular-badge">Most Popular</span>}
                  <h3>{tier.name}</h3>
                  <div className="tier-price">
                    <span className="price">{tier.price}</span>
                  </div>
                  <p className="tier-credits">
                    <strong>{tier.credits} credits</strong>
                    <span className="credit-hint">1 credit = 1 video</span>
                  </p>
                  <p className="tier-description">{tier.description}</p>
                  {tier.savings && <span className="savings-badge">{tier.savings}</span>}
                  <button
                    className="buy-btn"
                    onClick={() => handlePurchase(tier.id)}
                    disabled={loading === tier.id}
                  >
                    {loading === tier.id ? (
                      <span className="loading-spinner" />
                    ) : (
                      `Buy ${tier.name}`
                    )}
                  </button>
                </div>
              ))}
            </div>

            <p className="pricing-note">
              One-time payment. Credits never expire.
            </p>

            <style>{`
              .pricing-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(8px);
                z-index: 100;
              }

              .pricing-modal-wrapper {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                z-index: 101;
                overflow-y: auto;
                overscroll-behavior: contain;
              }

              .pricing-modal {
                position: relative;
                width: 100%;
                max-width: 720px;
                max-height: calc(100vh - 48px);
                overflow-y: auto;
                background: var(--bg-primary);
                border-radius: 20px;
                padding: 36px;
                box-shadow: 
                  0 25px 80px rgba(0, 0, 0, 0.35),
                  0 0 0 1px rgba(255, 255, 255, 0.05) inset;
                scrollbar-width: thin;
                scrollbar-color: var(--border) transparent;
              }

              .pricing-modal::-webkit-scrollbar {
                width: 6px;
              }

              .pricing-modal::-webkit-scrollbar-track {
                background: transparent;
                margin: 8px 0;
              }

              .pricing-modal::-webkit-scrollbar-thumb {
                background: var(--border);
                border-radius: 3px;
              }

              .pricing-modal::-webkit-scrollbar-thumb:hover {
                background: var(--border-strong);
              }

              .pricing-header {
                text-align: center;
                margin-bottom: 28px;
                position: relative;
              }

              .pricing-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 56px;
                height: 56px;
                margin: 0 auto 16px;
                color: var(--accent);
                background: linear-gradient(135deg, rgba(196, 92, 62, 0.1) 0%, rgba(196, 92, 62, 0.05) 100%);
                border-radius: 14px;
              }

              .pricing-header h2 {
                font-family: var(--font-display);
                font-size: 1.625rem;
                font-weight: 600;
                margin: 0 0 6px;
                color: var(--ink-primary);
                letter-spacing: -0.01em;
              }

              .pricing-header p {
                font-size: 0.9375rem;
                color: var(--ink-tertiary);
                margin: 0;
              }

              .close-btn {
                position: absolute;
                top: -12px;
                right: -12px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: var(--bg-secondary);
                color: var(--ink-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .close-btn:hover {
                background: var(--bg-tertiary);
                color: var(--ink-primary);
                transform: rotate(90deg);
              }

              .pricing-error {
                background: rgba(196, 92, 62, 0.08);
                border: 1px solid rgba(196, 92, 62, 0.2);
                color: var(--accent);
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 0.875rem;
                text-align: center;
              }

              .pricing-tiers {
                display: flex;
                flex-direction: row;
                gap: 20px;
                margin-bottom: 20px;
              }

              .pricing-tier {
                position: relative;
                flex: 1;
                padding: 28px 20px;
                background: var(--bg-secondary);
                border: 2px solid var(--border);
                border-radius: 14px;
                text-align: center;
                transition: all var(--duration-fast);
                display: flex;
                flex-direction: column;
              }

              .pricing-tier.popular {
                border-color: var(--accent);
                background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(196, 92, 62, 0.05) 100%);
              }

              .pricing-tier:hover {
                border-color: var(--border-strong);
                transform: translateY(-2px);
              }

              .pricing-tier.popular:hover {
                border-color: var(--accent);
              }

              .popular-badge {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--accent);
                color: white;
                font-size: 0.6875rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                padding: 4px 12px;
                border-radius: 20px;
              }

              .pricing-tier h3 {
                font-family: var(--font-display);
                font-size: 1.25rem;
                font-weight: 600;
                margin: 0 0 12px;
                color: var(--ink-primary);
              }

              .tier-price {
                margin-bottom: 12px;
              }

              .price {
                font-family: var(--font-display);
                font-size: 2.5rem;
                font-weight: 700;
                color: var(--ink-primary);
              }

              .tier-credits {
                margin: 0 0 12px;
                font-size: 1rem;
                color: var(--ink-secondary);
              }

              .tier-credits strong {
                color: var(--accent);
              }

              .credit-hint {
                display: block;
                font-size: 0.75rem;
                color: var(--ink-muted);
                margin-top: 4px;
              }

              .tier-description {
                font-size: 0.875rem;
                color: var(--ink-tertiary);
                margin: 0 0 16px;
                flex-grow: 1;
              }

              .savings-badge {
                display: inline-block;
                background: rgba(76, 175, 80, 0.1);
                color: #4caf50;
                font-size: 0.75rem;
                font-weight: 600;
                padding: 4px 10px;
                border-radius: 20px;
                margin-bottom: 16px;
              }

              .buy-btn {
                width: 100%;
                padding: 14px 24px;
                font-family: var(--font-body);
                font-size: 0.9375rem;
                font-weight: 600;
                color: white;
                background: var(--accent);
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all var(--duration-fast);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              }

              .buy-btn:hover:not(:disabled) {
                background: var(--accent-hover);
                transform: translateY(-1px);
              }

              .buy-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
              }

              .loading-spinner {
                width: 18px;
                height: 18px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              }

              @keyframes spin {
                to { transform: rotate(360deg); }
              }

              .pricing-note {
                text-align: center;
                font-size: 0.8125rem;
                color: var(--ink-muted);
                margin: 0;
              }
            `}</style>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
