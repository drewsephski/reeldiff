import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  GitBranch,
  MessageSquare,
  Hash,
  Play,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  X,
  Zap,
  Video,
  Bell,
  RefreshCw
} from 'lucide-react';
import { useSupabase } from '../lib/supabase';

interface SetupWizardProps {
  projectId: string;
  repoOwner: string;
  repoName: string;
  onClose: () => void;
  onComplete: () => void;
}

type StepStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

interface Step {
  id: string;
  title: string;
  description: string;
  required: boolean;
  status: StepStatus;
}

export function SetupWizard({
  projectId,
  repoOwner,
  repoName,
  onClose,
  onComplete,
}: SetupWizardProps) {
  const supabase = useSupabase();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step data
  const [githubInstalled, setGithubInstalled] = useState(false);
  const [slackUrl, setSlackUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Check if GitHub app is already installed for this project
  useEffect(() => {
    const checkInstallation = async () => {
      const { data } = await supabase
        .from('projects')
        .select('github_app_installation_id')
        .eq('id', projectId)
        .single();
      
      if (data?.github_app_installation_id) {
        setGithubInstalled(true);
        return true; // Found it
      }
      return false; // Not found
    };
    
    // Check immediately
    checkInstallation();
    
    // Poll every 3 seconds until found (in case user just installed it)
    const interval = setInterval(async () => {
      const found = await checkInstallation();
      if (found) {
        clearInterval(interval);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [projectId, supabase]);

  const steps: Step[] = [
    {
      id: 'github',
      title: 'Connect GitHub',
      description: 'Install the ReelDiff app on your repository',
      required: true,
      status: 'in-progress',
    },
    {
      id: 'notifications',
      title: 'Get Notified',
      description: 'Choose where to receive your videos (optional)',
      required: false,
      status: 'pending',
    },
    {
      id: 'test',
      title: 'Test It Out',
      description: 'Make sure everything is working',
      required: false,
      status: 'pending',
    },
  ];

  const handleNext = async () => {
    const currentStep = steps[currentStepIndex];
    
    // Save any data from current step
    if (currentStep.id === 'notifications') {
      await saveNotificationSettings();
    }
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const saveNotificationSettings = async () => {
    if (!slackUrl && !discordUrl) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .upsert({
          project_id: projectId,
          slack_webhook_url: slackUrl || null,
          discord_webhook_url: discordUrl || null,
          events: ['pr_merge'],
          auto_post_social: false,
        }, { onConflict: 'project_id' });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/github-webhook`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStep = steps[currentStepIndex];
  return (
    <div className="setup-wizard">
      {/* Header */}
      <div className="wizard-header">
        <div className="wizard-title">
          <div className="wizard-icon">
            <Video size={24} />
          </div>
          <div>
            <h2>Setup {repoOwner}/{repoName}</h2>
            <p>3 simple steps to automatic video generation</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-close">
          <X size={20} />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="step-progress">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-step ${step.status} ${index === currentStepIndex ? 'active' : ''}`}
          >
            <div className="step-number">
              {step.status === 'completed' ? (
                <CheckCircle2 size={18} />
              ) : step.status === 'skipped' ? (
                <Check size={14} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="step-info">
              <span className="step-title-sm">{step.title}</span>
              {step.required && <span className="required-badge">Required</span>}
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${step.status === 'completed' ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="wizard-content">
        <AnimatePresence mode="wait">
          {/* STEP 1: GitHub Connection */}
          {currentStep.id === 'github' && (
            <motion.div
              key="github"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-panel"
            >
              <div className="panel-header">
                <div className="panel-icon github">
                  <GitBranch size={32} />
                </div>
                <h3>Connect to GitHub</h3>
                <p className="panel-subtitle">
                  We need access to your repository to detect when pull requests are merged
                </p>
              </div>

              <div className="setup-options">
                {/* Option A: GitHub App (Recommended) */}
                <div className={`setup-card ${githubInstalled ? 'completed' : ''}`}>
                  <div className="card-badge recommended">
                    <Zap size={12} />
                    Recommended
                  </div>
                  <div className="card-header">
                    <GitBranch size={24} />
                    <div>
                      <h4>Install ReelDiff GitHub App</h4>
                      <p>One-click setup, automatic permissions</p>
                    </div>
                  </div>
                  
                  {!githubInstalled ? (
                    <>
                      <div className="benefits-list">
                        <div className="benefit">
                          <CheckCircle2 size={16} className="benefit-check" />
                          <span>Detects PR merges automatically</span>
                        </div>
                        <div className="benefit">
                          <CheckCircle2 size={16} className="benefit-check" />
                          <span>Works with private repositories</span>
                        </div>
                        <div className="benefit">
                          <CheckCircle2 size={16} className="benefit-check" />
                          <span>No manual configuration needed</span>
                        </div>
                      </div>
                      <div className="install-actions">
                        <a
                          href={`https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_SLUG || 'reeldiff-webhook'}/installations/new?state=${projectId}&redirect_uri=${encodeURIComponent(window.location.origin + '/github-callback')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary btn-large"
                        >
                          <GitBranch size={18} />
                          Install GitHub App
                          <ExternalLink size={14} />
                        </a>
                        <button 
                          onClick={async () => {
                            const { data } = await supabase
                              .from('projects')
                              .select('github_app_installation_id')
                              .eq('id', projectId)
                              .single();
                            if (data?.github_app_installation_id) {
                              setGithubInstalled(true);
                            }
                          }}
                          className="btn-refresh"
                          title="Check if installed"
                        >
                          <RefreshCw size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="success-state">
                      <CheckCircle2 size={32} className="success-icon" />
                      <span>GitHub App installed!</span>
                    </div>
                  )}
                </div>

                {/* Option B: Manual Webhook */}
                <div className="setup-divider">
                  <span>or set up manually</span>
                </div>

                <div className="setup-card manual">
                  <div className="card-header">
                    <Bell size={24} />
                    <div>
                      <h4>Manual Webhook Setup</h4>
                      <p>For advanced users who prefer manual configuration</p>
                    </div>
                  </div>
                  
                  <div className="webhook-url-box">
                    <label>Your webhook URL:</label>
                    <div className="url-copy-row">
                      <code>{`${window.location.origin}/api/github-webhook`}</code>
                      <button onClick={copyWebhookUrl} className="btn-copy">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <details className="manual-instructions">
                    <summary>How to set up manually</summary>
                    <ol>
                      <li>Go to your repository on GitHub</li>
                      <li>Click Settings → Webhooks → Add webhook</li>
                      <li>Paste the URL above in "Payload URL"</li>
                      <li>Set Content type to <code>application/json</code></li>
                      <li>Select "Pull requests" and "Pushes" events</li>
                      <li>Click Add webhook</li>
                    </ol>
                  </details>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Notifications */}
          {currentStep.id === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-panel"
            >
              <div className="panel-header">
                <div className="panel-icon notifications">
                  <Bell size={32} />
                </div>
                <h3>Where should we send videos?</h3>
                <p className="panel-subtitle">
                  Choose where to get notified when videos are ready. You can also view them anytime in your Videos dashboard.
                </p>
              </div>

              <div className="notification-options">
                {/* Slack Option */}
                <div className={`notification-card ${slackUrl ? 'active' : ''}`}>
                  <div className="notification-icon slack">
                    <MessageSquare size={24} />
                  </div>
                  <div className="notification-content">
                    <h4>Slack</h4>
                    <p>Get notifications in your Slack workspace</p>
                    
                    <input
                      type="url"
                      value={slackUrl}
                      onChange={(e) => setSlackUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="notification-input"
                    />
                    
                    {!slackUrl && (
                      <button 
                        className="btn-skip"
                        onClick={() => setSlackUrl('')}
                      >
                        Skip for now
                      </button>
                    )}
                  </div>
                </div>

                {/* Discord Option */}
                <div className={`notification-card ${discordUrl ? 'active' : ''}`}>
                  <div className="notification-icon discord">
                    <Hash size={24} />
                  </div>
                  <div className="notification-content">
                    <h4>Discord</h4>
                    <p>Post videos to a Discord channel</p>
                    
                    <input
                      type="url"
                      value={discordUrl}
                      onChange={(e) => setDiscordUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="notification-input"
                    />
                    
                    {!discordUrl && (
                      <button 
                        className="btn-skip"
                        onClick={() => setDiscordUrl('')}
                      >
                        Skip for now
                      </button>
                    )}
                  </div>
                </div>

                {/* Dashboard Only Option */}
                <div className={`notification-card ${!slackUrl && !discordUrl ? 'active' : ''}`}>
                  <div className="notification-icon dashboard">
                    <Video size={24} />
                  </div>
                  <div className="notification-content">
                    <h4>Dashboard Only</h4>
                    <p>Videos will be saved to your ReelDiff dashboard</p>
                    <span className="note">Access anytime at /videos</span>
                  </div>
                </div>
              </div>

              <div className="help-box">
                <AlertCircle size={16} />
                <p>
                  <strong>Don't have a webhook URL?</strong> You can add these later in Project Settings. 
                  Your videos will always be available in your dashboard.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Test */}
          {currentStep.id === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-panel"
            >
              <div className="panel-header">
                <div className="panel-icon test">
                  <Play size={32} />
                </div>
                <h3>You're all set!</h3>
                <p className="panel-subtitle">
                  Here's what happens next:
                </p>
              </div>

              <div className="completion-summary">
                <div className="summary-item">
                  <div className="summary-icon">
                    <GitBranch size={20} />
                  </div>
                  <div className="summary-text">
                    <span className="summary-label">GitHub Repository</span>
                    <span className="summary-value">{repoOwner}/{repoName}</span>
                  </div>
                  <CheckCircle2 size={20} className="summary-check" />
                </div>

                {(slackUrl || discordUrl) && (
                  <div className="summary-item">
                    <div className="summary-icon">
                      {slackUrl ? <MessageSquare size={20} /> : <Hash size={20} />}
                    </div>
                    <div className="summary-text">
                      <span className="summary-label">Notifications</span>
                      <span className="summary-value">
                        {slackUrl && discordUrl ? 'Slack & Discord' : slackUrl ? 'Slack' : 'Discord'}
                      </span>
                    </div>
                    <CheckCircle2 size={20} className="summary-check" />
                  </div>
                )}

                <div className="summary-item">
                  <div className="summary-icon">
                    <Video size={20} />
                  </div>
                  <div className="summary-text">
                    <span className="summary-label">Video Storage</span>
                    <span className="summary-value">ReelDiff Dashboard</span>
                  </div>
                  <CheckCircle2 size={20} className="summary-check" />
                </div>
              </div>

              <div className="next-steps">
                <h4>What happens next?</h4>
                <div className="next-step-item">
                  <div className="step-num">1</div>
                  <p>Merge a pull request in <strong>{repoName}</strong></p>
                </div>
                <div className="next-step-item">
                  <div className="step-num">2</div>
                  <p>ReelDiff automatically generates a video summary</p>
                </div>
                <div className="next-step-item">
                  <div className="step-num">3</div>
                  <p>Video appears in your dashboard{slackUrl || discordUrl ? ' and gets posted to your channels' : ''}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="wizard-footer">
        <button
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="btn-secondary"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="step-indicator">
          Step {currentStepIndex + 1} of {steps.length}
        </div>

        <button
          onClick={handleNext}
          disabled={isLoading}
          className="btn-primary"
        >
          {currentStepIndex === steps.length - 1 ? (
            <>
              <CheckCircle2 size={16} />
              Complete Setup
            </>
          ) : (
            <>
              Continue
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

      {currentStepIndex === steps.length - 1 && (
        <div className="settings-link-container">
          <button
            onClick={() => {
              onComplete();
              navigate(`/projects/${projectId}/settings`);
            }}
            className="btn-settings-link"
          >
            <ExternalLink size={14} />
            View all settings
          </button>
        </div>
      )}

      <style>{`
        .setup-wizard {
          width: 100%;
          max-width: 680px;
          background: var(--bg-primary);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 100px rgba(0, 0, 0, 0.4);
        }

        .wizard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
        }

        .wizard-title {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .wizard-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--accent) 0%, #d45242 100%);
          border-radius: 12px;
          color: white;
        }

        .wizard-title h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .wizard-title p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ink-muted);
        }

        .btn-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          background: var(--bg-tertiary);
          color: var(--ink-primary);
        }

        /* Progress Steps */
        .step-progress {
          display: flex;
          padding: var(--space-5) var(--space-6);
          gap: var(--space-2);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }

        .progress-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          position: relative;
        }

        .step-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.875rem;
          font-weight: 600;
          background: var(--bg-tertiary);
          color: var(--ink-muted);
          border: 2px solid var(--border);
          transition: all 0.3s ease;
        }

        .progress-step.completed .step-number,
        .progress-step.active .step-number {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }

        .progress-step.active .step-number {
          box-shadow: 0 0 0 4px rgba(196, 92, 62, 0.15);
        }

        .step-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .step-title-sm {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--ink-secondary);
          text-align: center;
        }

        .progress-step.active .step-title-sm {
          color: var(--ink-primary);
          font-weight: 600;
        }

        .required-badge {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border-radius: 4px;
        }

        .step-connector {
          position: absolute;
          top: 16px;
          left: calc(50% + 20px);
          right: calc(-50% + 20px);
          height: 2px;
          background: var(--border);
          transition: all 0.3s ease;
        }

        .step-connector.completed {
          background: var(--accent);
        }

        /* Content Area */
        .wizard-content {
          padding: var(--space-6);
          min-height: 420px;
          max-height: 500px;
          overflow-y: auto;
        }

        .step-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .panel-header {
          text-align: center;
        }

        .panel-icon {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          margin: 0 auto var(--space-4);
          color: white;
        }

        .panel-icon.github {
          background: linear-gradient(135deg, #24292f 0%, #000000 100%);
        }

        .panel-icon.notifications {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .panel-icon.test {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .panel-header h3 {
          margin: 0 0 var(--space-2);
          font-size: 1.5rem;
          font-weight: 600;
        }

        .panel-subtitle {
          margin: 0;
          font-size: 0.9375rem;
          color: var(--ink-secondary);
          line-height: 1.5;
        }

        /* Setup Cards */
        .setup-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .setup-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: var(--space-5);
          position: relative;
          transition: all 0.2s ease;
        }

        .setup-card.completed {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .card-badge {
          position: absolute;
          top: -10px;
          right: var(--space-4);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .card-badge.recommended {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .card-header h4 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .card-header p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ink-muted);
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .benefit {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          color: var(--ink-secondary);
        }

        .benefit-check {
          color: #10b981;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background: var(--accent);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(196, 92, 62, 0.3);
        }

        .btn-large {
          width: 100%;
          padding: var(--space-4);
          font-size: 1rem;
        }

        .install-actions {
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .install-actions .btn-primary {
          flex: 1;
        }

        .btn-refresh {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .btn-refresh:hover {
          background: var(--border);
          color: var(--ink-primary);
        }

        .btn-refresh:active {
          transform: scale(0.95);
        }

        .success-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-4);
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          color: #10b981;
          font-weight: 500;
        }

        .success-icon {
          color: #10b981;
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

        .webhook-url-box {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .webhook-url-box label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--ink-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-2);
        }

        .url-copy-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .url-copy-row code {
          flex: 1;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--ink-secondary);
          word-break: break-all;
        }

        .btn-copy {
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
          flex-shrink: 0;
        }

        .manual-instructions {
          font-size: 0.8125rem;
        }

        .manual-instructions summary {
          color: var(--accent);
          cursor: pointer;
          user-select: none;
        }

        .manual-instructions ol {
          margin: var(--space-3) 0 0;
          padding-left: var(--space-4);
          color: var(--ink-secondary);
          line-height: 1.6;
        }

        .manual-instructions li {
          margin-bottom: var(--space-1);
        }

        .manual-instructions code {
          font-family: var(--font-mono);
          background: var(--bg-tertiary);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        /* Notification Options */
        .notification-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .notification-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .notification-card.active {
          border-color: var(--accent);
          background: rgba(196, 92, 62, 0.05);
        }

        .notification-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .notification-icon.slack {
          background: rgba(97, 31, 105, 0.15);
          color: #611f69;
        }

        .notification-icon.discord {
          background: rgba(88, 101, 242, 0.15);
          color: #5865f2;
        }

        .notification-icon.dashboard {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content h4 {
          margin: 0 0 4px;
          font-size: 1rem;
          font-weight: 600;
        }

        .notification-content p {
          margin: 0 0 var(--space-3);
          font-size: 0.875rem;
          color: var(--ink-muted);
        }

        .notification-input {
          width: 100%;
          padding: var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.875rem;
          color: var(--ink-primary);
        }

        .notification-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .btn-skip {
          margin-top: var(--space-2);
          padding: var(--space-2) 0;
          background: transparent;
          border: none;
          color: var(--ink-muted);
          font-size: 0.8125rem;
          cursor: pointer;
          text-decoration: underline;
        }

        .btn-skip:hover {
          color: var(--accent);
        }

        .note {
          display: block;
          margin-top: var(--space-2);
          font-size: 0.75rem;
          color: var(--ink-muted);
        }

        .help-box {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 12px;
          margin-top: var(--space-3);
        }

        .help-box svg {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .help-box p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--ink-secondary);
          line-height: 1.5;
        }

        /* Completion Summary */
        .completion-summary {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          background: var(--bg-secondary);
          border-radius: 16px;
          padding: var(--space-5);
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-primary);
          border-radius: 10px;
        }

        .summary-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: 10px;
          color: var(--ink-secondary);
        }

        .summary-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .summary-label {
          font-size: 0.75rem;
          color: var(--ink-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-value {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--ink-primary);
        }

        .summary-check {
          color: #10b981;
        }

        /* Next Steps */
        .next-steps {
          background: var(--bg-secondary);
          border-radius: 16px;
          padding: var(--space-5);
        }

        .next-steps h4 {
          margin: 0 0 var(--space-4);
          font-size: 1rem;
        }

        .next-step-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .next-step-item:last-child {
          margin-bottom: 0;
        }

        .step-num {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          border-radius: 50%;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .next-step-item p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--ink-secondary);
        }

        /* Footer */
        .wizard-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--ink-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--border);
          color: var(--ink-primary);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .step-indicator {
          font-size: 0.8125rem;
          color: var(--ink-muted);
        }

        .settings-link-container {
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
          text-align: center;
        }

        .btn-settings-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--ink-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-settings-link:hover {
          background: var(--border);
          color: var(--ink-primary);
          border-color: var(--border-strong);
        }
      `}</style>
    </div>
  );
}
