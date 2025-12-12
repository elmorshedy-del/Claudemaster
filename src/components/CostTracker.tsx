'use client';

import { DollarSign, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

interface CostTrackerProps {
  sessionCost: number;
  dailyCost: number;
  monthlyCost: number;
  dailyBudget?: number;
  tokensUsed?: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
}

export default function CostTracker({ 
  sessionCost, 
  dailyCost, 
  monthlyCost,
  dailyBudget,
  tokensUsed 
}: CostTrackerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const dailyBudgetPercent = dailyBudget ? (dailyCost / dailyBudget) * 100 : 0;
  const cacheSavings = tokensUsed ? (tokensUsed.cacheRead * 0.9) : 0;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-3 px-3 py-1.5 hover:bg-claude-bg dark:hover:bg-claude-bg-dark rounded-lg transition-colors"
      >
        <div className="flex items-center gap-1.5 text-sm">
          <DollarSign size={14} className="text-claude-orange" />
          <span className="text-claude-text-muted dark:text-claude-text-muted-dark">
            ${dailyCost.toFixed(2)}
          </span>
        </div>
        <div className="h-4 w-px bg-claude-border dark:bg-claude-border-dark" />
        <div className="flex items-center gap-1.5 text-sm">
          <Zap size={14} className="text-blue-500" />
          <span className="text-claude-text-muted dark:text-claude-text-muted-dark">
            ${sessionCost.toFixed(3)}
          </span>
        </div>
      </button>

      {/* Dropdown Details */}
      {showDetails && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-claude-surface dark:bg-claude-surface-dark border border-claude-border dark:border-claude-border-dark rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-claude-text dark:text-claude-text-dark mb-3 flex items-center gap-2">
                <DollarSign size={16} className="text-claude-orange" />
                Cost Breakdown
              </h3>

              {/* Current Chat */}
              <div className="mb-4 p-3 bg-claude-bg dark:bg-claude-bg-dark rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    This Chat
                  </span>
                  <span className="font-semibold text-claude-text dark:text-claude-text-dark">
                    ${sessionCost.toFixed(4)}
                  </span>
                </div>
                {tokensUsed && (
                  <div className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark space-y-0.5 mt-2">
                    <div className="flex justify-between">
                      <span>Input tokens:</span>
                      <span>{tokensUsed.input.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output tokens:</span>
                      <span>{tokensUsed.output.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Cached (90% off):</span>
                      <span>{tokensUsed.cacheRead.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Cost */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                    Today Total
                  </span>
                  <span className="font-semibold text-claude-orange">
                    ${dailyCost.toFixed(2)}
                  </span>
                </div>
                {dailyBudget && (
                  <div>
                    <div className="flex justify-between text-xs text-claude-text-muted dark:text-claude-text-muted-dark mb-1">
                      <span>Budget: ${dailyBudget.toFixed(2)}</span>
                      <span>{dailyBudgetPercent.toFixed(0)}% used</span>
                    </div>
                    <div className="h-2 bg-claude-bg dark:bg-claude-bg-dark rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          dailyBudgetPercent > 90 ? 'bg-red-500' : 
                          dailyBudgetPercent > 70 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(dailyBudgetPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Cost */}
              <div className="flex justify-between items-center p-3 bg-claude-bg dark:bg-claude-bg-dark rounded-lg mb-3">
                <span className="text-sm text-claude-text-muted dark:text-claude-text-muted-dark">
                  This Month
                </span>
                <span className="font-semibold text-claude-text dark:text-claude-text-dark">
                  ${monthlyCost.toFixed(2)}
                </span>
              </div>

              {/* Savings */}
              {cacheSavings > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <TrendingUp size={14} />
                    <span className="font-medium">
                      Saved ${cacheSavings.toFixed(2)} with prompt caching!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-claude-bg dark:bg-claude-bg-dark border-t border-claude-border dark:border-claude-border-dark">
              <p className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark">
                Costs are estimates based on model pricing. Actual costs may vary slightly.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
