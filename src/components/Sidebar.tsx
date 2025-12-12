'use client';

import { X, Plus, MessageSquare, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { Conversation } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-claude-surface dark:bg-claude-surface-dark border-r border-claude-border dark:border-claude-border-dark transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-claude-border dark:border-claude-border-dark">
            <h2 className="font-semibold text-claude-text dark:text-claude-text-dark">
              Conversations
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-claude-bg dark:hover:bg-claude-bg-dark rounded-lg transition-colors"
            >
              <X size={18} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-claude-orange hover:bg-claude-orange-hover text-white rounded-lg transition-colors font-medium"
            >
              <Plus size={18} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search */}
          {conversations.length > 0 && (
            <div className="px-3 pb-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-claude-text-muted dark:text-claude-text-muted-dark" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg text-sm text-claude-text dark:text-claude-text-dark placeholder-claude-text-muted dark:placeholder-claude-text-muted-dark focus:outline-none focus:ring-2 focus:ring-claude-orange"
                />
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-2">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageSquare size={40} className="text-claude-text-muted dark:text-claude-text-muted-dark mb-3 opacity-50" />
                <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 pb-4">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conv.id
                        ? 'bg-claude-orange-light border border-claude-orange/20'
                        : 'hover:bg-claude-bg dark:hover:bg-claude-bg-dark'
                    }`}
                    onClick={() => {
                      onSelectConversation?.(conv.id);
                      onClose();
                    }}
                  >
                    <MessageSquare size={16} className="flex-shrink-0 text-claude-text-muted dark:text-claude-text-muted-dark" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-claude-text dark:text-claude-text-dark truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark">
                        {formatDate(conv.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation?.(conv.id);
                      }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                    >
                      <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with total cost */}
          {conversations.length > 0 && (
            <div className="p-4 border-t border-claude-border dark:border-claude-border-dark">
              <div className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark">
                <div className="flex justify-between mb-1">
                  <span>Total conversations:</span>
                  <span className="font-medium">{conversations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total spent:</span>
                  <span className="font-medium text-claude-orange">
                    ${conversations.reduce((sum, conv) => sum + conv.totalCost, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
