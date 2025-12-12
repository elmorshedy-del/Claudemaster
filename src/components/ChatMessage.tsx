'use client';

import { useState } from 'react';
import { Copy, Check, User, Bot, FileText, Image as ImageIcon, FileCode, DollarSign, Globe, Brain } from 'lucide-react';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCost, setShowCost] = useState(false);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Parse markdown-style code blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      // Check if it's a code block
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'code';
          const code = match[2];
          const codeId = `${message.id}-${index}`;
          
          return (
            <div key={index} className="code-block my-4">
              <div className="code-block-header">
                <span className="font-mono text-xs">{language}</span>
                <button
                  onClick={() => copyToClipboard(code, codeId)}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-claude-bg dark:hover:bg-claude-bg-dark rounded text-xs transition-colors"
                >
                  {copiedCode === codeId ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre>
                <code>{code}</code>
              </pre>
            </div>
          );
        }
      }
      
      // Regular text with inline code
      return (
        <div key={index} className="whitespace-pre-wrap">
          {part.split(/(`[^`]+`)/).map((segment, i) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              return (
                <code
                  key={i}
                  className="px-1.5 py-0.5 bg-claude-user-bg dark:bg-claude-user-bg-dark rounded text-sm font-mono"
                >
                  {segment.slice(1, -1)}
                </code>
              );
            }
            return segment;
          })}
        </div>
      );
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`group py-8 px-4 ${!isUser ? 'bg-claude-surface dark:bg-claude-surface-dark' : ''}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser 
                ? 'bg-claude-user-bg dark:bg-claude-user-bg-dark' 
                : 'bg-claude-orange-light'
            }`}>
              {isUser ? (
                <User size={18} className="text-claude-text dark:text-claude-text-dark" />
              ) : (
                <Bot size={18} className="text-claude-orange" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm text-claude-text dark:text-claude-text-dark">
                {isUser ? 'You' : 'Claude'}
              </span>
              
              {/* Badges */}
              <div className="flex items-center gap-1.5">
                {message.model && !isUser && (
                  <span className="px-2 py-0.5 bg-claude-bg dark:bg-claude-bg-dark rounded text-xs text-claude-text-muted dark:text-claude-text-muted-dark">
                    {message.model}
                  </span>
                )}
                {message.webSearchUsed && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <Globe size={12} />
                    Web
                  </span>
                )}
                {message.extendedThinking && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Brain size={12} />
                    Thinking
                  </span>
                )}
              </div>
            </div>

            {/* Uploaded Files Preview */}
            {message.files && message.files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-2 bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg text-sm"
                  >
                    {file.type.startsWith('image/') ? (
                      <ImageIcon size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                    ) : file.type.includes('pdf') ? (
                      <FileText size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                    ) : (
                      <FileCode size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                    )}
                    <span className="text-claude-text dark:text-claude-text-dark">{file.name}</span>
                    <span className="text-claude-text-muted dark:text-claude-text-muted-dark text-xs">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Thinking Process (Collapsible) */}
            {message.thinkingProcess && (
              <details className="mb-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30 rounded-lg overflow-hidden">
                <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/20">
                  View thinking process
                </summary>
                <div className="px-4 py-3 text-sm text-purple-900 dark:text-purple-100 border-t border-purple-200 dark:border-purple-800/30">
                  {message.thinkingProcess}
                </div>
              </details>
            )}

            {/* Message Content */}
            <div className="prose prose-sm max-w-none text-claude-text dark:text-claude-text-dark">
              {message.isStreaming ? (
                <div className="flex items-center gap-2">
                  {renderContent(message.content)}
                  <span className="typing-cursor inline-block w-2 h-4 bg-claude-orange"></span>
                </div>
              ) : (
                renderContent(message.content)
              )}
            </div>

            {/* Cost Info (on hover) */}
            {message.cost !== undefined && !isUser && (
              <div
                className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseEnter={() => setShowCost(true)}
                onMouseLeave={() => setShowCost(false)}
              >
                <button className="flex items-center gap-1.5 px-2 py-1 bg-claude-bg dark:bg-claude-bg-dark rounded text-xs text-claude-text-muted dark:text-claude-text-muted-dark hover:text-claude-text dark:hover:text-claude-text-dark transition-colors">
                  <DollarSign size={12} />
                  <span>${message.cost.toFixed(4)}</span>
                  {message.tokensUsed && (
                    <span className="text-claude-text-muted dark:text-claude-text-muted-dark">
                      ({message.tokensUsed.input + message.tokensUsed.output} tokens)
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
