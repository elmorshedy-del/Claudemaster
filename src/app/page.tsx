cat > src/app/page.tsx << 'ENDOFFILE'
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Settings as SettingsIcon, Moon, Sun, Menu, Code2, Shield, Zap } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import Sidebar from '@/components/Sidebar';
import SettingsPanel from '@/components/SettingsPanel';
import WelcomeScreen from '@/components/WelcomeScreen';
import CostTracker from '@/components/CostTracker';
import FileUpload from '@/components/FileUpload';
import BranchManager from '@/components/BranchManager';
import DiffViewer from '@/components/DiffViewer';
import PasswordProtection from '@/components/PasswordProtection';
import { Message, Settings, Conversation, UploadedFile } from '@/types';

const DEFAULT_SETTINGS: Settings = {
  deployMode: 'safe',
  model: 'sonnet-4.5',
  enableWebSearch: true,
  webSearchAutoDetect: true,
  enableExtendedThinking: false,
  enableMultiModelRouting: false,
  enableConversationCompression: false,
  tokenBudget: {
    enabled: true,
    perMessage: 1.0,
    perDay: 10.0
  },
  preBuiltCommands: true
};

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentBranch, setCurrentBranch] = useState<any>(null);
  const [costTracking, setCostTracking] = useState({
    sessionCost: 0,
    dailyCost: 0,
    monthlyCost: 0,
    tokensUsed: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    const savedDarkMode = localStorage.getItem('dark_mode');
    const savedConversations = localStorage.getItem('conversations');
    
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      })));
    }
    
    if (savedDarkMode === 'true') {
      document.body.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dark_mode', darkMode.toString());
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          settings,
          files: userMessage.files
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        model: settings.model
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'content') {
                  assistantMessage.content += parsed.delta;
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: assistantMessage.content }
                        : msg
                    )
                  );
                } else if (parsed.type === 'cost') {
                  assistantMessage.cost = parsed.cost;
                  assistantMessage.tokensUsed = parsed.tokensUsed;
                  
                  setCostTracking(prev => ({
                    sessionCost: prev.sessionCost + parsed.cost,
                    dailyCost: prev.dailyCost + parsed.cost,
                    monthlyCost: prev.monthlyCost + parsed.cost,
                    tokensUsed: {
                      input: prev.tokensUsed.input + parsed.tokensUsed.input,
                      output: prev.tokensUsed.output + parsed.tokensUsed.output,
                      cacheRead: prev.tokensUsed.cacheRead + (parsed.tokensUsed.cacheRead || 0),
                      cacheWrite: prev.tokensUsed.cacheWrite + (parsed.tokensUsed.cacheWrite || 0)
                    }
                  }));
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const newChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setCostTracking(prev => ({ ...prev, sessionCost: 0 }));
  };

  const toggleDeployMode = () => {
    setSettings(prev => ({
      ...prev,
      deployMode: prev.deployMode === 'safe' ? 'direct' : 'safe'
    }));
  };

  return (
    <PasswordProtection>
      <div className="flex h-screen bg-claude-bg dark:bg-claude-bg-dark">
        <Sidebar 
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onNewChat={newChat}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={() => {}}
          onDeleteConversation={() => {}}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 border-b border-claude-border dark:border-claude-border-dark bg-claude-surface dark:bg-claude-surface-dark">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 hover:bg-claude-bg dark:hover:bg-claude-bg-dark rounded-lg transition-colors"
                >
                  <Menu size={18} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                </button>
                <div className="flex items-center gap-2">
                  <Code2 className="text-claude-orange" size={20} />
                  <h1 className="text-base font-semibold text-claude-text dark:text-claude-text-dark">
                    Claude Coder
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value as any })}
                  className="px-3 py-1.5 text-sm bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg text-claude-text dark:text-claude-text-dark focus:outline-none focus:ring-2 focus:ring-claude-orange"
                >
                  <option value="haiku-4.5">Haiku 4.5</option>
                  <option value="sonnet-4.5">Sonnet 4.5 ⭐</option>
                  <option value="sonnet-4">Sonnet 4</option>
                  <option value="opus-4.5">Opus 4.5</option>
                  <option value="opus-4.1">Opus 4.1</option>
                </select>

                <button
                  onClick={toggleDeployMode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    settings.deployMode === 'safe'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  }`}
                >
                  {settings.deployMode === 'safe' ? <Shield size={14} /> : <Zap size={14} />}
                  <span className="hidden sm:inline">{settings.deployMode === 'safe' ? 'Safe' : 'Direct'}</span>
                </button>

                <CostTracker
                  sessionCost={costTracking.sessionCost}
                  dailyCost={costTracking.dailyCost}
                  monthlyCost={costTracking.monthlyCost}
                  dailyBudget={settings.tokenBudget.enabled ? settings.tokenBudget.perDay : undefined}
                  tokensUsed={costTracking.tokensUsed}
                />

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 hover:bg-claude-bg dark:hover:bg-claude-bg-dark rounded-lg transition-colors"
                >
                  {darkMode ? <Sun size={18} className="text-claude-text-muted dark:text-claude-text-muted-dark" /> : <Moon size={18} className="text-claude-text-muted dark:text-claude-text-muted-dark" />}
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-claude-bg dark:hover:bg-claude-bg-dark rounded-lg transition-colors"
                >
                  <SettingsIcon size={18} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={setInput} />
            ) : (
              <div className="pb-32">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-claude-border dark:border-claude-border-dark bg-claude-surface dark:bg-claude-surface-dark">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <FileUpload
                files={uploadedFiles}
                onFilesSelected={(files) => setUploadedFiles(prev => [...prev, ...files])}
                onRemoveFile={(id) => setUploadedFiles(prev => prev.filter(f => f.id !== id))}
              />

              <div className="relative mt-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Claude..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-claude-border dark:border-claude-border-dark bg-claude-bg dark:bg-claude-bg-dark px-4 py-3 pr-12 text-claude-text dark:text-claude-text-dark placeholder-claude-text-muted dark:placeholder-claude-text-muted-dark focus:outline-none focus:ring-2 focus:ring-claude-orange focus:border-transparent transition-all"
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                  className="absolute right-2 bottom-2 p-2.5 bg-claude-orange hover:bg-claude-orange-hover disabled:bg-claude-text-muted disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>

              <p className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark text-center mt-2">
                Claude can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>

        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
        />
      </div>
    </PasswordProtection>
  );
}
ENDOFFILE
