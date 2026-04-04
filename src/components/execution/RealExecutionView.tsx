'use client';

import type { ExecutionStep } from '@/hooks/useRealExecution';
import { getTestnetChain } from '@/config/testnet-chains';
import { ChainIcon } from '@/components/ui/ChainIcon';

interface RealExecutionViewProps {
  steps: ExecutionStep[];
  phase: string;
  error: string | null;
}

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

export function RealExecutionView({ steps, phase, error }: RealExecutionViewProps) {
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-lg font-semibold text-[#1A1A1A]">
          {phase === 'sweeping' && 'Executing IBC Transfers...'}
          {phase === 'waiting_ibc' && 'Waiting for IBC Settlement...'}
          {phase === 'staking' && 'Staking on Initia L1...'}
          {phase === 'done' && 'Execution Complete'}
          {phase === 'error' && 'Execution Failed'}
        </h2>
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
        {steps.map((step, i) => {
          const chain = getTestnetChain(step.chainId);

          return (
            <div
              key={i}
              className={`
                flex items-center gap-3 px-4 py-3
                ${i < steps.length - 1 ? 'border-b border-[#F0F0F0]' : ''}
              `}
            >
              {/* Step indicator */}
              <div
                className={`w-6 h-6 rounded-[4px] flex items-center justify-center font-mono text-[10px] font-bold border-2 shrink-0 ${STATUS_STYLES[step.status]}`}
              >
                {STATUS_ICONS[step.status]}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {chain && <ChainIcon chainName={chain.chainName} size={18} />}
                  <span className="font-mono text-xs font-medium text-[#1A1A1A] truncate">{step.label}</span>
                </div>
                {step.txHash && (
                  <a
                    href={`${chain?.explorerUrl ?? 'https://scan.testnet.initia.xyz'}/txs/${step.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-[#0D9488] hover:underline mt-0.5 inline-block"
                  >
                    {step.txHash.slice(0, 12)}...{step.txHash.slice(-6)}
                  </a>
                )}
                {step.error && (
                  <p className="font-mono text-[10px] text-[#DC2626] mt-0.5">{step.error}</p>
                )}
              </div>

              {/* Status pill */}
              <span className={`font-mono text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
                step.status === 'complete' ? 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]' :
                step.status === 'active' ? 'bg-[#E0F5F3] text-[#0D9488] border-[#99D5CF]' :
                step.status === 'failed' ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]' :
                'bg-[#F5F5F5] text-[#999] border-[#E5E5E5]'
              }`}>
                {step.status === 'complete' ? 'Done' :
                 step.status === 'active' ? 'Running' :
                 step.status === 'failed' ? 'Failed' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="w-full px-3 py-2.5 rounded-md bg-[#FEE2E2] border border-[#FECACA] font-mono text-xs text-[#DC2626]">
          {error}
        </div>
      )}

      {/* IBC waiting */}
      {phase === 'waiting_ibc' && (
        <div className="flex items-center gap-2 font-mono text-xs text-[#999]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
          Waiting for IBC packets to be relayed...
        </div>
      )}
    </div>
  );
}
