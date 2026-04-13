import { motion, AnimatePresence } from 'framer-motion';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyCredits: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onBuyCredits,
}) => {
  const handleBuy = () => {
    onClose();
    onBuyCredits();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="paywall-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="paywall-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="paywall-icon">💳</div>
            <h2>You&apos;re out of credits!</h2>
            <p>
              You&apos;ve used your free video and all purchased credits.
              Buy more to continue generating videos.
            </p>

            <div className="paywall-actions">
              <button className="paywall-buy-btn" onClick={handleBuy}>
                Buy Credits
              </button>
              <button className="paywall-cancel-btn" onClick={onClose}>
                Maybe Later
              </button>
            </div>

            <style>{`
              .paywall-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 100;
              }

              .paywall-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 420px;
                background: var(--bg-primary);
                border-radius: 16px;
                padding: 40px 32px;
                z-index: 101;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              }

              .paywall-icon {
                font-size: 3rem;
                margin-bottom: 16px;
                animation: bounce 1s ease-in-out infinite;
              }

              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }

              .paywall-modal h2 {
                font-family: var(--font-display);
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0 0 12px;
                color: var(--ink-primary);
              }

              .paywall-modal p {
                font-size: 0.9375rem;
                color: var(--ink-tertiary);
                margin: 0 0 28px;
                line-height: 1.6;
              }

              .paywall-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
              }

              .paywall-buy-btn {
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
              }

              .paywall-buy-btn:hover {
                background: var(--accent-hover);
                transform: translateY(-1px);
              }

              .paywall-cancel-btn {
                padding: 12px 24px;
                font-family: var(--font-body);
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--ink-secondary);
                background: transparent;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all var(--duration-fast);
              }

              .paywall-cancel-btn:hover {
                color: var(--ink-primary);
                background: var(--bg-secondary);
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
