'use client';

import { X, Plus, MessageSquare, Trash2, Search, History } from 'lucide-react';
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

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[#F0EFEA] border-r border-[#E5E0D8] transform transition-all duration-300 ease-in-out flex flex-col font-sans-claude ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:overflow-hidden lg:translate-x-0 lg:opacity-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header & New Chat */}
          <div className="p-4">
            <div className="flex items-center justify-between lg:hidden mb-4">
               <h2 className="font-medium text-[#393939]">Menu</h2>
               <button onClick={onClose} className="p-1 text-[#585858]">
                 <X size={20} />
               </button>
            </div>

            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E6E4DD] hover:bg-[#DEDCD5] transition-colors w-full text-sm font-medium text-[#585858] mb-4"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>

            {/* Search */}
            {conversations.length > 0 && (
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white/50 border border-[#E5E0D8] rounded-lg text-sm text-[#393939] placeholder-[#8F8F8F] focus:outline-none focus:ring-1 focus:ring-[#D1CDC7]"
                />
              </div>
            )}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-2">
            <div className="px-2 py-1 text-xs font-medium text-[#8F8F8F] uppercase tracking-wider mb-2">
              Recents
            </div>
            
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <p className="text-sm text-[#8F8F8F]">
                  {searchQuery ? 'No chats found' : 'No history yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                      currentConversationId === conv.id
                        ? 'bg-[#E6E4DD] text-[#393939]'
                        : 'hover:bg-[#E6E4DD] text-[#585858] hover:text-[#393939]'
                    }`}
                    onClick={() => {
                      onSelectConversation?.(conv.id);
                      onClose();
                    }}
                  >
                    <span className="truncate flex-1">{conv.title}</span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation?.(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#DEDCD5] rounded text-[#8F8F8F] hover:text-[#DA7756] transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Footer */}
          <div className="p-4 border-t border-[#E5E0D8]">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#E6E4DD] cursor-pointer text-sm font-medium transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#DA7756] to-[#C76445] flex items-center justify-center text-white text-xs shadow-sm">
                JD
              </div>
              <div className="flex-1 text-[#393939]">John Doe</div>
            </div>
            
            {conversations.length > 0 && (
              <div className="mt-2 px-2 text-[10px] text-[#8F8F8F] flex justify-between">
                 <span>Total Spent</span>
                 <span className="font-medium text-[#DA7756]">
                    ${conversations.reduce((sum, conv) => sum + conv.totalCost, 0).toFixed(2)}
                 </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
