'use client';

import { GitBranch, GitMerge, Trash2, ExternalLink, Eye } from 'lucide-react';
import { useState } from 'react';

interface BranchInfo {
  name: string;
  sha: string;
  createdAt: Date;
  filesChanged: number;
  previewUrl?: string;
}

interface BranchManagerProps {
  currentBranch?: BranchInfo;
  onMerge: () => void;
  onDiscard: () => void;
  onViewDiff: () => void;
  isProcessing?: boolean;
}

export default function BranchManager({ 
  currentBranch, 
  onMerge, 
  onDiscard, 
  onViewDiff,
  isProcessing 
}: BranchManagerProps) {
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  if (!currentBranch) return null;

  return (
    <div className="border-t border-claude-border dark:border-claude-border-dark bg-claude-surface dark:bg-claude-surface-dark p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          {/* Branch Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-claude-orange-light rounded-lg flex items-center justify-center">
            <GitBranch size={20} className="text-claude-orange" />
          </div>

          {/* Branch Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-claude-text dark:text-claude-text-dark">
                Changes on branch
              </h3>
              <span className="px-2 py-0.5 bg-claude-bg dark:bg-claude-bg-dark rounded text-xs font-mono text-claude-text-muted dark:text-claude-text-muted-dark">
                {currentBranch.name}
              </span>
            </div>

            <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark mb-3">
              {currentBranch.filesChanged} {currentBranch.filesChanged === 1 ? 'file' : 'files'} changed
              {currentBranch.previewUrl && (
                <>
                  {' • '}
                  <a 
                    href={currentBranch.previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-claude-orange hover:underline inline-flex items-center gap-1"
                  >
                    Preview deployment
                    <ExternalLink size={12} />
                  </a>
                </>
              )}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onViewDiff}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-claude-bg dark:bg-claude-bg-dark hover:bg-claude-user-bg dark:hover:bg-claude-user-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye size={14} />
                <span>View Diff</span>
              </button>

              <button
                onClick={onMerge}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <GitMerge size={14} />
                <span>{isProcessing ? 'Merging...' : 'Merge to Main'}</span>
              </button>

              {!showConfirmDiscard ? (
                <button
                  onClick={() => setShowConfirmDiscard(true)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  <span>Discard</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Are you sure?
                  </span>
                  <button
                    onClick={() => {
                      onDiscard();
                      setShowConfirmDiscard(false);
                    }}
                    className="px-2 py-0.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Yes, discard
                  </button>
                  <button
                    onClick={() => setShowConfirmDiscard(false)}
                    className="px-2 py-0.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
