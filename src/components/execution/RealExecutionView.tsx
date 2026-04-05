'use client';

import type { ExecutionStep } from '@/hooks/useRealExecution';
import { findChainByChainId } from '@/config/chains';
import { ChainIcon } from '@/components/ui/ChainIcon';
import { JennieIcon } from '@/components/ui/JennieIcon';

interface RealExecutionViewProps {
  steps: ExecutionStep[];
  phase: string;
  error: string | null;
}

const STATUS_BG: Record<string, string> = {
  pending: 'bg-white',
  active: 'bg-[#CCFF00]',
  complete: 'bg-black text-[#CCFF00]',
  failed: 'bg-[#FF5733] text-white',
};

export function RealExecutionView({ steps, phase, error }: RealExecutionViewProps) {
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <JennieIcon expression={phase === 'error' ? 'sad' : 'thinking'} size="md" />
        <h2 className="font-mono text-sm font-black uppercase tracking-[3px]">
          {phase === 'sweeping' && '★ Sweeping...'}
          {phase === 'bridging' && '★ Bridging...'}
          {phase === 'waiting_ibc' && '★ IBC Relay...'}
          {phase === 'staking' && '★ Staking...'}
          {phase === 'done' && '★ Done'}
          {phase === 'error' && '!! Failed'}
        </h2>
      </div>

      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between mb-1">
          <span className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">Progress</span>
          <span className="font-mono text-[10px] font-black">{completedCount}/{steps.length}</span>
        </div>
        <div className="h-3 bg-white border-[3px] border-black">
          <div className="h-full bg-[#CCFF00] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Steps */}
      <div className="w-full border-[3px] border-black bg-white shadow-[4px_4px_0_#000] overflow-hidden">
        {steps.map((step, i) => {
          const chain = findChainByChainId(step.chainId);
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${i < steps.length - 1 ? 'border-b-2 border-black' : ''}`}
            >
              <div className={`w-7 h-7 flex items-center justify-center font-mono text-[9px] font-black border-2 border-black shrink-0 ${STATUS_BG[step.status]}`}>
                {step.status === 'complete' ? '✓' : step.status === 'active' ? '~' : step.status === 'failed' ? '!!' : '·'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {chain && <ChainIcon chainName={chain.chainName} size={16} />}
                  <span className="font-mono text-[10px] font-bold truncate">{step.label}</span>
                </div>
                {step.txHash && (
                  <a
                    href={`${chain?.explorerUrl ?? 'https://scan.testnet.initia.xyz'}/txs/${step.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[9px] font-bold text-[#FF5733] hover:underline mt-0.5 inline-block"
                  >
                    {step.txHash.slice(0, 10)}...{step.txHash.slice(-6)} ↗
                  </a>
                )}
                {step.error && <p className="font-mono text-[9px] font-bold text-[#FF5733] mt-0.5">{step.error}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="w-full px-4 py-3 border-[3px] border-black bg-[#FF5733] text-white font-mono text-[10px] font-bold shadow-[3px_3px_0_#000]">
          {error}
        </div>
      )}
    </div>
  );
}
