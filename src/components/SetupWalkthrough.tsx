import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Hash,
  GitBranch,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SetupWalkthroughProps {
  projectId: string;
  repoOwner: string;
  repoName: string;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'welcome' | 'slack' | 'discord' | 'github' | 'complete';

export function SetupWalkthrough({
  projectId,
  repoOwner,
  repoName,
  onClose,
  onComplete,
}: SetupWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [skipSlack, setSkipSlack] = useState(false);
  const [skipDiscord, setSkipDiscord] = useState(false);

  const steps: { id: Step; label: string }[] = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'slack', label: 'Slack' },
    { id: 'discord', label: 'Discord' },
    { id: 'github', label: 'GitHub' },
    { id: 'complete', label: 'Done' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = async () => {
    if (currentStep === 'slack' && slackWebhook && !skipSlack) {
      await saveWebhook('slack', slackWebhook);
    }
    if (currentStep === 'discord' && discordWebhook && !skipDiscord) {
      await saveWebhook('discord', discordWebhook);
    }

    const nextSteps: Record<Step, Step | null> = {
      welcome: 'slack',
      slack: 'discord',
      discord: 'github',
      github: 'complete',
      complete: null,
    };

    const next = nextSteps[currentStep];
    if (next) {
      setCurrentStep(next);
    }
  };

  const handleBack = () => {
    const prevSteps: Record<Step, Step | null> = {
      welcome: null,
      slack: 'welcome',
      discord: 'slack',
      github: 'discord',
      complete: 'github',
    };

    const prev = prevSteps[currentStep];
    if (prev) {
      setCurrentStep(prev);
    }
  };

  const saveWebhook = async (type: 'slack' | 'discord', url: string) => {
    setIsSaving(true);
    try {
      const updateData: { project_id: string; slack_webhook_url?: string; discord_webhook_url?: string } = {
        project_id: projectId,
      };
      updateData[type === 'slack' ? 'slack_webhook_url' : 'discord_webhook_url'] = url;

      const { error } = await supabase
        .from('webhook_configs')
        .upsert(updateData, {
          onConflict: 'project_id',
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to save webhook:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    const url = `${import.meta.env.VITE_API_URL || window.location.origin}/api/github-webhook`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'slack':
        return skipSlack || !slackWebhook || slackWebhook.startsWith('https://hooks.slack.com/');
      case 'discord':
        return skipDiscord || !discordWebhook || discordWebhook.startsWith('https://discord.com/api/webhooks/');
      default:
        return true;
    }
  };

  return (
    <div className="setup-walkthrough">
      {/* Progress Header */}
      <div className="walkthrough-header">
        <div className="step-indicators">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`step-dot ${
                index < currentStepIndex
                  ? 'completed'
                  : index === currentStepIndex
                  ? 'active'
                  : ''
              }`}
            >
              {index < currentStepIndex ? (
                <Check size={14} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-close-walkthrough">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="walkthrough-content">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content"
            >
              <div className="step-icon welcome">
                <Sparkles size={32} />
              </div>
              <h2 className="step-title">You're all set up!</h2>
              <p className="step-description">
                <strong>
                  {repoOwner}/{repoName}
                </strong>{' '}
                is now connected. Let's configure where you want to receive your generated videos.
              </p>
              <div className="feature-preview">
                <div className="preview-item">
                  <CheckCircle2 size={18} className="preview-check" />
                  <span>Automatic video generation on PR merges</span>
                </div>
                <div className="preview-item">
                  <CheckCircle2 size={18} className="preview-check" />
                  <span>Instant Slack & Discord notifications</span>
                </div>
                <div className="preview-item">
                  <CheckCircle2 size={18} className="preview-check" />
                  <span>No-code GitHub integration</span>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'slack' && (
            <motion.div
              key="slack"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content"
            >
              <div className="step-icon slack">
                <MessageSquare size={32} />
              </div>
              <h2 className="step-title">Connect Slack</h2>
              <p className="step-description">
                Get notified in your Slack workspace whenever a new video is generated.
              </p>

              <div className="setup-instructions">
                <h4>How to create a Slack webhook:</h4>
                <ol>
                  <li>
                    Go to your{' '}
                    <a
                      href="https://api.slack.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Slack App Management
                      <ExternalLink size={12} />
                    </a>
                  </li>
                  <li>Create New App → From scratch</li>
                  <li>Go to Incoming Webhooks → Activate</li>
                  <li>Click "Add New Webhook to Workspace"</li>
                  <li>Choose a channel and authorize</li>
                  <li>Copy the webhook URL and paste it below</li>
                </ol>
              </div>

              <div className="webhook-input-section">
                <label className="input-label">
                  Slack Webhook URL
                  <span className="optional-badge">Optional</span>
                </label>
                <input
                  type="url"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                  className="webhook-input"
                  disabled={skipSlack}
                />
                {slackWebhook && !slackWebhook.startsWith('https://hooks.slack.com/') && (
                  <span className="input-error">
                    <AlertCircle size={14} />
                    URL should start with https://hooks.slack.com/
                  </span>
                )}
              </div>

              <label className="skip-option">
                <input
                  type="checkbox"
                  checked={skipSlack}
                  onChange={(e) => setSkipSlack(e.target.checked)}
                />
                <span>Skip Slack for now</span>
              </label>
            </motion.div>
          )}

          {currentStep === 'discord' && (
            <motion.div
              key="discord"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content"
            >
              <div className="step-icon discord">
                <Hash size={32} />
              </div>
              <h2 className="step-title">Connect Discord</h2>
              <p className="step-description">
                Get video notifications sent directly to your Discord server.
              </p>

              <div className="setup-instructions">
                <h4>How to create a Discord webhook:</h4>
                <ol>
                  <li>Open your Discord server settings</li>
                  <li>Go to Integrations → Webhooks</li>
                  <li>Click "New Webhook"</li>
                  <li>Choose a channel and name it (e.g., "ReelDiff")</li>
                  <li>Click "Copy Webhook URL"</li>
                  <li>Paste it below</li>
                </ol>
              </div>

              <div className="webhook-input-section">
                <label className="input-label">
                  Discord Webhook URL
                  <span className="optional-badge">Optional</span>
                </label>
                <input
                  type="url"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="webhook-input"
                  disabled={skipDiscord}
                />
                {discordWebhook && !discordWebhook.startsWith('https://discord.com/api/webhooks/') && (
                  <span className="input-error">
                    <AlertCircle size={14} />
                    URL should start with https://discord.com/api/webhooks/
                  </span>
                )}
              </div>

              <label className="skip-option">
                <input
                  type="checkbox"
                  checked={skipDiscord}
                  onChange={(e) => setSkipDiscord(e.target.checked)}
                />
                <span>Skip Discord for now</span>
              </label>
            </motion.div>
          )}

          {currentStep === 'github' && (
            <motion.div
              key="github"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content"
            >
              <div className="step-icon github">
                <GitBranch size={32} />
              </div>
              <h2 className="step-title">Install GitHub App</h2>
              <p className="step-description">
                Connect your repository to ReelDiff. Choose the automatic GitHub App install (recommended) or manual webhook setup.
              </p>

              <div className="setup-options">
                {/* Option 1: GitHub App (Recommended) */}
                <div className="setup-option-card recommended">
                  <div className="option-badge">Recommended</div>
                  <h4>
                    <GitBranch size={18} />
                    Automatic GitHub App
                  </h4>
                  <p>One-click installation. No configuration needed.</p>
                  <a
                    href={`https://github.com/apps/reeldiff/installations/new?select_target=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-setup-option"
                  >
                    Install ReelDiff App
                    <ExternalLink size={14} />
                  </a>
                  <span className="option-note">
                    Opens GitHub in a new tab. Select <strong>{repoOwner}/{repoName}</strong> during install.
                  </span>
                </div>

                {/* Divider */}
                <div className="setup-divider">
                  <span>or</span>
                </div>

                {/* Option 2: Manual Webhook */}
                <div className="setup-option-card">
                  <h4>
                    <AlertCircle size={18} />
                    Manual Webhook Setup
                  </h4>
                  <p>Use this if you can't install apps on the repository.</p>
                  <div className="webhook-url-section">
                    <label>Your webhook URL:</label>
                    <div className="webhook-url-copy">
                      <code>
                        {`${import.meta.env.VITE_API_URL || window.location.origin}/api/github-webhook`}
                      </code>
                      <button onClick={copyWebhookUrl} className="btn-copy">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <details className="manual-steps">
                    <summary>Setup instructions</summary>
                    <ol>
                      <li>Go to your repo on GitHub → Settings → Webhooks</li>
                      <li>Click "Add webhook"</li>
                      <li>Paste the URL above</li>
                      <li>Set Content type to <code>application/json</code></li>
                      <li>Select events: <code>Pull requests</code>, <code>Releases</code></li>
                      <li>Click "Add webhook"</li>
                    </ol>
                  </details>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="step-content"
            >
              <div className="step-icon complete">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="step-title">You're ready to go!</h2>
              <p className="step-description">
                Your repository is fully configured. Here's what happens next:
              </p>

              <div className="completion-summary">
                <div className="summary-item">
                  <span className="summary-label">Repository</span>
                  <span className="summary-value">
                    {repoOwner}/{repoName}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Slack</span>
                  <span className={`summary-value ${slackWebhook ? 'active' : ''}`}>
                    {slackWebhook ? 'Connected' : skipSlack ? 'Skipped' : 'Not configured'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Discord</span>
                  <span className={`summary-value ${discordWebhook ? 'active' : ''}`}>
                    {discordWebhook ? 'Connected' : skipDiscord ? 'Skipped' : 'Not configured'}
                  </span>
                </div>
              </div>

              <div className="next-steps-hint">
                <p>
                  Videos will be automatically generated when PRs are merged. You can always update these settings in Project Settings.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="walkthrough-footer">
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <button onClick={handleBack} className="btn-back">
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        {currentStep === 'complete' ? (
          <button onClick={onComplete} className="btn-finish">
            <Check size={16} />
            Finish Setup
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed() || isSaving}
            className="btn-next"
          >
            {isSaving ? (
              <>
                <span className="spinner-small" />
                Saving...
              </>
            ) : (
              <>
                {currentStep === 'welcome' ? 'Get Started' : 'Continue'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        .setup-walkthrough {
          width: 100%;
          max-width: 520px;
          background: var(--bg-primary);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
        }

        .walkthrough-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--border);
        }

        .step-indicators {
          display: flex;
          gap: var(--space-2);
        }

        .step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all var(--duration-fast);
          background: var(--bg-secondary);
          color: var(--ink-muted);
          border: 1px solid var(--border);
        }

        .step-dot.completed {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .step-dot.active {
          background: var(--bg-primary);
          color: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(196, 92, 62, 0.15);
        }

        .btn-close-walkthrough {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-close-walkthrough:hover {
          background: var(--bg-tertiary);
          color: var(--ink-primary);
        }

        .walkthrough-content {
          padding: var(--space-6) var(--space-6) var(--space-4);
          min-height: 360px;
          max-height: calc(90vh - 180px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) var(--bg-secondary);
        }

        .walkthrough-content::-webkit-scrollbar {
          width: 6px;
        }

        .walkthrough-content::-webkit-scrollbar-track {
          background: var(--bg-secondary);
          border-radius: 3px;
        }

        .walkthrough-content::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .setup-walkthrough {
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .step-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-4);
        }

        .step-icon.welcome {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .step-icon.slack {
          background: linear-gradient(135deg, #611f69 0%, #4a154b 100%);
          color: white;
        }

        .step-icon.discord {
          background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
          color: white;
        }

        .step-icon.github {
          background: linear-gradient(135deg, #24292f 0%, #000000 100%);
          color: white;
        }

        .step-icon.complete {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ink-primary);
          margin: 0 0 var(--space-2);
        }

        .step-description {
          color: var(--ink-secondary);
          font-size: 0.9375rem;
          line-height: 1.6;
          margin: 0 0 var(--space-4);
          max-width: 400px;
        }

        .feature-preview {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          align-items: flex-start;
          padding: var(--space-4);
          background: var(--bg-secondary);
          border-radius: 12px;
          width: 100%;
          max-width: 360px;
        }

        .preview-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 0.875rem;
          color: var(--ink-primary);
        }

        .preview-check {
          color: var(--accent);
          flex-shrink: 0;
        }

        .setup-instructions {
          text-align: left;
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: var(--space-4);
          margin: var(--space-4) 0;
          width: 100%;
        }

        .setup-instructions h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ink-primary);
          margin: 0 0 var(--space-3);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .setup-instructions ol {
          margin: 0;
          padding-left: var(--space-4);
          font-size: 0.8125rem;
          color: var(--ink-secondary);
          line-height: 1.7;
        }

        .setup-instructions li {
          margin-bottom: var(--space-1);
        }

        .setup-instructions a {
          color: var(--accent);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .setup-instructions a:hover {
          text-decoration: underline;
        }

        .webhook-input-section {
          width: 100%;
          text-align: left;
          margin-top: var(--space-3);
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-primary);
          margin-bottom: var(--space-2);
        }

        .optional-badge {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          background: var(--bg-tertiary);
          color: var(--ink-muted);
          border-radius: 4px;
        }

        .webhook-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--ink-primary);
          font-size: 0.875rem;
          transition: border-color var(--duration-fast);
        }

        .webhook-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .webhook-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-error {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 0.75rem;
          color: var(--accent);
          margin-top: var(--space-2);
        }

        .skip-option {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          color: var(--ink-secondary);
          cursor: pointer;
          margin-top: var(--space-3);
        }

        .skip-option input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
        }

        .setup-options {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .setup-option-card {
          text-align: left;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: var(--space-4);
          position: relative;
        }

        .setup-option-card.recommended {
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent);
        }

        .option-badge {
          position: absolute;
          top: -8px;
          right: var(--space-3);
          background: var(--accent);
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 10px;
          border-radius: 4px;
        }

        .setup-option-card h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--ink-primary);
          margin: 0 0 var(--space-2);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .setup-option-card p {
          font-size: 0.8125rem;
          color: var(--ink-secondary);
          margin: 0 0 var(--space-3);
        }

        .btn-setup-option {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: linear-gradient(135deg, #24292f 0%, #000000 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          border-radius: 8px;
          transition: all var(--duration-fast);
        }

        .btn-setup-option:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .option-note {
          display: block;
          font-size: 0.75rem;
          color: var(--ink-muted);
          margin-top: var(--space-2);
        }

        .setup-divider {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--ink-muted);
          font-size: 0.8125rem;
        }

        .setup-divider::before,
        .setup-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .webhook-url-section {
          margin: var(--space-3) 0;
        }

        .webhook-url-section label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--ink-muted);
          margin-bottom: var(--space-2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .manual-steps {
          margin-top: var(--space-3);
        }

        .manual-steps summary {
          font-size: 0.8125rem;
          color: var(--accent);
          cursor: pointer;
          user-select: none;
        }

        .manual-steps ol {
          margin: var(--space-3) 0 0;
          padding-left: var(--space-4);
          font-size: 0.75rem;
          color: var(--ink-secondary);
          line-height: 1.7;
          max-height: 150px;
          overflow-y: auto;
        }

        .manual-steps li {
          margin-bottom: var(--space-1);
        }

        .manual-steps code {
          font-family: var(--font-mono);
          background: var(--bg-tertiary);
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 0.6875rem;
        }

        .webhook-url-copy {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: var(--space-2) var(--space-3);
        }

        .webhook-url-copy code {
          flex: 1;
          font-size: 0.6875rem;
          color: var(--ink-secondary);
          font-family: var(--font-mono);
          word-break: break-all;
        }

        .btn-copy {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--ink-secondary);
          cursor: pointer;
          flex-shrink: 0;
        }

        .btn-copy:hover {
          color: var(--ink-primary);
        }

        .completion-summary {
          width: 100%;
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: var(--space-4);
          margin: var(--space-4) 0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--border);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          font-size: 0.875rem;
          color: var(--ink-secondary);
        }

        .summary-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-muted);
        }

        .summary-value.active {
          color: #10b981;
        }

        .next-steps-hint {
          padding: var(--space-3) var(--space-4);
          background: rgba(196, 92, 62, 0.08);
          border-radius: 10px;
        }

        .next-steps-hint p {
          font-size: 0.8125rem;
          color: var(--ink-secondary);
          margin: 0;
        }

        .walkthrough-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--ink-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-back:hover {
          background: var(--bg-tertiary);
          color: var(--ink-primary);
        }

        .btn-next,
        .btn-finish {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
          margin-left: auto;
        }

        .btn-next:hover:not(:disabled),
        .btn-finish:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(196, 92, 62, 0.3);
        }

        .btn-next:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
