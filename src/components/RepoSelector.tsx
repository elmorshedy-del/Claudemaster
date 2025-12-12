'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, GitBranch, Plus, Trash2 } from 'lucide-react';
import { Repository } from '@/types';

interface RepoSelectorProps {
  repos: Repository[];
  activeRepo: Repository | null;
  onSelectRepo: (repo: Repository) => void;
  onAddRepo: (repoData: Omit<Repository, 'id' | 'isActive'>) => void;
  onDeleteRepo: (id: string) => void;
}

export default function RepoSelector({
  repos,
  activeRepo,
  onSelectRepo,
  onAddRepo,
  onDeleteRepo
}: RepoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [owner, setOwner] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('');

  const activeLabel = useMemo(() => {
    if (activeRepo) return `${activeRepo.owner}/${activeRepo.name}`;
    if (repos.length > 0) return 'Select repository';
    return 'Add repository';
  }, [activeRepo, repos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner.trim() || !name.trim() || !token.trim()) return;

    onAddRepo({ owner: owner.trim(), name: name.trim(), token: token.trim() });
    setOwner('');
    setName('');
    setToken('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg text-claude-text dark:text-claude-text-dark hover:border-claude-border-strong dark:hover:border-claude-border-strong"
      >
        <GitBranch size={16} className="text-claude-orange" />
        <span className="max-w-[180px] truncate">{activeLabel}</span>
        <ChevronDown size={14} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-claude-surface-dark border border-claude-border dark:border-claude-border-dark rounded-xl shadow-lg z-50 p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-claude-text dark:text-claude-text-dark">
            <GitBranch size={16} className="text-claude-orange" />
            Connected Repositories
          </div>

          <div className="space-y-2 max-h-48 overflow-auto pr-1">
            {repos.length === 0 && (
              <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">No repositories added yet.</p>
            )}

            {repos.map((repo) => (
              <div
                key={repo.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  activeRepo?.id === repo.id
                    ? 'border-claude-orange bg-claude-sand-light dark:bg-claude-bg'
                    : 'border-claude-border dark:border-claude-border-dark'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectRepo(repo);
                    setIsOpen(false);
                  }}
                  className="flex-1 text-left"
                >
                  <div className="text-sm font-medium text-claude-text dark:text-claude-text-dark truncate">
                    {repo.owner}/{repo.name}
                  </div>
                  <div className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark truncate">
                    {repo.token ? `${repo.token.slice(0, 4)}…${repo.token.slice(-4)}` : 'No token'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRepo(repo.id);
                  }}
                  className="p-2 text-claude-text-muted hover:text-red-500"
                  title="Remove repository"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="h-px bg-claude-border dark:bg-claude-border-dark" />

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Owner"
                className="input-claude"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Repository"
                className="input-claude"
              />
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="GitHub token"
              className="input-claude"
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-claude-orange text-white hover:opacity-90 transition-colors"
            >
              <Plus size={14} />
              Add Repository
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
