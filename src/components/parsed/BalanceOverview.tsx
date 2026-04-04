'use client';

import type { ChainBalance } from '@/services/balance';
import { ChainIcon } from '@/components/ui/ChainIcon';

interface BalanceOverviewProps {
  balances: ChainBalance[];
  isLoading: boolean;
}

export function BalanceOverview({ balances, isLoading }: BalanceOverviewProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 border-2 border-black bg-[#e5e5e0] animate-pulse" />
        ))}
      </div>
    );
  }

  const chainsWithBalance = balances.filter(b => parseInt(b.totalInitAmount) > 0);

  if (chainsWithBalance.length === 0) {
    return (
      <div className="text-center py-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#999]">
        No INIT found. Use faucet for testnet tokens.
      </div>
    );
  }

  const totalInit = chainsWithBalance.reduce((sum, b) => sum + parseInt(b.totalInitAmount), 0);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">★ Balances</span>
        <span className="font-mono text-xs font-black">{(totalInit / 1e6).toFixed(2)} INIT</span>
      </div>

      <div className="border-[3px] border-black bg-white shadow-[3px_3px_0_#000] overflow-hidden">
        {chainsWithBalance.map((cb, i) => (
          <div
            key={cb.chain.chainId}
            className={`flex items-center gap-3 px-3 py-2 ${i < chainsWithBalance.length - 1 ? 'border-b-2 border-black' : ''}`}
          >
            <ChainIcon chainName={cb.chain.chainName} size={22} />
            <span className="font-mono text-[10px] font-bold flex-1">{cb.chain.prettyName.toUpperCase()}</span>
            <span className="font-mono text-xs font-black">{cb.totalInitHuman} INIT</span>
          </div>
        ))}
      </div>
    </div>
  );
}
