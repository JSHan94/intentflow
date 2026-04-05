'use client';

import { useInterwovenKit } from '@initia/interwovenkit-react';
import { JennieIcon } from '@/components/ui/JennieIcon';
import type { NetworkType } from '@/config/chains';

interface HeaderProps {
  onHistoryClick?: () => void;
  network: NetworkType;
  onNetworkToggle: () => void;
}

export function Header({ onHistoryClick, network, onNetworkToggle }: HeaderProps) {
  const { isConnected, address, openConnect, openWallet, disconnect } = useInterwovenKit();

  const truncated = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-[#f5f5f0] border-b-[3px] border-black">
      <div className="flex items-center gap-2">
        <JennieIcon expression="neutral" size="sm" />
        <span className="font-mono text-sm font-black uppercase tracking-[3px]">IntentFlow</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Network toggle */}
        <button
          onClick={onNetworkToggle}
          className={`px-3 py-1.5 border-[3px] border-black font-mono text-[8px] font-black uppercase tracking-[2px] shadow-[2px_2px_0_#000] transition-all ${
            network === 'mainnet'
              ? 'bg-[#CCFF00] text-black'
              : 'bg-white text-[#999]'
          }`}
        >
          {network === 'mainnet' ? '★ Mainnet' : 'Testnet'}
        </button>

        {onHistoryClick && (
          <button
            onClick={onHistoryClick}
            className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#999] hover:text-black transition-colors"
          >
            History
          </button>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2">
            <button
              onClick={openWallet}
              className="flex items-center gap-2 px-3 py-1.5 border-[3px] border-black bg-[#CCFF00] font-mono text-[10px] font-black uppercase shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <span className="w-2 h-2 bg-black" />
              {truncated}
            </button>
            <button
              onClick={disconnect}
              className="font-mono text-[9px] font-bold uppercase text-[#999] hover:text-[#FF5733] transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={openConnect}
            className="px-4 py-2 border-[3px] border-black bg-[#FF5733] text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            Connect
          </button>
        )}
      </div>
    </header>
  );
}
