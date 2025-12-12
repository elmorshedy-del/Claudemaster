'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Trash2, GitBranch } from 'lucide-react';
import { Repository } from '@/types';

interface RepoSelectorProps {
  repos: Repository[];
  activeRepo: Repository | null;
  onSelectRepo: (repo: Repository) => void;
  onAddRepo: (repo: Omit<Repository, 'id' | 'isActive'>) => void;
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
  const [showForm, setShowForm] = useState(false);
  const [newRepo, setNewRepo] = useState({
    owner: '',
    name: '',
    token: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepo.owner || !newRepo.name || !newRepo.token) return;

    onAddRepo(newRepo);
    setNewRepo({ owner: '', name: '', token: '' });
    setShowForm(false);
    setIsOpen(false);
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
            <form onSubmit={handleSubmit} className="p-3 border-b border-claude-border dark:border-claude-border-dark space-y-2">
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
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 text-xs text-claude-text-muted dark:text-claude-text-muted-dark hover:text-claude-text dark:hover:text-claude-text-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-claude-orange text-white rounded hover:bg-claude-orange-dark"
                >
                  Add repo
                </button>
              </div>
            </form>
          )}

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
