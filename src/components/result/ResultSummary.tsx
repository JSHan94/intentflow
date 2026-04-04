'use client';

import type { ExecutionResult } from '@/types/flow';
import type { ExecutionPlan } from '@/types/plan';
import { MetricRow } from '@/components/ui/MetricRow';

interface ResultSummaryProps {
  result: ExecutionResult;
  plan: ExecutionPlan;
  rawIntent: string;
  onNewIntent: () => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

export function ResultSummary({ result, plan, rawIntent, onNewIntent }: ResultSummaryProps) {
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {/* Result box */}
      <div className="w-full border-2 border-[#0D9488] rounded-md p-5 bg-white shadow-[3px_3px_0_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className={`inline-block font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border mb-2 ${
              result.success
                ? 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]'
                : 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
            }`}>
              {result.success ? 'SUCCESS' : 'FAILED'}
            </span>
            <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">
              {result.success ? 'Intent Executed' : 'Execution Failed'}
            </h2>
          </div>
          <button
            onClick={onNewIntent}
            className="px-3 py-1.5 rounded-md border-2 border-[#0D9488] text-[#0D9488] font-mono text-xs font-semibold
              hover:bg-[#E0F5F3] transition-colors"
          >
            New Intent
          </button>
        </div>

        {/* Status */}
        <p className="font-mono text-xs text-[#6B6B6B] mb-4">{result.final_state}</p>

        {/* Metrics grid */}
        <div className="grid grid-cols-4 gap-3 pt-4 border-t border-[#E5E5E5]">
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#999] mb-1">Fees</div>
            <div className="font-heading text-lg font-bold text-[#0D9488]">${result.total_cost_usd.toFixed(2)}</div>
          </div>
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#999] mb-1">Time</div>
            <div className="font-heading text-lg font-bold text-[#1A1A1A]">{formatTime(result.total_time_seconds)}</div>
          </div>
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#999] mb-1">Steps</div>
            <div className="font-heading text-lg font-bold text-[#1A1A1A]">{result.steps_completed}/{result.total_steps}</div>
          </div>
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#999] mb-1">Output</div>
            <div className="font-heading text-lg font-bold text-[#0D9488]">{plan.net_output}</div>
          </div>
        </div>
      </div>

      {/* Original intent */}
      <div className="w-full px-4 py-3 rounded-md border-[1.5px] border-[#D4D4D4] bg-[#F5F5F5] font-mono text-xs text-[#6B6B6B] italic">
        &ldquo;{rawIntent}&rdquo;
      </div>
    </div>
  );
}
