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
    <div className="relative font-sans-claude">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-3 px-3 py-1.5 bg-[#F4F3EF] hover:bg-[#E6E4DD] rounded-lg transition-colors border border-transparent hover:border-[#D1CDC7]"
      >
        <div className="flex items-center gap-1.5 text-sm">
          <DollarSign size={14} className="text-[#DA7756]" />
          <span className="text-[#585858] font-medium">
            ${dailyCost.toFixed(2)}
          </span>
        </div>
        <div className="h-4 w-px bg-[#D1CDC7]" />
        <div className="flex items-center gap-1.5 text-sm">
          <Zap size={14} className="text-[#393939]" />
          <span className="text-[#585858]">
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
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E5E0D8] rounded-xl shadow-lg z-20 overflow-hidden ring-1 ring-[#000000]/5">
            <div className="p-4">
              <h3 className="font-semibold text-[#393939] mb-3 flex items-center gap-2">
                <DollarSign size={16} className="text-[#DA7756]" />
                Cost Breakdown
              </h3>

              {/* Current Chat */}
              <div className="mb-4 p-3 bg-[#F4F3EF] rounded-lg border border-[#E5E0D8]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#585858]">
                    This Chat
                  </span>
                  <span className="font-semibold text-[#393939]">
                    ${sessionCost.toFixed(4)}
                  </span>
                </div>
                {tokensUsed && (
                  <div className="text-xs text-[#767676] space-y-0.5 mt-2">
                    <div className="flex justify-between">
                      <span>Input tokens:</span>
                      <span>{tokensUsed.input.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output tokens:</span>
                      <span>{tokensUsed.output.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#DA7756]">
                      <span>Cached (90% off):</span>
                      <span>{tokensUsed.cacheRead.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Cost */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#585858]">
                    Today Total
                  </span>
                  <span className="font-semibold text-[#DA7756]">
                    ${dailyCost.toFixed(2)}
                  </span>
                </div>
                {dailyBudget && (
                  <div>
                    <div className="flex justify-between text-xs text-[#767676] mb-1">
                      <span>Budget: ${dailyBudget.toFixed(2)}</span>
                      <span>{dailyBudgetPercent.toFixed(0)}% used</span>
                    </div>
                    <div className="h-2 bg-[#F0EFEA] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          dailyBudgetPercent > 90 ? 'bg-red-500' : 
                          dailyBudgetPercent > 70 ? 'bg-[#DA7756]' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(dailyBudgetPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Cost */}
              <div className="flex justify-between items-center p-3 bg-white border border-[#E5E0D8] rounded-lg mb-3">
                <span className="text-sm text-[#585858]">
                  This Month
                </span>
                <span className="font-semibold text-[#393939]">
                  ${monthlyCost.toFixed(2)}
                </span>
              </div>

              {/* Savings */}
              {cacheSavings > 0 && (
                <div className="p-3 bg-[#E6F4EA] border border-[#CEEAD6] rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-[#1E8E3E]">
                    <TrendingUp size={14} />
                    <span className="font-medium">
                      Saved ${cacheSavings.toFixed(2)} with prompt caching!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-[#FAF9F6] border-t border-[#E5E0D8]">
              <p className="text-[10px] text-[#8F8F8F]">
                Costs are estimates based on model pricing.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
