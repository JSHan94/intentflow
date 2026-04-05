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
      style={{
        left: `${(position.x / 560) * 100}%`,
        top: `${(position.y / 380) * 100}%`,
        transform: 'translate(-50%, -100%) translateY(-8px)',
      }}
    >
      <div className="bg-white border-[3px] border-black p-3 shadow-[4px_4px_0_#000] min-w-[200px] max-w-[240px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-black">
          <div
            className="w-6 h-6 border-2 border-black flex items-center justify-center text-white font-mono text-[9px] font-black shrink-0"
            style={{ backgroundColor: chain.color }}
          >
            {chain.prettyName.charAt(0)}
          </div>
          <span className="font-mono text-[10px] font-black uppercase tracking-wider truncate">{chain.prettyName}</span>
          <span className="font-mono text-[8px] font-bold text-[#999] ml-auto uppercase shrink-0">{chain.vmType}</span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between font-mono text-[9px]">
            <span className="text-[#999] font-bold uppercase">Chain</span>
            <span className="font-black truncate ml-2">{chain.chainId}</span>
          </div>
          {!isL1 && chain.ibcChannelToL1 && (
            <div className="flex justify-between font-mono text-[9px]">
              <span className="text-[#999] font-bold uppercase">IBC</span>
              <span className="font-black">{chain.ibcChannelToL1}</span>
            </div>
          )}
          <div className="flex justify-between font-mono text-[9px]">
            <span className="text-[#999] font-bold uppercase">Balance</span>
            <span className="font-black text-[#FF5733]">{balance?.totalInitHuman ?? '0.00'} INIT</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAction(isL1 ? 'stake' : 'sweep', chain); }}
            className="flex-1 py-2 border-[3px] border-black bg-black text-[#CCFF00] font-mono text-[8px] font-black uppercase tracking-wider hover:bg-[#CCFF00] hover:text-black transition-colors"
          >
            {isL1 ? 'Stake' : 'Sweep → L1'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction('explorer', chain); }}
            className="py-2 px-3 border-[3px] border-black bg-white font-mono text-[9px] font-black hover:bg-[#f5f5f0] transition-colors"
          >
            ↗
          </button>
        </div>
      </div>
    </div>
  );
}
