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

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'code';
          const code = match[2];
          const codeId = `${message.id}-${index}`;
          
          return (
            <div key={index} className="code-block my-4">
              <div className="code-block-header">
                <span className="font-mono text-xs uppercase text-[#585858]">{language}</span>
                <button
                  onClick={() => copyToClipboard(code, codeId)}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#E6E4DD] rounded text-xs transition-colors text-[#585858]"
                >
                  {copiedCode === codeId ? (
                    <>
                      <Check size={14} className="text-green-600" />
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
              <pre className="bg-white text-[#393939]">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
      }
      
      return (
        <div key={index} className="whitespace-pre-wrap font-serif-claude text-[16px] leading-relaxed text-[#1F1F1F]">
          {part.split(/(`[^`]+`)/).map((segment, i) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              return (
                <code
                  key={i}
                  className="px-1.5 py-0.5 bg-[#E6E4DD] rounded text-sm font-mono text-[#DA7756]"
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
    <div className={`group py-6 px-4 ${!isUser ? 'bg-transparent' : ''}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4">
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={`font-semibold text-sm ${isUser ? 'text-[#393939]' : 'text-[#DA7756]'}`}>
                {isUser ? 'You' : 'Claude'}
              </span>
              
              {!isUser && (
                <div className="flex items-center gap-1.5">
                  {message.model && (
                    <span className="px-1.5 py-0.5 border border-[#D1CDC7] rounded text-[10px] uppercase tracking-wide text-[#767676]">
                      {message.model}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* User Bubble Styling vs Claude Styling */}
            <div className={`${isUser ? 'bg-[#F4F3EF] px-5 py-3 rounded-2xl text-[#393939] font-sans-claude' : ''}`}>
               {/* Uploaded Files Preview */}
              {message.files && message.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {message.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E0D8] rounded-lg text-sm shadow-sm"
                    >
                      {file.type.startsWith('image/') ? (
                        <ImageIcon size={16} className="text-[#8F8F8F]" />
                      ) : (
                        <FileText size={16} className="text-[#8F8F8F]" />
                      )}
                      <span className="text-[#393939]">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Content */}
              <div className="prose prose-sm max-w-none">
                {message.isStreaming ? (
                  <div className="flex items-center gap-2">
                    {renderContent(message.content)}
                    <span className="inline-block w-2 h-4 bg-[#DA7756] animate-pulse"></span>
                  </div>
                ) : (
                  renderContent(message.content)
                )}
              </div>
            </div>

            {/* Footer / Cost Info */}
            {!isUser && (
              <div className="mt-2 flex items-center gap-4">
                 <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
                  onMouseEnter={() => setShowCost(true)}
                  onMouseLeave={() => setShowCost(false)}
                >
                  {message.cost !== undefined && (
                    <button className="flex items-center gap-1.5 text-xs text-[#8F8F8F] hover:text-[#DA7756] transition-colors">
                      <DollarSign size={12} />
                      <span>${message.cost.toFixed(4)}</span>
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 text-xs text-[#8F8F8F] hover:text-[#393939] transition-colors">
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
