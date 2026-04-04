'use client';

import type { ExecutionResult } from '@/types/flow';
import type { ExecutionPlan } from '@/types/plan';
import { MetricRow } from '@/components/ui/MetricRow';
import { JennieIcon } from '@/components/ui/JennieIcon';

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
      <JennieIcon expression={result.success ? 'happy' : 'sad'} size="lg" />

      {/* Result box */}
      <div className={`w-full border-[3px] border-black p-5 shadow-[6px_6px_0_#000] ${result.success ? 'bg-[#CCFF00]' : 'bg-[#FF5733]'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className={`inline-block font-mono text-[9px] font-black uppercase tracking-[3px] px-2 py-1 border-2 border-black mb-2 ${
              result.success ? 'bg-black text-[#CCFF00]' : 'bg-white text-[#FF5733]'
            }`}>
              {result.success ? '★ SUCCESS' : '!! FAILED'}
            </span>
            <h2 className="font-mono text-lg font-black uppercase">
              {result.success ? 'Intent Executed' : 'Execution Failed'}
            </h2>
          </div>
          <button
            onClick={onNewIntent}
            className="px-3 py-2 border-[3px] border-black bg-white font-mono text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] transition-all"
          >
            New →
          </button>
        </div>

        <p className="font-mono text-[10px] font-bold mb-4">{result.final_state}</p>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Fees', value: `$${result.total_cost_usd.toFixed(2)}` },
            { label: 'Time', value: formatTime(result.total_time_seconds) },
            { label: 'Steps', value: `${result.steps_completed}/${result.total_steps}` },
            { label: 'Output', value: plan.net_output },
          ].map(m => (
            <div key={m.label} className="border-2 border-black bg-white p-2">
              <div className="font-mono text-[7px] font-black uppercase tracking-[2px] text-[#999]">{m.label}</div>
              <div className="font-mono text-sm font-black mt-0.5">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Original intent */}
      <div className="w-full px-4 py-3 border-[3px] border-black bg-white font-mono text-[10px] font-bold shadow-[3px_3px_0_#000]">
        &ldquo;{rawIntent}&rdquo;
      </div>
    </div>
  );
}
