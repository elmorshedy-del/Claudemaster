'use client';

import { Code2, Sparkles, Bug, FileCode, Zap, RefreshCw, Eye, Beaker } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  {
    title: "Create a new feature",
    desc: "Add a user authentication system with login and signup",
    icon: Code2
  },
  {
    title: "Fix a bug",
    desc: "Debug why my form validation is not working correctly",
    icon: Bug
  },
  {
    title: "Refactor code",
    desc: "Refactor this component to use TypeScript and improve performance",
    icon: RefreshCw
  },
  {
    title: "Optimize performance",
    desc: "Analyze and optimize the loading time of my application",
    icon: Zap
  },
  {
    title: "Generate tests",
    desc: "Write comprehensive unit tests for my API endpoints",
    icon: Beaker
  },
  {
    title: "Review my code",
    desc: "Review my recent changes and suggest improvements",
    icon: Eye
  }
];

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center min-h-full px-4 pt-16 sm:pt-24 pb-12 font-sans-claude">
      <div className="max-w-3xl w-full flex flex-col items-center">
        
        {/* Greeting */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-16 h-16 bg-[#DA7756]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#DA7756]">
             <Code2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif-claude text-4xl sm:text-5xl font-medium mb-4 text-[#1F1F1F] tracking-tight">
            Welcome to Claude Coder
          </h1>
          <p className="text-[#585858] text-lg max-w-xl mx-auto font-serif-claude">
            Your AI-powered coding assistant with GitHub integration
          </p>
        </div>

        {/* Feature Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {suggestions.map((feature, idx) => (
            <button 
              key={idx}
              onClick={() => onSuggestionClick(feature.desc)}
              className="group flex flex-col items-start p-4 rounded-xl border border-[#E5E0D8] bg-white hover:bg-[#FAF9F6] hover:border-[#D1CDC7] transition-all duration-200 text-left shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-2 text-[#393939] font-medium">
                <div className="p-1.5 rounded-md bg-[#F4F3EF] group-hover:bg-[#EAE8E2] text-[#585858] transition-colors">
                  <feature.icon className="w-4 h-4" />
                </div>
                {feature.title}
              </div>
              <p className="text-sm text-[#767676] leading-relaxed">
                {feature.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Quick Tips Section */}
        <div className="w-full rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] p-5 text-sm text-[#585858] shadow-sm">
          <div className="flex items-center gap-2 font-medium text-[#393939] mb-3">
            <Zap className="w-4 h-4 text-[#DA7756]" />
            Quick Tips
          </div>
          <ul className="space-y-2 list-disc list-inside marker:text-[#BDBAB3]">
            <li>Use <span className="font-medium text-[#393939]">Safe Mode</span> to test changes in a branch</li>
            <li>Drag and drop images, code files, or PDFs directly into the chat</li>
            <li>Switch models anytime to balance cost and performance</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
