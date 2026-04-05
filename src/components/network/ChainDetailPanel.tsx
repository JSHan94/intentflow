'use client';

import type { ChainConfig } from '@/config/chains';
import { getActions } from '@/config/chains';
import type { ChainBalance } from '@/services/balance';

interface ChainDetailPanelProps {
  chain: ChainConfig;
  balance: ChainBalance | null;
  onAction: (intent: string) => void;
  onClose: () => void;
}

export function ChainDetailPanel({ chain, balance, onAction, onClose }: ChainDetailPanelProps) {
  const actions = getActions(chain.chainName);
  const isL1 = chain.chainName === 'initia_l1';

  return (
    <div className="border-[3px] border-black bg-white shadow-[6px_6px_0_#000] w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-black" style={{ backgroundColor: chain.color }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border-2 border-black bg-white flex items-center justify-center font-mono text-[10px] font-black">
            {chain.prettyName.charAt(0)}
          </div>
          <div>
            <div className="font-mono text-[11px] font-black uppercase tracking-[2px]">{chain.prettyName}</div>
            <div className="font-mono text-[8px] font-bold opacity-70">{chain.vmType.toUpperCase()} · {chain.chainId}</div>
          </div>
        </div>
        <button onClick={onClose} className="w-6 h-6 border-2 border-black bg-white flex items-center justify-center font-mono text-[10px] font-black hover:bg-[#f5f5f0] transition-colors">
          ✕
        </button>
      </div>

      {/* Balance */}
      <div className="px-4 py-3 border-b-2 border-black bg-[#f5f5f0]">
        <div className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">Balance</div>
        <div className="font-mono text-lg font-black mt-1">{balance?.totalInitHuman ?? '0.00'} <span className="text-[#999] text-xs">INIT</span></div>
      </div>

      {/* Chain info */}
      <div className="px-4 py-3 border-b-2 border-black space-y-1.5">
        <div className="flex justify-between font-mono text-[9px]">
          <span className="font-bold text-[#999] uppercase">VM</span>
          <span className="font-black">{chain.vmType.toUpperCase()}</span>
        </div>
        {!isL1 && (
          <div className="flex justify-between font-mono text-[9px]">
            <span className="font-bold text-[#999] uppercase">IBC Channel</span>
            <span className="font-black">{chain.ibcChannelToL1}</span>
          </div>
        )}
        {!isL1 && (
          <div className="flex justify-between font-mono text-[9px]">
            <span className="font-bold text-[#999] uppercase">Bridge ID</span>
            <span className="font-black">{chain.bridgeId}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999] mb-3">★ Available Actions</div>
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.intent)}
              className="w-full flex items-center gap-3 px-3 py-2.5 border-[3px] border-black bg-white shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-left"
            >
              <div className="w-2 h-6 shrink-0" style={{ backgroundColor: action.color }} />
              <div className="flex-1">
                <div className="font-mono text-[10px] font-black uppercase tracking-wider">{action.label}</div>
                <div className="font-mono text-[8px] text-[#999] mt-0.5">{action.intent}</div>
              </div>
              <span className="font-mono text-[10px] font-black text-[#999]">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
