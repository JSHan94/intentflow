'use client';

import type { ExecutionPlan } from '@/types/plan';
import { MetricRow } from '@/components/ui/MetricRow';
import { ChainIcon } from '@/components/ui/ChainIcon';

interface PlanCardsProps {
  plans: ExecutionPlan[];
  onSelect: (plan: ExecutionPlan) => void;
}

const STRATEGY_COLORS: Record<string, string> = {
  cheapest: '#CCFF00',
  fastest: '#00D4FF',
  best_recovery: '#FEE440',
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
  return (
    <div className="flex items-center gap-1 py-2 overflow-x-auto">
      {Array.from(chains).map((chain, i, arr) => (
        <div key={chain} className="flex items-center gap-1.5 shrink-0">
          <ChainIcon chainName={chain} size={20} />
          {i < arr.length - 1 && <span className="font-mono text-xs font-black">→</span>}
        </div>
      ))}
    </div>
  );
}

export function PlanCards({ plans, onSelect }: PlanCardsProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12 font-mono text-sm font-bold text-[#999]">
        No plans generated.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-3xl mx-auto">
      <h2 className="font-mono text-sm font-black uppercase tracking-[3px]">★ Choose Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {plans.map((plan) => {
          const bg = STRATEGY_COLORS[plan.strategy] ?? '#CCFF00';

          return (
            <div
              key={plan.strategy}
              onClick={() => onSelect(plan)}
              className="flex flex-col gap-3 border-[3px] border-black bg-white cursor-pointer shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              {/* Header with color */}
              <div className="px-4 py-2 border-b-[3px] border-black font-mono text-[9px] font-black uppercase tracking-[3px]" style={{ background: bg }}>
                ★ {plan.label}
              </div>

              <div className="px-4 pb-4 flex flex-col gap-2">
                <div className="font-mono text-2xl font-black">${plan.total_estimated_fee_usd.toFixed(2)}</div>

                <RouteVisualization plan={plan} />

                <div className="border-t-2 border-black pt-2 space-y-0.5">
                  <MetricRow label="Time" value={formatTime(plan.total_estimated_time_seconds)} />
                  <MetricRow label="Steps" value={`${plan.hop_count}`} />
                  <MetricRow label="Output" value={plan.net_output} highlight />
                </div>

                {plan.warnings.length > 0 && (
                  <div className="font-mono text-[9px] font-bold text-[#FF5733]">!! {plan.warnings[0]}</div>
                )}

                <button className="w-full py-2.5 border-[3px] border-black bg-black text-[#CCFF00] font-mono text-[10px] font-black uppercase tracking-wider hover:bg-[#CCFF00] hover:text-black transition-colors">
                  Select →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
