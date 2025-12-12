'use client';

import { X, Save, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Settings } from '@/types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const MODEL_OPTIONS = [
  { value: 'haiku-4.5', label: 'Haiku 4.5', price: '$1/$5', speed: 'Fastest', description: 'Best for simple tasks' },
  { value: 'sonnet-4.5', label: 'Sonnet 4.5 ⭐', price: '$3/$15', speed: 'Fast', description: 'Recommended - Best balance' },
  { value: 'sonnet-4', label: 'Sonnet 4', price: '$3/$15', speed: 'Fast', description: 'Alternative option' },
  { value: 'opus-4.1', label: 'Opus 4.1', price: '$15/$75', speed: 'Medium', description: 'Complex reasoning' },
  { value: 'opus-4.5', label: 'Opus 4.5', price: '$15/$75', speed: 'Medium', description: 'Most powerful' },
];

export default function SettingsPanel({ isOpen, onClose, settings, onSave }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [apiKey, setApiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const savedApiKey = localStorage.getItem('anthropic_api_key') || '';
    const savedGithubToken = localStorage.getItem('github_token') || '';
    setApiKey(savedApiKey);
    setGithubToken(savedGithubToken);
  }, [isOpen]);

  const handleSave = () => {
    // Save API keys to localStorage
    if (apiKey) localStorage.setItem('anthropic_api_key', apiKey);
    if (githubToken) localStorage.setItem('github_token', githubToken);
    
    // Save settings
    localStorage.setItem('app_settings', JSON.stringify(localSettings));
    onSave(localSettings);
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <>
        {/* Overlay */}
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" />

        {/* Panel */}
        <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-claude-surface dark:bg-claude-surface-dark shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-claude-surface dark:bg-claude-surface-dark border-b border-claude-border dark:border-claude-border-dark z-10">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-2xl font-semibold text-claude-text dark:text-claude-text-dark">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-claude-bg dark:hover:bg-claude-bg-dark rounded-lg transition-colors"
            >
              <X size={20} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* API Configuration */}
          <section>
            <h3 className="text-lg font-semibold text-claude-text dark:text-claude-text-dark mb-4">
              API Configuration
            </h3>
            
            {/* Anthropic API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-claude-text dark:text-claude-text-dark mb-2">
                Anthropic API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2.5 pr-24 bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg text-claude-text dark:text-claude-text-dark placeholder-claude-text-muted dark:placeholder-claude-text-muted-dark focus:outline-none focus:ring-2 focus:ring-claude-orange font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-claude-surface dark:hover:bg-claude-surface-dark rounded transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                  ) : (
                    <Eye size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                  )}
                </button>
              </div>
              <p className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark mt-1">
                Get your API key from <a href="https://console.anthropic.com" target="_blank" className="text-claude-orange hover:underline">console.anthropic.com</a>
              </p>
            </div>

            {/* GitHub Token */}
            <div>
              <label className="block text-sm font-medium text-claude-text dark:text-claude-text-dark mb-2">
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full px-4 py-2.5 pr-24 bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg text-claude-text dark:text-claude-text-dark placeholder-claude-text-muted dark:placeholder-claude-text-muted-dark focus:outline-none focus:ring-2 focus:ring-claude-orange font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-claude-surface dark:hover:bg-claude-surface-dark rounded transition-colors"
                >
                  {showGithubToken ? (
                    <EyeOff size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                  ) : (
                    <Eye size={16} className="text-claude-text-muted dark:text-claude-text-muted-dark" />
                  )}
                </button>
              </div>
              <p className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark mt-1">
                Create token at <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" className="text-claude-orange hover:underline">github.com/settings/tokens</a> with 'repo' scope
              </p>
            </div>
          </section>

          {/* Model Selection */}
          <section>
            <h3 className="text-lg font-semibold text-claude-text dark:text-claude-text-dark mb-4">
              Default Model
            </h3>
            <div className="space-y-2">
              {MODEL_OPTIONS.map((model) => (
                <label
                  key={model.value}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    localSettings.model === model.value
                      ? 'border-claude-orange bg-claude-orange-light'
                      : 'border-claude-border dark:border-claude-border-dark hover:border-claude-orange/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.value}
                    checked={localSettings.model === model.value}
                    onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value as any })}
                    className="mt-1 accent-claude-orange"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-claude-text dark:text-claude-text-dark">
                        {model.label}
                      </span>
                      <span className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark">
                        {model.price}
                      </span>
                    </div>
                    <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                      {model.description} • {model.speed}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Deploy Mode */}
          <section>
            <h3 className="text-lg font-semibold text-claude-text dark:text-claude-text-dark mb-4">
              Deployment Mode
            </h3>
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                localSettings.deployMode === 'safe'
                  ? 'border-claude-orange bg-claude-orange-light'
                  : 'border-claude-border dark:border-claude-border-dark hover:border-claude-orange/50'
              }`}>
                <input
                  type="radio"
                  name="deployMode"
                  value="safe"
                  checked={localSettings.deployMode === 'safe'}
                  onChange={(e) => setLocalSettings({ ...localSettings, deployMode: e.target.value as any })}
                  className="mt-1 accent-claude-orange"
                />
                <div className="flex-1">
                  <div className="font-medium text-claude-text dark:text-claude-text-dark mb-1">
                    🛡️ Safe Mode (Recommended)
                  </div>
                  <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    Creates a branch for changes. Test before merging to main.
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                localSettings.deployMode === 'direct'
                  ? 'border-claude-orange bg-claude-orange-light'
                  : 'border-claude-border dark:border-claude-border-dark hover:border-claude-orange/50'
              }`}>
                <input
                  type="radio"
                  name="deployMode"
                  value="direct"
                  checked={localSettings.deployMode === 'direct'}
                  onChange={(e) => setLocalSettings({ ...localSettings, deployMode: e.target.value as any })}
                  className="mt-1 accent-claude-orange"
                />
                <div className="flex-1">
                  <div className="font-medium text-claude-text dark:text-claude-text-dark mb-1">
                    ⚡ Direct Mode
                  </div>
                  <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    Pushes directly to main branch. Use for quick fixes only.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-lg font-semibold text-claude-text dark:text-claude-text-dark mb-4">
              Features
            </h3>
            <div className="space-y-4">
              {/* Web Search */}
              <label className="flex items-center justify-between p-4 bg-claude-bg dark:bg-claude-bg-dark rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-claude-text dark:text-claude-text-dark mb-1">
                    Web Search
                  </div>
                  <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    Enable Claude to search the web for current information
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.enableWebSearch}
                  onChange={(e) => setLocalSettings({ ...localSettings, enableWebSearch: e.target.checked })}
                  className="w-11 h-6 accent-claude-orange"
                />
              </label>

              {/* Auto-detect Web Search */}
              {localSettings.enableWebSearch && (
                <label className="flex items-center justify-between p-4 bg-claude-bg dark:bg-claude-bg-dark rounded-lg ml-4">
                  <div className="flex-1">
                    <div className="font-medium text-claude-text dark:text-claude-text-dark mb-1">
                      Auto-detect when to search
                    </div>
                    <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                      Let Claude decide when web search is needed
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.webSearchAutoDetect}
                    onChange={(e) => setLocalSettings({ ...localSettings, webSearchAutoDetect: e.target.checked })}
                    className="w-11 h-6 accent-claude-orange"
                  />
                </label>
              )}

              {/* Extended Thinking */}
              <label className="flex items-center justify-between p-4 bg-claude-bg dark:bg-claude-bg-dark rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-claude-text dark:text-claude-text-dark mb-1">
                    Extended Thinking
                  </div>
                  <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    Deep reasoning mode for complex problems (uses more tokens)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.enableExtendedThinking}
                  onChange={(e) => setLocalSettings({ ...localSettings, enableExtendedThinking: e.target.checked })}
                  className="w-11 h-6 accent-claude-orange"
                />
              </label>

              {/* Conversation Compression */}
              <label className="flex items-center justify-between p-4 bg-claude-bg dark:bg-claude-bg-dark rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-claude-text dark:text-claude-text-dark mb-1">
                    Conversation Compression
                  </div>
                  <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    Compress old messages to save tokens (keeps last 10 intact)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.enableConversationCompression}
                  onChange={(e) => setLocalSettings({ ...localSettings, enableConversationCompression: e.target.checked })}
                  className="w-11 h-6 accent-claude-orange"
                />
              </label>

              {/* Pre-built Commands */}
              <label className="flex items-center justify-between p-4 bg-claude-bg dark:bg-claude-bg-dark rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-claude-text dark:text-claude-text-dark mb-1">
                    Quick Commands
                  </div>
                  <p className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    Enable /fix, /review, /test, /refactor shortcuts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.preBuiltCommands}
                  onChange={(e) => setLocalSettings({ ...localSettings, preBuiltCommands: e.target.checked })}
                  className="w-11 h-6 accent-claude-orange"
                />
              </label>
            </div>
          </section>

          {/* Budget Limits */}
          <section>
            <h3 className="text-lg font-semibold text-claude-text dark:text-claude-text-dark mb-4">
              Budget Limits
            </h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4 mb-4">
              <div className="flex gap-2">
                <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  Set spending limits to control costs. Claude will warn you when approaching limits.
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between p-4 bg-claude-bg dark:bg-claude-bg-dark rounded-lg mb-4">
              <span className="font-medium text-claude-text dark:text-claude-text-dark">
                Enable Budget Limits
              </span>
              <input
                type="checkbox"
                checked={localSettings.tokenBudget.enabled}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  tokenBudget: { ...localSettings.tokenBudget, enabled: e.target.checked }
                })}
                className="w-11 h-6 accent-claude-orange"
              />
            </label>

            {localSettings.tokenBudget.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-claude-text dark:text-claude-text-dark mb-2">
                    Daily Limit ($)
                  </label>
                  <input
                    type="number"
                    value={localSettings.tokenBudget.perDay}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      tokenBudget: { ...localSettings.tokenBudget, perDay: parseFloat(e.target.value) }
                    })}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg text-claude-text dark:text-claude-text-dark focus:outline-none focus:ring-2 focus:ring-claude-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-claude-text dark:text-claude-text-dark mb-2">
                    Per Message Limit ($)
                  </label>
                  <input
                    type="number"
                    value={localSettings.tokenBudget.perMessage}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      tokenBudget: { ...localSettings.tokenBudget, perMessage: parseFloat(e.target.value) }
                    })}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg text-claude-text dark:text-claude-text-dark focus:outline-none focus:ring-2 focus:ring-claude-orange"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-claude-surface dark:bg-claude-surface-dark border-t border-claude-border dark:border-claude-border-dark p-6">
          <button
            onClick={handleSave}
            disabled={saved}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-claude-orange hover:bg-claude-orange-hover disabled:bg-green-600 text-white font-medium rounded-lg transition-colors"
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
