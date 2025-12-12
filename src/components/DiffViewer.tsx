'use client';

import { FileCode, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { FileChange } from '@/types';

interface DiffViewerProps {
  changes: FileChange[];
}

export default function DiffViewer({ changes }: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFile = (path: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFiles(newExpanded);
  };

  const parseDiff = (diff: string) => {
    const lines = diff.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        return { type: 'add', content: line.slice(1), key: index };
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        return { type: 'remove', content: line.slice(1), key: index };
      } else if (line.startsWith('@@')) {
        return { type: 'header', content: line, key: index };
      } else {
        return { type: 'context', content: line, key: index };
      }
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'edit':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'delete':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-claude-text-muted dark:text-claude-text-muted-dark';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'Created';
      case 'edit':
        return 'Modified';
      case 'delete':
        return 'Deleted';
      default:
        return action;
    }
  };

  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-claude-text-muted dark:text-claude-text-muted-dark">
        No changes to display
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {changes.map((change, index) => {
        const isExpanded = expandedFiles.has(change.path);
        
        return (
          <div
            key={index}
            className="border border-claude-border dark:border-claude-border-dark rounded-lg overflow-hidden"
          >
            {/* File Header */}
            <button
              onClick={() => toggleFile(change.path)}
              className="w-full flex items-center gap-3 p-3 bg-claude-bg dark:bg-claude-bg-dark hover:bg-claude-user-bg dark:hover:bg-claude-user-bg-dark transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
              ) : (
                <ChevronRight size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
              )}
              <FileCode size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
              <span className="flex-1 text-left font-mono text-sm text-claude-text dark:text-claude-text-dark">
                {change.path}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(change.action)}`}>
                {getActionLabel(change.action)}
              </span>
            </button>

            {/* Diff Content */}
            {isExpanded && change.diff && (
              <div className="bg-claude-surface dark:bg-claude-surface-dark">
                <pre className="p-4 overflow-x-auto text-xs font-mono">
                  {parseDiff(change.diff).map((line) => (
                    <div
                      key={line.key}
                      className={`
                        ${line.type === 'add' ? 'diff-add' : ''}
                        ${line.type === 'remove' ? 'diff-remove' : ''}
                        ${line.type === 'header' ? 'text-claude-text-muted dark:text-claude-text-muted-dark bg-claude-bg dark:bg-claude-bg-dark py-1 px-2 my-1' : ''}
                        ${line.type === 'context' ? 'text-claude-text-muted dark:text-claude-text-muted-dark' : ''}
                      `}
                    >
                      {line.content}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
