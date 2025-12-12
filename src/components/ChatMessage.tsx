'use client';

import { useState } from 'react';
import { Copy, Check, User, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isUser = message.role === 'user';

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Parse markdown-style code blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      // Code block
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'code';
          const code = match[2].trim();
          const codeId = `code-${index}`;
          
          return (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-[var(--claude-border)] bg-[var(--claude-surface-sunken)]">
              {/* Code header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--claude-sand-light)] border-b border-[var(--claude-border)]">
                <span className="text-xs font-medium text-[var(--claude-text-muted)] uppercase tracking-wide">
                  {language}
                </span>
                <button
                  onClick={() => copyToClipboard(code, codeId)}
                  className="flex items-center gap-1.5 text-xs text-[var(--claude-text-muted)] hover:text-[var(--claude-text)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--claude-surface)]"
                >
                  {copiedCode === codeId ? (
                    <>
                      <Check size={14} className="text-[var(--claude-success)]" />
                      <span className="text-[var(--claude-success)]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Code content */}
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm leading-relaxed">
                  <code className="font-mono text-[var(--claude-text)]">{code}</code>
                </pre>
              </div>
            </div>
          );
        }
      }
      
      // Inline code
      const inlineCodeParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={index}>
          {inlineCodeParts.map((inlinePart, i) => {
            if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
              return (
                <code 
                  key={i} 
                  className="px-1.5 py-0.5 rounded-md bg-[var(--claude-sand-light)] text-[var(--claude-terracotta)] text-[0.9em] font-mono"
                >
                  {inlinePart.slice(1, -1)}
                </code>
              );
            }
            // Regular text - preserve line breaks
            return inlinePart.split('\n').map((line, lineIndex, arr) => (
              <span key={`${i}-${lineIndex}`}>
                {line}
                {lineIndex < arr.length - 1 && <br />}
              </span>
            ));
          })}
        </span>
      );
    });
  };

  return (
    <div 
      className={`py-6 animate-fade-in-up ${isUser ? 'bg-transparent' : 'bg-[var(--claude-surface-sunken)]/50'}`}
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-[var(--claude-sand)] flex items-center justify-center">
                <User size={16} className="text-[var(--claude-text-secondary)]" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--claude-terracotta)] to-[#E89B7D] flex items-center justify-center shadow-sm shadow-[var(--claude-terracotta)]/20">
                <Sparkles size={16} className="text-white" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Role label */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-[var(--claude-text)]">
                {isUser ? 'You' : 'Claude'}
              </span>
              {message.model && !isUser && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--claude-sand-light)] text-[var(--claude-text-muted)]">
                  {message.model}
                </span>
              )}
              {message.isStreaming && (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--claude-terracotta)] typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--claude-terracotta)] typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--claude-terracotta)] typing-dot" />
                </div>
              )}
            </div>
            
            {/* Files attached (for user messages) */}
            {message.files && message.files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.files.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--claude-sand-light)] border border-[var(--claude-border)]"
                  >
                    {file.type.startsWith('image/') ? (
                      <ImageIcon size={14} className="text-[var(--claude-text-muted)]" />
                    ) : (
                      <FileText size={14} className="text-[var(--claude-text-muted)]" />
                    )}
                    <span className="text-sm text-[var(--claude-text-secondary)] max-w-[150px] truncate">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Message content */}
            <div className="prose text-[var(--claude-text)] leading-relaxed">
              {renderContent(message.content)}
            </div>
            
            {/* Cost info (for assistant messages) */}
            {!isUser && message.cost !== undefined && message.cost > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--claude-border)] flex items-center gap-4 text-xs text-[var(--claude-text-muted)]">
                <span>
                  Cost: ${message.cost.toFixed(4)}
                </span>
                {message.tokensUsed && (
                  <span>
                    Tokens: {message.tokensUsed.input.toLocaleString()} in / {message.tokensUsed.output.toLocaleString()} out
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
