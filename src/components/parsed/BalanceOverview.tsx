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
          <div key={i} className="h-12 rounded-md bg-[#F0F0F0] animate-pulse" />
        ))}
      </div>
    );
  }

  const chainsWithBalance = balances.filter(b => parseInt(b.totalInitAmount) > 0);

  if (chainsWithBalance.length === 0) {
    return (
      <div className="text-center py-6 font-mono text-xs text-[#999]">
        No INIT balances found across chains. Use the faucet to get testnet tokens.
      </div>
    );
  }

  const totalInit = chainsWithBalance.reduce(
    (sum, b) => sum + parseInt(b.totalInitAmount),
    0
  );

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#6B6B6B]">Your INIT across chains</span>
        <span className="font-mono font-semibold text-[#1A1A1A]">
          {(totalInit / 1e6).toFixed(2)} INIT
        </span>
      </div>

      {chainsWithBalance.map((cb) => (
        <div
          key={cb.chain.chainId}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md border-[1.5px] border-[#D4D4D4] bg-white"
        >
          <ChainIcon chainName={cb.chain.chainName} size={24} />
          <div className="flex-1">
            <span className="text-sm font-medium text-[#1A1A1A]">{cb.chain.prettyName}</span>
            <span className="font-mono text-[10px] text-[#999] ml-2">{cb.chain.chainId}</span>
          </div>
          <span className="font-mono text-sm font-semibold text-[#1A1A1A]">
            {cb.totalInitHuman} INIT
          </span>
        </div>
      ))}
    </div>
  );
}
