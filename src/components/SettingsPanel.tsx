'use client';

import { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, AlertCircle, Check, Key, Github, Cpu, Shield, Sparkles } from 'lucide-react';
import { Settings } from '@/types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Latest and most capable' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Fast and intelligent' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Quick and efficient' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful' },
];

export default function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ apiKey?: string; githubToken?: string }>({});

  // Sync with parent settings when they change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('claude-coder-api-key');
      const savedGithubToken = localStorage.getItem('claude-coder-github-token');
      const savedModel = localStorage.getItem('claude-coder-model');
      const savedSafeMode = localStorage.getItem('claude-coder-safe-mode');

      if (savedApiKey || savedGithubToken || savedModel || savedSafeMode) {
        const loadedSettings = {
          ...localSettings,
          apiKey: savedApiKey || localSettings.apiKey,
          githubToken: savedGithubToken || localSettings.githubToken,
          model: savedModel || localSettings.model,
          safeMode: savedSafeMode ? savedSafeMode === 'true' : localSettings.safeMode,
        };
        setLocalSettings(loadedSettings);
        onSettingsChange(loadedSettings);
      }
    }
  }, []);

  const validateSettings = (): boolean => {
    const newErrors: { apiKey?: string; githubToken?: string } = {};

    if (localSettings.apiKey && !localSettings.apiKey.startsWith('sk-ant-')) {
      newErrors.apiKey = 'API key should start with "sk-ant-"';
    }

    if (localSettings.githubToken && !localSettings.githubToken.startsWith('ghp_') && !localSettings.githubToken.startsWith('github_pat_')) {
      newErrors.githubToken = 'GitHub token should start with "ghp_" or "github_pat_"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateSettings()) return;

    // Save to localStorage
    if (typeof window !== 'undefined') {
      if (localSettings.apiKey) {
        localStorage.setItem('claude-coder-api-key', localSettings.apiKey);
      }
      if (localSettings.githubToken) {
        localStorage.setItem('claude-coder-github-token', localSettings.githubToken);
      }
      localStorage.setItem('claude-coder-model', localSettings.model);
      localStorage.setItem('claude-coder-safe-mode', String(localSettings.safeMode));
    }

    // Update parent state
    onSettingsChange(localSettings);

    // Show success feedback
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleChange = (field: keyof Settings, value: string | boolean) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field === 'apiKey' || field === 'githubToken') {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
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
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[var(--claude-surface)] shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[var(--claude-border)] bg-[var(--claude-surface)]">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--claude-terracotta)] to-[#E89B7D] flex items-center justify-center shadow-sm">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--claude-text)]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                  Settings
                </h2>
                <p className="text-sm text-[var(--claude-text-muted)]">Configure your coding assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-[var(--claude-sand-light)] rounded-xl transition-all duration-200 hover:scale-105"
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
              <h3 className="text-base font-semibold text-[var(--claude-text)]">
                API Configuration
              </h3>
            </div>

            {/* Anthropic API Key */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--claude-text-secondary)]">
                Anthropic API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localSettings.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
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
              <label className="block text-sm font-medium text-[var(--claude-text-secondary)]">
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={localSettings.githubToken}
                  onChange={(e) => handleChange('githubToken', e.target.value)}
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
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--claude-border)] to-transparent" />

          {/* Model Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={18} className="text-[var(--claude-terracotta)]" />
              <h3 className="text-base font-semibold text-[var(--claude-text)]">
                Model Selection
              </h3>
            </div>

            <div className="grid gap-3">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleChange('model', model.id)}
                  className={`
                    w-full p-4 rounded-xl border text-left transition-all duration-200
                    ${localSettings.model === model.id 
                      ? 'border-[var(--claude-terracotta)] bg-[var(--claude-terracotta-subtle)] shadow-sm' 
                      : 'border-[var(--claude-border)] hover:border-[var(--claude-border-strong)] hover:bg-[var(--claude-sand-light)]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[var(--claude-text)]">{model.name}</div>
                      <div className="text-sm text-[var(--claude-text-muted)]">{model.description}</div>
                    </div>
                    {localSettings.model === model.id && (
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

          {/* Safe Mode */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-[var(--claude-terracotta)]" />
              <h3 className="text-base font-semibold text-[var(--claude-text)]">
                Safety Settings
              </h3>
            </div>

            <button
              onClick={() => handleChange('safeMode', !localSettings.safeMode)}
              className={`
                w-full p-4 rounded-xl border text-left transition-all duration-200
                ${localSettings.safeMode 
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
                  ${localSettings.safeMode ? 'bg-[var(--claude-success)]' : 'bg-[var(--claude-sand)]'}
                `}>
                  <div className={`
                    absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200
                    ${localSettings.safeMode ? 'left-6' : 'left-1'}
                  `} />
                </div>
              </div>
            </button>
          </section>
        </div>

        {/* Footer with Save Button */}
        <div className="flex-shrink-0 border-t border-[var(--claude-border)] bg-[var(--claude-surface)] p-6">
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
