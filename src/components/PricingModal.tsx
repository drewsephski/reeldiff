import { useState } from 'react';
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
  const { getToken } = useAuth();
  const { user } = useUser();

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
      {isOpen && (
        <>
          <motion.div
            className="pricing-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="pricing-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="pricing-header">
              <h2>Buy Credits</h2>
              <p>Generate more videos from your PRs and repos</p>
              <button className="close-btn" onClick={onClose}>×</button>
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
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 100;
              }

              .pricing-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 520px;
                max-height: 90vh;
                overflow-y: auto;
                background: var(--bg-primary);
                border-radius: 16px;
                padding: 32px;
                z-index: 101;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              }

              .pricing-header {
                text-align: center;
                margin-bottom: 24px;
                position: relative;
              }

              .pricing-header h2 {
                font-family: var(--font-display);
                font-size: 1.75rem;
                font-weight: 600;
                margin: 0 0 8px;
                color: var(--ink-primary);
              }

              .pricing-header p {
                font-size: 0.9375rem;
                color: var(--ink-tertiary);
                margin: 0;
              }

              .close-btn {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: none;
                background: var(--bg-secondary);
                color: var(--ink-secondary);
                font-size: 1.5rem;
                line-height: 1;
                cursor: pointer;
                transition: all var(--duration-fast);
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .close-btn:hover {
                background: var(--bg-tertiary);
                color: var(--ink-primary);
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
                flex-direction: column;
                gap: 16px;
                margin-bottom: 20px;
              }

              .pricing-tier {
                position: relative;
                padding: 24px;
                background: var(--bg-secondary);
                border: 2px solid var(--border);
                border-radius: 12px;
                text-align: center;
                transition: all var(--duration-fast);
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
                margin: 0 0 8px;
                font-size: 0.9375rem;
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
        </>
      )}
    </AnimatePresence>
  );
};
