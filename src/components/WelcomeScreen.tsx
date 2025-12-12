'use client';

import { Code2, Sparkles, Bug, FileCode, Zap, RefreshCw } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  {
    icon: Code2,
    title: 'Create a new feature',
    prompt: 'Add a user authentication system with login and signup'
  },
  {
    icon: Bug,
    title: 'Fix a bug',
    prompt: 'Debug why my form validation is not working correctly'
  },
  {
    icon: FileCode,
    title: 'Refactor code',
    prompt: 'Refactor this component to use TypeScript and improve performance'
  },
  {
    icon: Zap,
    title: 'Optimize performance',
    prompt: 'Analyze and optimize the loading time of my application'
  },
  {
    icon: RefreshCw,
    title: 'Generate tests',
    prompt: 'Write comprehensive unit tests for my API endpoints'
  },
  {
    icon: Sparkles,
    title: 'Review my code',
    prompt: 'Review my recent changes and suggest improvements'
  }
];

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-16">
      <div className="max-w-3xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-claude-orange-light rounded-2xl mb-6">
            <Code2 size={40} className="text-claude-orange" />
          </div>
          <h1 className="text-4xl font-semibold text-claude-text dark:text-claude-text-dark mb-3">
            Welcome to Claude Coder
          </h1>
          <p className="text-lg text-claude-text-muted dark:text-claude-text-muted-dark">
            Your AI-powered coding assistant with GitHub integration
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group p-4 text-left bg-claude-surface dark:bg-claude-surface-dark border border-claude-border dark:border-claude-border-dark rounded-xl hover:border-claude-orange hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-claude-orange-light rounded-lg group-hover:bg-claude-orange group-hover:text-white transition-colors">
                  <suggestion.icon size={18} className="text-claude-orange group-hover:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-claude-text dark:text-claude-text-dark mb-1">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark line-clamp-2">
                    {suggestion.prompt}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-claude-orange-light border border-claude-orange/20 rounded-xl p-6">
          <h3 className="font-medium text-claude-text dark:text-claude-text-dark mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-claude-orange" />
            Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
            <li className="flex items-start gap-2">
              <span className="text-claude-orange mt-0.5">•</span>
              <span>Use <strong>Safe Mode</strong> to test changes in a branch before merging to main</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-claude-orange mt-0.5">•</span>
              <span>Drag and drop images, code files, or PDFs directly into the chat</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-claude-orange mt-0.5">•</span>
              <span>Switch models anytime to balance cost and performance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-claude-orange mt-0.5">•</span>
              <span>Use quick commands like <code className="px-1.5 py-0.5 bg-claude-bg dark:bg-claude-bg-dark rounded">/fix</code>, <code className="px-1.5 py-0.5 bg-claude-bg dark:bg-claude-bg-dark rounded">/review</code>, or <code className="px-1.5 py-0.5 bg-claude-bg dark:bg-claude-bg-dark rounded">/test</code></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
