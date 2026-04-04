'use client';

import type { ExecutionStepStatus } from '@/types/flow';
import type { ExecutionPlan } from '@/types/plan';
import { ChainIcon } from '@/components/ui/ChainIcon';

interface ExecutionViewProps {
  plan: ExecutionPlan;
  steps: ExecutionStepStatus[];
}

const OP_LABELS: Record<string, string> = {
  ibc_transfer: 'IBC Transfer',
  op_bridge_deposit: 'OP Bridge Deposit',
  op_bridge_withdraw: 'OP Bridge Withdraw',
  minitswap: 'MinitSwap',
  transfer: 'Transfer',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-[#D4D4D4] bg-white text-[#999]',
  active: 'border-[#0D9488] bg-[#E0F5F3] text-[#0D9488]',
  complete: 'border-[#0A7A70] bg-[#0D9488] text-white',
  failed: 'border-[#DC2626] bg-[#FEE2E2] text-[#DC2626]',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '...',
  active: '~',
  complete: '✓',
  failed: '!!',
};

export function ExecutionView({ plan, steps }: ExecutionViewProps) {
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-lg font-semibold text-[#1A1A1A]">Executing: {plan.label}</h2>
        <p className="font-mono text-xs text-[#6B6B6B]">
          {completedCount}/{steps.length} steps completed
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-sm bg-[#E5E5E5] overflow-hidden border border-[#D4D4D4]">
        <div
          className="h-full bg-[#0D9488] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="w-full border-2 border-[#D4D4D4] rounded-md bg-white overflow-hidden">
        {steps.map(({ step, status }, i) => (
          <div
            key={step.step_index}
            className={`flex items-center gap-3 px-4 py-3 ${
              i < steps.length - 1 ? 'border-b border-[#F0F0F0]' : ''
            }`}
          >
            {/* Step indicator */}
            <div
              className={`w-6 h-6 rounded-[4px] flex items-center justify-center font-mono text-[10px] font-bold border-2 shrink-0 ${STATUS_STYLES[status]}`}
            >
              {STATUS_ICONS[status]}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-[#1A1A1A] truncate">
                  {OP_LABELS[step.operation] ?? step.operation}
                </span>
                <span className="font-mono text-[10px] text-[#999]">{step.amount}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <ChainIcon chainName={step.source_chain} size={16} />
                <span className="font-mono text-[10px] text-[#999]">→</span>
                <ChainIcon chainName={step.destination_chain} size={16} />
              </div>
            </div>

            {/* Time */}
            <span className="font-mono text-[10px] text-[#999] shrink-0">
              {step.estimated_time_seconds}s
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
