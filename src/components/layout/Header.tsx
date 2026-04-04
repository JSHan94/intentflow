'use client';

import { useInterwovenKit } from '@initia/interwovenkit-react';

export function Header({ onHistoryClick }: { onHistoryClick?: () => void }) {
  const { isConnected, address, openConnect, openWallet, disconnect } = useInterwovenKit();

  const truncatedAddress = address
    ? `${address.slice(0, 8)}...${address.slice(-4)}`
    : '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b-2 border-[#1A1A1A]">
      <div className="flex items-center gap-3">
        <span className="font-heading text-lg font-bold tracking-tight text-[#1A1A1A]">IntentFlow</span>
        <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-md border-[1.5px] border-[#D4D4D4] text-[#999]">
          testnet
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onHistoryClick && (
          <button
            onClick={onHistoryClick}
            className="font-mono text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            History
          </button>
        )}

        {isConnected ? (
          <div className="flex items-center gap-3">
            <button
              onClick={openWallet}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-[#D4D4D4] bg-white font-mono text-xs hover:border-[#1A1A1A] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
              <span>{truncatedAddress}</span>
            </button>
            <button
              onClick={disconnect}
              className="font-mono text-[10px] text-[#999] hover:text-[#DC2626] transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={openConnect}
            className="px-4 py-1.5 rounded-md bg-[#0D9488] text-white font-mono text-xs font-semibold border-2 border-[#0A7A70] hover:bg-[#0A7A70] transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
