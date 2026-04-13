import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Plus, Settings, Video, ExternalLink, Trash2, AlertCircle, Film, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, type Project, type WebhookConfig } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { SetupWizard } from '../components/SetupWizard';

interface ProjectWithConfig extends Project {
  webhook_configs?: WebhookConfig[];
}

export default function Projects() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectWithConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newlyCreatedProject, setNewlyCreatedProject] = useState<Project | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const loadProjectForSetup = async (projectId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) {
        console.error('Failed to load project for setup:', error);
        return;
      }
      
      setNewlyCreatedProject(data);
      setIsWalkthroughOpen(true);
    } catch (err) {
      console.error('Error loading project:', err);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/');
      return;
    }

    // Check if we should open setup for a specific project (from GitHub callback)
    const setupProjectId = searchParams.get('setup');
    if (setupProjectId) {
      loadProjectForSetup(setupProjectId);
    }

    // Load projects
    const loadProjects = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('projects')
          .select(`
            *,
            webhook_configs(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setProjects(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, navigate, user, searchParams]);

  const refreshProjects = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('projects')
        .select(`
          *,
          webhook_configs(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id);

      if (deleteError) throw deleteError;
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return (
    <div className="projects-page">
      <Navbar onBuyCredits={() => {}} />

      <main className="projects-main">
        <div className="projects-header">
          <div>
            <h1 className="text-display">Projects</h1>
            <p className="text-lead">
              Connect GitHub repositories to automatically generate videos
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={18} />
            Connect Repository
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="loading-state"
            >
              <div className="loading-animation">
                <motion.div
                  className="loading-film-strip"
                  animate={{
                    y: [0, -40, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Film size={48} className="loading-icon" />
                </motion.div>
                <motion.div
                  className="loading-clapper"
                  animate={{
                    rotate: [-15, 0, -15],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Clapperboard size={32} className="loading-icon-secondary" />
                </motion.div>
              </div>
              <div className="loading-text">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading your projects
                </motion.span>
                <div className="loading-dots">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  >
                    .
                  </motion.span>
                </div>
              </div>
              <motion.p
                className="loading-subtext"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
              >
                Syncing with database
              </motion.p>
            </motion.div>
          ) : projects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="empty-state"
            >
              <div className="empty-icon">
                <Video size={48} />
              </div>
              <h3 className="text-title">No projects yet</h3>
              <p className="text-body">
                Connect a GitHub repository to start generating videos automatically
                when PRs merge or releases are published.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                <Plus size={18} />
                Connect Your First Repo
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="projects-grid"
            >
              <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="project-card"
                >
                  <div className="project-header">
                    <div className="project-repo">
                      <span className="repo-owner">{project.repo_owner}</span>
                      <span className="repo-separator">/</span>
                      <span className="repo-name">{project.repo_name}</span>
                    </div>
                    <div className="project-actions">
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="btn-icon"
                        title="View videos"
                      >
                        <Video size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${project.id}/settings`)}
                        className="btn-icon"
                        title="Settings"
                      >
                        <Settings size={16} />
                      </button>
                      <a
                        href={`https://github.com/${project.repo_owner}/${project.repo_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-icon"
                        title="View on GitHub"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => openDeleteModal(project)}
                        className="btn-icon btn-danger"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="project-meta">
                    <div className="meta-item">
                      <span className="meta-label">Events</span>
                      <span className="meta-value">
                        {project.webhook_configs?.[0]?.events?.length || 0} configured
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Slack</span>
                      <span className={`meta-value ${project.webhook_configs?.[0]?.slack_webhook_url ? 'active' : ''}`}>
                        {project.webhook_configs?.[0]?.slack_webhook_url ? 'Connected' : 'Not set'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Discord</span>
                      <span className={`meta-value ${project.webhook_configs?.[0]?.discord_webhook_url ? 'active' : ''}`}>
                        {project.webhook_configs?.[0]?.discord_webhook_url ? 'Connected' : 'Not set'}
                      </span>
                    </div>
                  </div>

                  <div className="project-footer">
                    <span className="text-small">
                      Created {new Date(project.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            >
              <CreateProjectModal
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(project: Project) => {
                  setIsCreateModalOpen(false);
                  setNewlyCreatedProject(project);
                  setIsWalkthroughOpen(true);
                  refreshProjects();
                }}
              />
            </motion.div>
          </>
        )}

        {isDeleteModalOpen && projectToDelete && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div
              className="modal modal-small"
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            >
              <DeleteProjectModal
                project={projectToDelete}
                onClose={() => {
                  setIsDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                onConfirm={handleDeleteProject}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Setup Walkthrough Modal */}
      <AnimatePresence>
        {isWalkthroughOpen && newlyCreatedProject && (
          <>
            <motion.div
              className="modal-overlay walkthrough-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWalkthroughOpen(false)}
            />
            <motion.div
              className="modal walkthrough-modal"
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            >
              <SetupWizard
                projectId={newlyCreatedProject.id}
                repoOwner={newlyCreatedProject.repo_owner}
                repoName={newlyCreatedProject.repo_name}
                onClose={() => setIsWalkthroughOpen(false)}
                onComplete={() => {
                  setIsWalkthroughOpen(false);
                  setNewlyCreatedProject(null);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .projects-page {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .projects-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-8) var(--space-6);
        }

        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-8);
          gap: var(--space-4);
        }

        .projects-header h1 {
          font-size: 2rem;
          margin-bottom: var(--space-2);
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

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-16);
          color: var(--ink-muted);
        }

        .loading-animation {
          position: relative;
          width: 120px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-4);
        }

        .loading-film-strip {
          color: var(--accent);
          filter: drop-shadow(0 4px 12px rgba(196, 92, 62, 0.25));
        }

        .loading-clapper {
          position: absolute;
          bottom: 0;
          right: 10px;
          color: var(--accent-secondary, #e8b86d);
          filter: drop-shadow(0 2px 8px rgba(232, 184, 109, 0.3));
        }

        .loading-icon {
          opacity: 0.9;
        }

        .loading-icon-secondary {
          opacity: 0.8;
        }

        .loading-text {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--ink-primary);
        }

        .loading-dots {
          display: flex;
          gap: 2px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .loading-subtext {
          font-size: 0.875rem;
          color: var(--ink-muted);
          margin: 0;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-6);
          padding: var(--space-16);
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

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: var(--space-6);
        }

        .project-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
          transition: border-color var(--duration-fast);
        }

        .project-card:hover {
          border-color: var(--border-strong);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
        }

        .project-repo {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-family: var(--font-mono);
          font-size: 0.9375rem;
        }

        .repo-owner {
          color: var(--ink-muted);
        }

        .repo-separator {
          color: var(--ink-tertiary);
        }

        .repo-name {
          color: var(--ink-primary);
          font-weight: 600;
        }

        .project-actions {
          display: flex;
          gap: var(--space-2);
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-icon:hover {
          background: var(--bg-primary);
          border-color: var(--border-strong);
          color: var(--ink-primary);
        }

        .btn-danger:hover {
          background: rgba(196, 92, 62, 0.1);
          border-color: var(--accent);
          color: var(--accent);
        }

        .project-meta {
          display: flex;
          gap: var(--space-6);
          padding: var(--space-4);
          background: var(--bg-primary);
          border-radius: 12px;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .meta-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ink-muted);
        }

        .meta-value {
          font-size: 0.875rem;
          color: var(--ink-secondary);
        }

        .meta-value.active {
          color: #4caf50;
          font-weight: 500;
        }

        .project-footer {
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 100;
        }

        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          z-index: 101;
          width: 90%;
          max-width: 520px;
        }

        .modal-small {
          max-width: 420px;
        }

        @media (max-width: 640px) {
          .projects-header {
            flex-direction: column;
          }

          .projects-grid {
            grid-template-columns: 1fr;
          }

          .project-meta {
            flex-wrap: wrap;
          }
        }

        .walkthrough-overlay {
          z-index: 102;
        }

        .walkthrough-modal {
          z-index: 103;
        }
      `}</style>
    </div>
  );
}

// Create Project Modal Component
interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const { user } = useUser();
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Parse GitHub URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    const [, owner, repo] = match;

    try {
      setIsLoading(true);

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: `${owner}/${repo}`,
          repo_owner: owner,
          repo_name: repo.replace(/\.git$/, ''),
        })
        .select()
        .single();

      if (projectError) {
        console.error('Project insert error:', projectError);
        throw projectError;
      }

      // Create default webhook config
      const { error: configError } = await supabase
        .from('webhook_configs')
        .insert({
          project_id: project.id,
          events: ['pr_merge'],
          auto_post_social: false,
        });

      if (configError) throw configError;

      onSuccess(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-modal">
      <div className="modal-header">
        <h2 className="text-title">Connect Repository</h2>
        <button onClick={onClose} className="btn-close">×</button>
      </div>

      <form onSubmit={handleSubmit} className="modal-form">
        {error && (
          <div className="form-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="repo-url" className="form-label">
            GitHub Repository URL
          </label>
          <input
            id="repo-url"
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required
            className="form-input"
          />
          <span className="form-hint">
            Paste the full URL to the GitHub repository you want to monitor
          </span>
        </div>

        <div className="form-notice">
          <AlertCircle size={16} />
          <span>
            After connecting, we'll guide you through setting up Slack, Discord,
            and GitHub integration in just a few steps.
          </span>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? (
              <>
                <span className="spinner-small" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .create-modal {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: var(--space-6);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .modal-header h2 {
          margin: 0;
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
          font-size: 1.5rem;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-close:hover {
          background: var(--bg-tertiary);
          color: var(--ink-primary);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .form-error {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: rgba(196, 92, 62, 0.08);
          border: 1px solid rgba(196, 92, 62, 0.2);
          border-radius: 10px;
          color: var(--accent);
          font-size: 0.875rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-primary);
        }

        .form-input {
          padding: var(--space-3) var(--space-4);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--ink-primary);
          font-size: 0.9375rem;
          transition: border-color var(--duration-fast);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .form-hint {
          font-size: 0.8125rem;
          color: var(--ink-muted);
        }

        .form-notice {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 0.875rem;
          color: var(--ink-secondary);
        }

        .modal-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: flex-end;
          padding-top: var(--space-4);
          border-top: 1px solid var(--border);
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

// Delete Project Modal Component
interface DeleteProjectModalProps {
  project: Project;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteProjectModal({ project, onClose, onConfirm }: DeleteProjectModalProps) {
  return (
    <div className="delete-modal">
      <div className="delete-modal-icon">
        <Trash2 size={28} />
      </div>
      <h2 className="delete-modal-title">Delete Project</h2>
      <p className="delete-modal-text">
        Are you sure you want to delete <strong>{project.repo_owner}/{project.repo_name}</strong>?
        This will also delete all associated videos and cannot be undone.
      </p>
      <div className="delete-modal-actions">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger">
          <Trash2 size={16} />
          Delete Project
        </button>
      </div>

      <style>{`
        .delete-modal {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: var(--space-6);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
          text-align: center;
          max-width: 420px;
        }

        .delete-modal-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(196, 92, 62, 0.1);
          border-radius: 16px;
          color: var(--accent);
          margin: 0 auto var(--space-4);
        }

        .delete-modal-title {
          margin: 0 0 var(--space-2);
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--ink-primary);
        }

        .delete-modal-text {
          margin: 0 0 var(--space-5);
          font-size: 0.9375rem;
          color: var(--ink-secondary);
          line-height: 1.5;
        }

        .delete-modal-text strong {
          color: var(--ink-primary);
        }

        .delete-modal-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: center;
        }

        .btn-danger {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: var(--accent);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-danger:hover {
          background: #d45242;
        }
      `}</style>
    </div>
  );
}
