'use client';

import type { ExecutionStepStatus } from '@/types/flow';
import type { ExecutionPlan } from '@/types/plan';
import { ChainIcon } from '@/components/ui/ChainIcon';

interface ExecutionViewProps {
  plan: ExecutionPlan;
  steps: ExecutionStepStatus[];
}

const OP_LABELS: Record<string, string> = {
  ibc_transfer: 'IBC Transfer', op_bridge_deposit: 'OP Bridge',
  op_bridge_withdraw: 'OP Withdraw', minitswap: 'MinitSwap', transfer: 'Transfer',
};

const STATUS_BG: Record<string, string> = {
  pending: 'bg-white', active: 'bg-[#CCFF00]', complete: 'bg-black text-[#CCFF00]', failed: 'bg-[#FF5733] text-white',
};

export function ExecutionView({ plan, steps }: ExecutionViewProps) {
  const done = steps.filter(s => s.status === 'complete').length;
  const progress = steps.length > 0 ? (done / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      <h2 className="font-mono text-sm font-black uppercase tracking-[3px]">★ {plan.label}</h2>

      <div className="w-full h-3 bg-white border-[3px] border-black">
        <div className="h-full bg-[#CCFF00] transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="w-full border-[3px] border-black bg-white shadow-[4px_4px_0_#000] overflow-hidden">
        {steps.map(({ step, status }, i) => (
          <div key={step.step_index} className={`flex items-center gap-3 px-4 py-3 ${i < steps.length - 1 ? 'border-b-2 border-black' : ''}`}>
            <div className={`w-7 h-7 flex items-center justify-center font-mono text-[9px] font-black border-2 border-black shrink-0 ${STATUS_BG[status]}`}>
              {status === 'complete' ? '✓' : status === 'active' ? '~' : status === 'failed' ? '!!' : '·'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold truncate">{OP_LABELS[step.operation] ?? step.operation}</span>
                <span className="font-mono text-[9px] text-[#999]">{step.amount}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <ChainIcon chainName={step.source_chain} size={14} />
                <span className="font-mono text-[9px] font-black">→</span>
                <ChainIcon chainName={step.destination_chain} size={14} />
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold text-[#999] shrink-0">{step.estimated_time_seconds}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
