'use client';

import { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, AlertCircle, Check, Key, Cpu, Shield, Sparkles } from 'lucide-react';
import { Settings } from '@/types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const MODEL_OPTIONS = [
  { value: 'haiku-4.5', label: 'Haiku 4.5', price: '$1/$5', description: 'Fastest, best for simple tasks' },
  { value: 'sonnet-4.5', label: 'Sonnet 4.5', price: '$3/$15', description: 'Recommended - best balance' },
  { value: 'sonnet-4', label: 'Sonnet 4', price: '$3/$15', description: 'Fast and capable' },
  { value: 'opus-4.1', label: 'Opus 4.1', price: '$15/$75', description: 'Complex reasoning' },
  { value: 'opus-4.5', label: 'Opus 4.5', price: '$15/$75', description: 'Most powerful' },
];

export default function SettingsPanel({ isOpen, onClose, settings, onSave }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [apiKey, setApiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ apiKey?: string; githubToken?: string }>({});

  // Sync with parent settings
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Load API keys from localStorage
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('anthropic_api_key') || '';
      const savedGithubToken = localStorage.getItem('github_token') || '';
      const savedRepoOwner = localStorage.getItem('github_repo_owner') || '';
      const savedRepoName = localStorage.getItem('github_repo_name') || '';
      setApiKey(savedApiKey);
      setGithubToken(savedGithubToken);
      setRepoOwner(savedRepoOwner);
      setRepoName(savedRepoName);
    }
  }, [isOpen]);

  const validateInputs = (): boolean => {
    const newErrors: { apiKey?: string; githubToken?: string } = {};

    if (apiKey && !apiKey.startsWith('sk-ant-')) {
      newErrors.apiKey = 'API key should start with "sk-ant-"';
    }

    if (githubToken && !githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_')) {
      newErrors.githubToken = 'Token should start with "ghp_" or "github_pat_"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateInputs()) return;

    // Save API keys to localStorage
    if (typeof window !== 'undefined') {
      if (apiKey) localStorage.setItem('anthropic_api_key', apiKey);
      if (githubToken) localStorage.setItem('github_token', githubToken);
      if (repoOwner) localStorage.setItem('github_repo_owner', repoOwner);
      if (repoName) localStorage.setItem('github_repo_name', repoName);
      localStorage.setItem('app_settings', JSON.stringify(localSettings));
    }

    // Update parent state
    onSave(localSettings);

    // Show success feedback
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handleSettingChange = (field: keyof Settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" 
        onClick={onClose} 
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[var(--claude-surface)] dark:bg-[var(--claude-surface)] shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[var(--claude-border)] dark:border-[var(--claude-border)]">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--claude-terracotta)] to-[#E89B7D] flex items-center justify-center shadow-sm">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--claude-text)] dark:text-[var(--claude-text)]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  Settings
                </h2>
                <p className="text-sm text-[var(--claude-text-muted)] dark:text-[var(--claude-text-muted)]">Configure your coding assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-[var(--claude-sand-light)] dark:hover:bg-[var(--claude-sand-light)] rounded-xl transition-all duration-200 hover:scale-105"
            >
              <X size={20} className="text-[var(--claude-text-muted)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* API Configuration */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-[var(--claude-terracotta)]" />
              <h3 className="text-base font-semibold text-[var(--claude-text)] dark:text-[var(--claude-text)]">
                API Configuration
              </h3>
            </div>

            {/* Anthropic API Key */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--claude-text-secondary)] dark:text-[var(--claude-text-secondary)]">
                Anthropic API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setErrors(prev => ({ ...prev, apiKey: undefined }));
                  }}
                  placeholder="sk-ant-xxxxx..."
                  className="input-claude pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--claude-text-muted)] hover:text-[var(--claude-text)] transition-colors rounded-lg hover:bg-[var(--claude-sand-light)]"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.apiKey && (
                <div className="flex items-center gap-2 text-sm text-[var(--claude-error)]">
                  <AlertCircle size={14} />
                  <span>{errors.apiKey}</span>
                </div>
              )}
              <p className="text-xs text-[var(--claude-text-muted)]">
                Get your API key from{' '}
                <a 
                  href="https://console.anthropic.com/settings/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--claude-terracotta)] hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>

            {/* GitHub Token */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--claude-text-secondary)] dark:text-[var(--claude-text-secondary)]">
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    setErrors(prev => ({ ...prev, githubToken: undefined }));
                  }}
                  placeholder="ghp_xxxxx..."
                  className="input-claude pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--claude-text-muted)] hover:text-[var(--claude-text)] transition-colors rounded-lg hover:bg-[var(--claude-sand-light)]"
                >
                  {showGithubToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.githubToken && (
                <div className="flex items-center gap-2 text-sm text-[var(--claude-error)]">
                  <AlertCircle size={14} />
                  <span>{errors.githubToken}</span>
                </div>
              )}
              <p className="text-xs text-[var(--claude-text-muted)]">
                Create a token with repo access at{' '}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--claude-terracotta)] hover:underline"
                >
                  github.com/settings/tokens
                </a>
              </p>

              {/* Repo owner */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--claude-text-secondary)] dark:text-[var(--claude-text-secondary)]">
                  Repository Owner
                </label>
                <input
                  type="text"
                  value={repoOwner}
                  onChange={(e) => setRepoOwner(e.target.value)}
                  placeholder="your-github-username-or-org"
                  className="input-claude"
                />
              </div>

              {/* Repo name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--claude-text-secondary)] dark:text-[var(--claude-text-secondary)]">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="repo-name"
                  className="input-claude"
                />
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--claude-border)] to-transparent" />

          {/* Model Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={18} className="text-[var(--claude-terracotta)]" />
              <h3 className="text-base font-semibold text-[var(--claude-text)] dark:text-[var(--claude-text)]">
                Model Selection
              </h3>
            </div>

            <div className="grid gap-3">
              {MODEL_OPTIONS.map((model) => (
                <button
                  key={model.value}
                  onClick={() => handleSettingChange('model', model.value)}
                  className={`
                    w-full p-4 rounded-xl border text-left transition-all duration-200
                    ${localSettings.model === model.value 
                      ? 'border-[var(--claude-terracotta)] bg-[var(--claude-terracotta-subtle)] shadow-sm' 
                      : 'border-[var(--claude-border)] hover:border-[var(--claude-border-strong)] hover:bg-[var(--claude-sand-light)]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--claude-text)]">{model.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--claude-sand-light)] text-[var(--claude-text-muted)]">
                          {model.price}
                        </span>
                      </div>
                      <div className="text-sm text-[var(--claude-text-muted)] mt-0.5">{model.description}</div>
                    </div>
                    {localSettings.model === model.value && (
                      <div className="w-6 h-6 rounded-full bg-[var(--claude-terracotta)] flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--claude-border)] to-transparent" />

          {/* Deploy Mode */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-[var(--claude-terracotta)]" />
              <h3 className="text-base font-semibold text-[var(--claude-text)] dark:text-[var(--claude-text)]">
                Deploy Mode
              </h3>
            </div>

            <button
              onClick={() => handleSettingChange('deployMode', localSettings.deployMode === 'safe' ? 'direct' : 'safe')}
              className={`
                w-full p-4 rounded-xl border text-left transition-all duration-200
                ${localSettings.deployMode === 'safe' 
                  ? 'border-[var(--claude-success)] bg-[rgba(74,157,110,0.08)]' 
                  : 'border-[var(--claude-border)] hover:border-[var(--claude-border-strong)] hover:bg-[var(--claude-sand-light)]'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-[var(--claude-text)]">Safe Mode</div>
                  <div className="text-sm text-[var(--claude-text-muted)]">
                    Create changes in a new branch instead of directly on main
                  </div>
                </div>
                <div className={`
                  w-12 h-7 rounded-full relative transition-colors duration-200
                  ${localSettings.deployMode === 'safe' ? 'bg-[var(--claude-success)]' : 'bg-[var(--claude-sand)]'}
                `}>
                  <div className={`
                    absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200
                    ${localSettings.deployMode === 'safe' ? 'left-6' : 'left-1'}
                  `} />
                </div>
              </div>
            </button>
          </section>
        </div>

        {/* Footer with Save Button */}
        <div className="flex-shrink-0 border-t border-[var(--claude-border)] p-6">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all duration-200
              ${saved 
                ? 'bg-[var(--claude-success)] text-white' 
                : 'bg-[var(--claude-terracotta)] hover:bg-[var(--claude-terracotta-hover)] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            {saved ? (
              <>
                <Check size={18} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
