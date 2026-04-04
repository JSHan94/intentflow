'use client';

import type { TestnetChain } from '@/config/testnet-chains';
import type { ChainBalance } from '@/services/balance';

interface ChainPopupProps {
  chain: TestnetChain;
  balance: ChainBalance | null;
  position: { x: number; y: number };
  onAction: (action: string, chain: TestnetChain) => void;
}

export function ChainPopup({ chain, balance, position, onAction }: ChainPopupProps) {
  const isL1 = chain.chainName === 'initia_l1';

  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -100%) translateY(-12px)' }}
    >
      <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-3 shadow-[3px_3px_0_rgba(0,0,0,0.08)] min-w-[200px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-5 h-5 rounded-[3px] flex items-center justify-center text-white font-mono text-[9px] font-bold"
            style={{ backgroundColor: chain.color }}
          >
            {chain.prettyName.charAt(0)}
          </div>
          <span className="font-mono text-xs font-semibold text-[#1A1A1A]">{chain.prettyName}</span>
          <span className="font-mono text-[9px] text-[#999] ml-auto">{chain.vmType.toUpperCase()}</span>
        </div>

        {/* Details */}
        <div className="space-y-1 mb-3 text-[10px] font-mono text-[#6B6B6B]">
          <div className="flex justify-between">
            <span>Chain ID</span>
            <span className="text-[#1A1A1A]">{chain.chainId}</span>
          </div>
          {!isL1 && (
            <div className="flex justify-between">
              <span>IBC Channel</span>
              <span className="text-[#1A1A1A]">{chain.ibcChannelToL1}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>INIT Balance</span>
            <span className="text-[#0D9488] font-semibold">{balance?.totalInitHuman ?? '0.00'} INIT</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1.5">
          {!isL1 && (
            <button
              onClick={() => onAction('sweep', chain)}
              className="flex-1 py-1.5 rounded-[4px] bg-[#0D9488] text-white font-mono text-[9px] font-semibold hover:bg-[#0A7A70] transition-colors"
            >
              Sweep to L1
            </button>
          )}
          {isL1 && (
            <button
              onClick={() => onAction('stake', chain)}
              className="flex-1 py-1.5 rounded-[4px] bg-[#0D9488] text-white font-mono text-[9px] font-semibold hover:bg-[#0A7A70] transition-colors"
            >
              Stake INIT
            </button>
          )}
          <button
            onClick={() => onAction('explorer', chain)}
            className="py-1.5 px-2 rounded-[4px] border border-[#D4D4D4] font-mono text-[9px] text-[#6B6B6B] hover:border-[#1A1A1A] transition-colors"
          >
            Explorer
          </button>
        </div>
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-[#1A1A1A] transform rotate-45 -mt-[7px]" />
      </div>
    </div>
  );
}
