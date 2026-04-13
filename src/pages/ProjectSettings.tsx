import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ArrowLeft, Save, Check, AlertCircle, MessageSquare, Hash, GitBranch } from 'lucide-react';
import { supabase, type Project, type WebhookConfig } from '../lib/supabase';
import { Navbar } from '../components/Navbar';

const EVENT_OPTIONS = [
  { value: 'pr_merge', label: 'Pull Request Merged', description: 'When a PR is merged into the main branch' },
  { value: 'release_publish', label: 'Release Published', description: 'When a new release is published' },
  { value: 'issue_close', label: 'Issue Closed', description: 'When an issue is closed as completed' },
];

export default function ProjectSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  
  const [project, setProject] = useState<Project | null>(null);
  const [config, setConfig] = useState<WebhookConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [autoPostSocial, setAutoPostSocial] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/');
      return;
    }

    // Load project
    const loadProject = async () => {
      if (!user || !id) return;

      try {
        setIsLoading(true);
        
        // Load project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (projectError) throw projectError;
        if (!projectData) {
          navigate('/projects');
          return;
        }

        setProject(projectData);

        // Load webhook config
        const { data: configData, error: configError } = await supabase
          .from('webhook_configs')
          .select('*')
          .eq('project_id', id)
          .single();

        if (configError && configError.code !== 'PGRST116') throw configError;

        if (configData) {
          setConfig(configData);
          setSelectedEvents(configData.events || []);
          setSlackWebhook(configData.slack_webhook_url || '');
          setDiscordWebhook(configData.discord_webhook_url || '');
          setAutoPostSocial(configData.auto_post_social || false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [isSignedIn, navigate, id, user]);

  const handleSave = async () => {
    if (!project || !user) return;

    try {
      setIsSaving(true);
      setSaveSuccess(false);

      // Update or create webhook config
      const { error: upsertError } = await supabase
        .from('webhook_configs')
        .upsert({
          id: config?.id,
          project_id: project.id,
          events: selectedEvents,
          slack_webhook_url: slackWebhook || null,
          discord_webhook_url: discordWebhook || null,
          auto_post_social: autoPostSocial,
        });

      if (upsertError) throw upsertError;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <Navbar onBuyCredits={() => {}} />
        <main className="settings-main">
          <div className="settings-header">
            <button onClick={() => navigate('/projects')} className="btn-back">
              <ArrowLeft size={18} />
              Back to Projects
            </button>
            <div className="header-content">
              <h1 className="text-display">Project Settings</h1>
            </div>
          </div>
          <div className="loading-state">
            <div className="loading-card">
              <div className="spinner-large" />
              <span className="loading-text">Loading project settings...</span>
              <span className="loading-subtext">Fetching configuration from database</span>
            </div>
          </div>
        </main>
        <style>{`
          .settings-page { min-height: 100vh; background: var(--bg-primary); }
          .settings-main { max-width: 800px; margin: 0 auto; padding: var(--space-8) var(--space-6); }
          .settings-header { margin-bottom: var(--space-8); }
          .btn-back { display: flex; align-items: center; gap: var(--space-2); background: none; border: none; color: var(--ink-muted); font-size: 0.875rem; cursor: pointer; margin-bottom: var(--space-4); transition: color var(--duration-fast); }
          .btn-back:hover { color: var(--ink-primary); }
          .header-content h1 { font-size: 2rem; margin-bottom: var(--space-3); }
          .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-8) 0; color: var(--ink-muted); }
          .loading-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-12) var(--space-8); background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 400px; }
          .spinner-large { width: 48px; height: 48px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.9s linear infinite; }
          .loading-text { font-size: 1rem; font-weight: 500; color: var(--ink-primary); }
          .loading-subtext { font-size: 0.875rem; color: var(--ink-muted); }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="settings-page">
        <Navbar onBuyCredits={() => {}} />
        <div className="error-state">
          <AlertCircle size={48} />
          <h2>Project not found</h2>
          <button onClick={() => navigate('/projects')} className="btn-primary">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Navbar onBuyCredits={() => {}} />

      <main className="settings-main">
        <div className="settings-header">
          <button onClick={() => navigate('/projects')} className="btn-back">
            <ArrowLeft size={18} />
            Back to Projects
          </button>
          <div className="header-content">
            <h1 className="text-display">Project Settings</h1>
            <div className="repo-badge">
              <GitBranch size={16} />
              <span>{project.repo_owner}/{project.repo_name}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="settings-form">
          {/* Events Section */}
          <section className="form-section">
            <div className="section-header">
              <h2 className="text-title">Events</h2>
              <p className="text-body">
                Choose which GitHub events should trigger video generation
              </p>
            </div>

            <div className="events-list">
              {EVENT_OPTIONS.map(event => (
                <label
                  key={event.value}
                  className={`event-card ${selectedEvents.includes(event.value) ? 'selected' : ''}`}
                >
                  <div className="event-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                    />
                    <span className="checkbox-custom">
                      {selectedEvents.includes(event.value) && <Check size={12} />}
                    </span>
                  </div>
                  <div className="event-info">
                    <span className="event-label">{event.label}</span>
                    <span className="event-description">{event.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Webhooks Section */}
          <section className="form-section">
            <div className="section-header">
              <h2 className="text-title">Notifications</h2>
              <p className="text-body">
                Configure where to share generated videos automatically
              </p>
            </div>

            <div className="webhook-fields">
              <div className="form-field">
                <label className="field-label">
                  <MessageSquare size={16} />
                  Slack Webhook URL
                </label>
                <input
                  type="url"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="field-input"
                />
                <span className="field-hint">
                  Create a Slack incoming webhook in your workspace settings
                </span>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Hash size={16} />
                  Discord Webhook URL
                </label>
                <input
                  type="url"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="field-input"
                />
                <span className="field-hint">
                  Create a Discord webhook in your server channel settings
                </span>
              </div>
            </div>
          </section>

          {/* Auto-post Section */}
          <section className="form-section">
            <div className="section-header">
              <h2 className="text-title">Social Media</h2>
              <p className="text-body">
                Automatically post videos to connected social accounts
              </p>
            </div>

            <label className="toggle-field">
              <input
                type="checkbox"
                checked={autoPostSocial}
                onChange={(e) => setAutoPostSocial(e.target.checked)}
              />
              <span className="toggle-switch" />
              <div className="toggle-info">
                <span className="toggle-label">Auto-post to social media</span>
                <span className="toggle-description">
                  Videos will be automatically shared to connected Twitter/LinkedIn accounts
                </span>
              </div>
            </label>

            {!autoPostSocial && (
              <div className="notice-card">
                <AlertCircle size={16} />
                <span>
                  Connect social accounts in your profile settings to enable auto-posting
                </span>
              </div>
            )}
          </section>

          {/* Save Button */}
          <div className="form-actions">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-save ${saveSuccess ? 'success' : ''}`}
            >
              {isSaving ? (
                <>
                  <span className="spinner-small" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={18} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .settings-page {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .settings-main {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-8) var(--space-6);
        }

        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-8) 0;
          color: var(--ink-muted);
        }

        .error-state {
          color: var(--accent);
          gap: var(--space-4);
          padding: var(--space-16);
        }

        .loading-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-12) var(--space-8);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        .loading-text {
          font-size: 1rem;
          font-weight: 500;
          color: var(--ink-primary);
        }

        .loading-subtext {
          font-size: 0.875rem;
          color: var(--ink-muted);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .settings-header {
          margin-bottom: var(--space-8);
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: none;
          border: none;
          color: var(--ink-muted);
          font-size: 0.875rem;
          cursor: pointer;
          margin-bottom: var(--space-4);
          transition: color var(--duration-fast);
        }

        .btn-back:hover {
          color: var(--ink-primary);
        }

        .header-content h1 {
          font-size: 2rem;
          margin-bottom: var(--space-3);
        }

        .repo-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--ink-secondary);
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: rgba(196, 92, 62, 0.08);
          border: 1px solid rgba(196, 92, 62, 0.2);
          border-radius: 10px;
          color: var(--accent);
          margin-bottom: var(--space-6);
        }

        .error-banner button {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .form-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: var(--space-6);
        }

        .section-header {
          margin-bottom: var(--space-5);
        }

        .section-header h2 {
          font-size: 1.25rem;
          margin-bottom: var(--space-2);
        }

        .section-header p {
          color: var(--ink-muted);
          font-size: 0.9375rem;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .event-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--bg-primary);
          border: 2px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .event-card:hover {
          border-color: var(--border-strong);
        }

        .event-card.selected {
          border-color: var(--accent);
          background: rgba(196, 92, 62, 0.05);
        }

        .event-checkbox {
          position: relative;
        }

        .event-checkbox input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-custom {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          border-radius: 6px;
          color: white;
          transition: all var(--duration-fast);
        }

        .event-card.selected .checkbox-custom {
          background: var(--accent);
          border-color: var(--accent);
        }

        .event-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .event-label {
          font-weight: 500;
          color: var(--ink-primary);
        }

        .event-description {
          font-size: 0.875rem;
          color: var(--ink-muted);
        }

        .webhook-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-primary);
        }

        .field-input {
          padding: var(--space-3) var(--space-4);
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--ink-primary);
          font-size: 0.9375rem;
          transition: border-color var(--duration-fast);
        }

        .field-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .field-hint {
          font-size: 0.8125rem;
          color: var(--ink-muted);
        }

        .toggle-field {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          cursor: pointer;
        }

        .toggle-field input {
          position: absolute;
          opacity: 0;
        }

        .toggle-switch {
          width: 48px;
          height: 28px;
          background: var(--bg-primary);
          border: 2px solid var(--border);
          border-radius: 14px;
          position: relative;
          transition: all var(--duration-fast);
          flex-shrink: 0;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: var(--ink-muted);
          border-radius: 50%;
          transition: all var(--duration-fast);
        }

        .toggle-field input:checked + .toggle-switch {
          background: var(--accent);
          border-color: var(--accent);
        }

        .toggle-field input:checked + .toggle-switch::after {
          left: calc(100% - 22px);
          background: white;
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .toggle-label {
          font-weight: 500;
          color: var(--ink-primary);
        }

        .toggle-description {
          font-size: 0.875rem;
          color: var(--ink-muted);
        }

        .notice-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.875rem;
          color: var(--ink-secondary);
          margin-top: var(--space-4);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-6);
          background: var(--accent);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-save:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-save.success {
          background: #4caf50;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
