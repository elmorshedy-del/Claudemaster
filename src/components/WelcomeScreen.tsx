'use client';

import { Code2, Bug, RefreshCw, Zap, TestTube, Eye, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  {
    icon: Code2,
    title: 'Create a new feature',
    description: 'Add a user authentication system with login and signup',
    prompt: 'Create a user authentication system with login, signup, and password reset functionality using NextAuth.js',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Bug,
    title: 'Fix a bug',
    description: 'Debug why my form validation is not working correctly',
    prompt: 'Help me debug my form validation - the error messages are not displaying when I submit invalid data',
    gradient: 'from-red-500/10 to-orange-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  {
    icon: RefreshCw,
    title: 'Refactor code',
    description: 'Refactor this component to use TypeScript and improve performance',
    prompt: 'Refactor my React component to use TypeScript with proper types and optimize re-renders',
    gradient: 'from-purple-500/10 to-pink-500/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: Zap,
    title: 'Optimize performance',
    description: 'Analyze and optimize the loading time of my application',
    prompt: 'Analyze my application performance and suggest optimizations for faster loading times',
    gradient: 'from-yellow-500/10 to-amber-500/10',
    iconColor: 'text-yellow-600 dark:text-yellow-500',
  },
  {
    icon: TestTube,
    title: 'Generate tests',
    description: 'Write comprehensive unit tests for my API endpoints',
    prompt: 'Write comprehensive unit tests for my API endpoints using Jest and React Testing Library',
    gradient: 'from-green-500/10 to-emerald-500/10',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Eye,
    title: 'Review my code',
    description: 'Review my recent changes and suggest improvements',
    prompt: 'Review my code for best practices, potential bugs, and suggest improvements',
    gradient: 'from-indigo-500/10 to-violet-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
];

const quickTips = [
  { text: 'Use', highlight: 'Safe Mode', rest: 'to test changes in a branch before merging' },
  { text: 'Drag and drop', highlight: 'images, code files, or PDFs', rest: 'directly into the chat' },
  { text: 'Switch', highlight: 'models', rest: 'anytime to balance cost and performance' },
  { text: 'Use quick commands like', highlight: '/fix, /review, or /test', rest: '' },
];

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-5xl mx-auto w-full">
      {/* Hero Section */}
      <div className="text-center mb-14 animate-fade-in-up">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-[var(--claude-terracotta)] to-[#E89B7D] shadow-lg shadow-[var(--claude-terracotta)]/20">
          <span className="text-white text-3xl font-mono font-bold">&lt;/&gt;</span>
        </div>
        
        {/* Title - Serif font like Claude.ai */}
        <h1 className="text-4xl md:text-5xl font-normal mb-4 tracking-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Welcome to Claude Coder
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-[var(--claude-text-secondary)] max-w-lg mx-auto leading-relaxed">
          Your AI-powered coding assistant with GitHub integration.
          <br className="hidden sm:block" />
          Build, debug, and deploy with confidence.
        </p>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-14 stagger">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="group suggestion-card text-left relative"
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${suggestion.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[14px]`} />
            
            {/* Content */}
            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--claude-sand-light)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${suggestion.iconColor}`}>
                <suggestion.icon size={20} />
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-[var(--claude-text)] text-[15px]">
                    {suggestion.title}
                  </h3>
                  <ArrowRight 
                    size={14} 
                    className="text-[var(--claude-text-muted)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
                  />
                </div>
                <p className="text-sm text-[var(--claude-text-muted)] line-clamp-2 leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Tips Section */}
      <div className="w-full max-w-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[var(--claude-terracotta)]" />
          <h4 className="text-sm font-medium text-[var(--claude-text)]">Quick Tips</h4>
        </div>
        
        <div className="space-y-2.5">
          {quickTips.map((tip, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2 text-sm text-[var(--claude-text-muted)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--claude-terracotta)] mt-2 flex-shrink-0 opacity-60" />
              <p>
                {tip.text}{' '}
                <span className="text-[var(--claude-text-secondary)] font-medium">
                  {tip.highlight}
                </span>
                {tip.rest && ` ${tip.rest}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
