'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Plus, Trash2, GitBranch } from 'lucide-react';
import { Repository } from '@/types';

interface RepoSelectorProps {
  repos: Repository[];
  activeRepo: Repository | null;
  onSelectRepo: (repo: Repository) => void;
  onAddRepo: (repo: Omit<Repository, 'id' | 'isActive'>) => void;
  onDeleteRepo: (id: string) => void;
}

interface AvailableRepo {
  id: number;
  owner?: string;
  name: string;
  fullName: string;
  private?: boolean;
}

export default function RepoSelector({
  repos,
  activeRepo,
  onSelectRepo,
  onAddRepo,
  onDeleteRepo
}: RepoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRepo, setNewRepo] = useState({
    owner: '',
    name: '',
    token: ''
  });
  const [availableRepos, setAvailableRepos] = useState<AvailableRepo[]>([]);
  const [repoError, setRepoError] = useState('');
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [lastUsedToken, setLastUsedToken] = useState('');

  const resolveAuthToken = () => {
    if (newRepo.token) return newRepo.token;
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('github_token');
      if (savedToken) return savedToken;
    }
    if (activeRepo?.token) return activeRepo.token;
    if (repos[0]?.token) return repos[0].token;
    return '';
  };

  const loadAvailableRepos = async () => {
    const token = resolveAuthToken();
    setLastUsedToken(token);
    setRepoError('');

    if (!token) {
      setAvailableRepos([]);
      setRepoError('Add a GitHub token in Settings or provide one in the form to load repositories.');
      return;
    }

    setIsLoadingRepos(true);
    try {
      const response = await fetch('/api/github?action=listRepos', {
        headers: {
          'x-github-token': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch repositories');
      }

      const data = await response.json();
      setAvailableRepos(data.repos || []);
    } catch (error: any) {
      setRepoError(error.message || 'Failed to fetch repositories');
      setAvailableRepos([]);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAvailableRepos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const owner = newRepo.owner.trim();
    const name = newRepo.name.trim();
    const token = newRepo.token.trim();

    if (!owner || !name || !token) {
      setValidationError('Owner, repository name, and token are required.');
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(
        `/api/github?action=validateRepo&owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}`,
        {
          headers: {
            'x-github-token': token
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Unable to validate repository');
      }

      onAddRepo({ owner, name, token });
      setNewRepo({ owner: '', name: '', token: '' });
      setShowForm(false);
      setIsOpen(false);
    } catch (error: any) {
      setValidationError(error.message || 'Unable to validate repository');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg hover:bg-claude-user-bg dark:hover:bg-claude-user-bg-dark transition-colors"
        title="Select repository"
      >
        <GitBranch size={14} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
        <span className="hidden md:inline text-claude-text dark:text-claude-text-dark">
          {activeRepo ? `${activeRepo.owner}/${activeRepo.name}` : 'Select repo'}
        </span>
        <ChevronDown size={14} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-claude-surface-dark border border-claude-border dark:border-claude-border-dark rounded-lg shadow-lg z-20">
          <div className="p-3 border-b border-claude-border dark:border-claude-border-dark flex items-center justify-between">
            <div className="text-sm font-semibold text-claude-text dark:text-claude-text-dark">Repositories</div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-claude-user-bg dark:bg-claude-user-bg-dark text-claude-text dark:text-claude-text-dark rounded hover:bg-claude-bg dark:hover:bg-claude-bg-dark"
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="p-3 border-b border-claude-border dark:border-claude-border-dark space-y-2"
            >
              <input
                type="text"
                placeholder="Owner"
                value={newRepo.owner}
                onChange={(e) => setNewRepo({ ...newRepo, owner: e.target.value })}
                className="w-full px-2 py-1.5 text-sm bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded"
              />
              <input
                type="text"
                placeholder="Repository name"
                value={newRepo.name}
                onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                className="w-full px-2 py-1.5 text-sm bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded"
              />
              <input
                type="password"
                placeholder="Personal access token"
                value={newRepo.token}
                onChange={(e) => setNewRepo({ ...newRepo, token: e.target.value })}
                className="w-full px-2 py-1.5 text-sm bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded"
              />
              {validationError && (
                <div className="text-xs text-red-500">{validationError}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 text-xs text-claude-text-muted dark:text-claude-text-muted-dark hover:text-claude-text-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isValidating}
                  className="px-3 py-1.5 text-xs bg-claude-orange text-white rounded hover:bg-claude-orange-dark disabled:opacity-50"
                >
                  {isValidating ? 'Validating...' : 'Add repo'}
                </button>
              </div>
            </form>
          )}

          <div className="border-b border-claude-border dark:border-claude-border-dark">
            <div className="p-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-claude-text dark:text-claude-text-dark">Available on GitHub</div>
              <button
                onClick={loadAvailableRepos}
                className="text-xs px-2 py-1 bg-claude-user-bg dark:bg-claude-user-bg-dark text-claude-text dark:text-claude-text-dark rounded hover:bg-claude-bg dark:hover:bg-claude-bg-dark"
              >
                Refresh
              </button>
            </div>
            {repoError && (
              <div className="px-3 pb-3 text-xs text-red-500">{repoError}</div>
            )}
            {isLoadingRepos ? (
              <div className="px-3 pb-3 text-sm text-claude-text-muted dark:text-claude-text-muted-dark">Loading repositories...</div>
            ) : (
              <ul className="max-h-40 overflow-y-auto">
                {availableRepos.length === 0 ? (
                  <li className="px-3 pb-3 text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    No repositories found for the provided token.
                  </li>
                ) : (
                  availableRepos.map(repo => (
                    <li key={repo.id} className="px-3 pb-3 flex items-center justify-between gap-3">
                      <div className="text-sm text-claude-text dark:text-claude-text-dark">
                        <div className="font-medium">{repo.fullName}</div>
                        {repo.private && (
                          <div className="text-[11px] text-claude-text-muted dark:text-claude-text-muted-dark">Private</div>
                        )}
                      </div>
                      <button
                        className="text-xs px-2 py-1 bg-claude-orange text-white rounded hover:bg-claude-orange-dark"
                        onClick={() => {
                          setShowForm(true);
                          setNewRepo({ owner: repo.owner || '', name: repo.name, token: newRepo.token || lastUsedToken });
                        }}
                      >
                        Use
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {repos.length === 0 ? (
              <div className="p-3 text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                No repositories added yet.
              </div>
            ) : (
              <ul className="divide-y divide-claude-border dark:divide-claude-border-dark">
                {repos.map((repo) => (
                  <li key={repo.id} className="p-3 flex items-start justify-between gap-2">
                    <button
                      className={`text-left flex-1 ${
                        repo.id === activeRepo?.id
                          ? 'text-claude-text font-semibold'
                          : 'text-claude-text-muted dark:text-claude-text-muted-dark'
                      }`}
                      onClick={() => {
                        onSelectRepo(repo);
                        setIsOpen(false);
                      }}
                    >
                      <div className="text-sm">{repo.owner}/{repo.name}</div>
                      {repo.id === activeRepo?.id && (
                        <div className="text-xs text-claude-orange">Active</div>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteRepo(repo.id)}
                      className="p-1 text-claude-text-muted dark:text-claude-text-muted-dark hover:text-red-500"
                      title="Remove repository"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
