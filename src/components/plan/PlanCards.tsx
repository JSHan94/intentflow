'use client';

import type { ExecutionPlan } from '@/types/plan';
import { Badge } from '@/components/ui/Badge';
import { MetricRow } from '@/components/ui/MetricRow';
import { ChainIcon } from '@/components/ui/ChainIcon';

interface PlanCardsProps {
  plans: ExecutionPlan[];
  onSelect: (plan: ExecutionPlan) => void;
}

const STRATEGY_CONFIG: Record<string, { label: string }> = {
  cheapest: { label: 'CHEAPEST' },
  fastest: { label: 'FASTEST' },
  best_recovery: { label: 'SAFE' },
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

function RouteVisualization({ plan }: { plan: ExecutionPlan }) {
  const chains = new Set<string>();
  for (const step of plan.steps) {
    chains.add(step.source_chain);
    chains.add(step.destination_chain);
  }
  const chainList = Array.from(chains);

  return (
    <div className="flex items-center gap-1 py-2 overflow-x-auto">
      {chainList.map((chain, i) => (
        <div key={chain} className="flex items-center gap-1.5 shrink-0">
          <ChainIcon chainName={chain} size={20} />
          {i < chainList.length - 1 && (
            <span className="font-mono text-xs text-[#999]">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function PlanCards({ plans, onSelect }: PlanCardsProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12 font-mono text-sm text-[#999]">
        No execution plans could be generated for this intent.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-lg font-semibold text-[#1A1A1A]">Choose an Execution Plan</h2>
        <p className="text-sm text-[#6B6B6B]">Compare routes and select the best option</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
        {plans.map((plan) => {
          const config = STRATEGY_CONFIG[plan.strategy] ?? STRATEGY_CONFIG.cheapest;

          return (
            <div
              key={plan.strategy}
              className="flex flex-col gap-3 p-4 rounded-md border-2 border-[#D4D4D4] bg-white
                cursor-pointer hover:border-[#1A1A1A] hover:shadow-[2px_2px_0_rgba(0,0,0,0.06)]
                transition-[border-color,box-shadow] duration-100"
              onClick={() => onSelect(plan)}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#999]">
                  {config.label}
                </span>
                <Badge
                  label={plan.risk_level}
                  color={plan.risk_level === 'low' ? 'success' : plan.risk_level === 'medium' ? 'warning' : 'error'}
                />
              </div>

              {/* Fee */}
              <div className="font-heading text-xl font-bold text-[#1A1A1A]">
                ${plan.total_estimated_fee_usd.toFixed(2)}
              </div>

              {/* Route */}
              <RouteVisualization plan={plan} />

              {/* Metrics */}
              <div className="border-t border-[#E5E5E5] pt-3 space-y-0.5">
                <MetricRow label="Est. Time" value={formatTime(plan.total_estimated_time_seconds)} />
                <MetricRow label="Steps" value={`${plan.hop_count}`} />
                <MetricRow label="Net Output" value={plan.net_output} highlight />
              </div>

              {/* Warnings */}
              {plan.warnings.length > 0 && (
                <div className="font-mono text-[10px] text-[#D97706]">
                  {plan.warnings[0]}
                </div>
              )}

              {/* Select */}
              <button
                className="mt-auto w-full py-2 rounded-md bg-[#0D9488] text-white font-mono text-xs font-semibold
                  border-2 border-[#0A7A70] hover:bg-[#0A7A70] transition-colors"
              >
                Select Plan
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
