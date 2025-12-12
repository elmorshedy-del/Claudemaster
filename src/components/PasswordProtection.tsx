'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export default function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('app_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        sessionStorage.setItem('app_authenticated', 'true');
        setIsAuthenticated(true);
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('Error verifying password');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-claude-bg dark:bg-claude-bg-dark">
        <div className="animate-spin w-8 h-8 border-2 border-claude-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-claude-bg dark:bg-claude-bg-dark">
        <div className="w-full max-w-md p-8 bg-claude-surface dark:bg-claude-surface-dark rounded-2xl shadow-lg border border-claude-border dark:border-claude-border-dark">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-claude-orange-light rounded-full flex items-center justify-center mb-4">
              <Lock size={28} className="text-claude-orange" />
            </div>
            <h1 className="text-2xl font-semibold text-claude-text dark:text-claude-text-dark">
              Claude Coder
            </h1>
            <p className="text-claude-text-muted dark:text-claude-text-muted-dark mt-2 text-center">
              Enter your password to access the application
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-claude-border dark:border-claude-border-dark bg-claude-bg dark:bg-claude-bg-dark text-claude-text dark:text-claude-text-dark placeholder-claude-text-muted dark:placeholder-claude-text-muted-dark focus:outline-none focus:ring-2 focus:ring-claude-orange transition-all"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password}
              className="w-full py-3 bg-claude-orange hover:bg-claude-orange-hover disabled:bg-claude-text-muted disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Unlock
            </button>
          </form>

          <p className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark text-center mt-6">
            Password is set in environment variables (APP_PASSWORD)
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
