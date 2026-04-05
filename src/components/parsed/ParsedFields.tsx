'use client';

import type { ParsedIntent, AmbiguityFlag } from '@/types/intent';
import { getChainConfig } from '@/config/chains';
import type { ChainBalance } from '@/services/balance';

interface ParsedFieldsProps {
  intent: ParsedIntent;
  ambiguities: AmbiguityFlag[];
  balances: ChainBalance[];
  onConfirm: () => void;
  onEdit: (intent: ParsedIntent) => void;
}

const ACTION_LABELS: Record<string, string> = {
  sweep: 'Sweep', consolidate: 'Consolidate', bridge: 'Bridge',
  move: 'Move', stake: 'Stake', collect: 'Collect', show_options: 'Show Options',
};

const ACTION_ICONS: Record<string, string> = {
  sweep: '↗', consolidate: '⊕', bridge: '⇄',
  move: '→', stake: '◎', collect: '◇', show_options: '?',
};

export function ParsedFields({ intent, ambiguities, balances, onConfirm }: ParsedFieldsProps) {
  const sourceChain = intent.source.chain_name ? getChainConfig(intent.source.chain_name) : null;
  const destChain = intent.destination.chain_name ? getChainConfig(intent.destination.chain_name) : null;

  const sourceName = sourceChain?.prettyName ?? (intent.source.qualifier === 'all' ? 'All Chains' : '???');
  const destName = destChain?.prettyName ?? '???';

  const sourceBalance = balances.find(b => b.chain.chainName === intent.source.chain_name);
  const destBalance = balances.find(b => b.chain.chainName === intent.destination.chain_name);
  const sweepAmount = intent.source.qualifier === 'all'
    ? balances.filter(b => b.chain.chainName !== 'initia_l1').reduce((sum, b) => sum + parseInt(b.totalInitAmount), 0)
    : parseInt(sourceBalance?.totalInitAmount ?? '0');
  const currentDestAmount = parseInt(destBalance?.totalInitAmount ?? '0');
  const sweepHuman = (sweepAmount / 1e6).toFixed(2);
  const afterDestHuman = ((currentDestAmount + sweepAmount) / 1e6).toFixed(2);

  const confidence = Math.round(intent.confidence * 100);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="font-mono text-sm font-black uppercase tracking-[3px]">★ Parsed Intent</h2>
        <div className="font-mono text-[8px] font-bold text-[#999] mt-1 uppercase tracking-wider">Confidence {confidence}%</div>
      </div>

      <div className="w-full px-4 py-3 border-[3px] border-black bg-[#CCFF00] font-mono text-xs font-bold shadow-[3px_3px_0_#000]">
        &ldquo;{intent.raw_input}&rdquo;
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Card 1: Chain */}
        <div className="border-[3px] border-black bg-white shadow-[4px_4px_0_#000]">
          <div className="px-4 py-2 border-b-[3px] border-black bg-[#f5f5f0]">
            <div className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">01 · Chain</div>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-mono text-[10px] font-black" style={{ backgroundColor: sourceChain?.color ?? '#e5e5e0' }}>
                {sourceName.charAt(0)}
              </div>
              <div>
                <div className="font-mono text-[8px] font-bold text-[#999] uppercase">From</div>
                <div className="font-mono text-[11px] font-black">{sourceName}</div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-black bg-[#CCFF00] flex items-center justify-center font-mono text-xs font-black">↓</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-mono text-[10px] font-black" style={{ backgroundColor: destChain?.color ?? '#e5e5e0' }}>
                {destName.charAt(0)}
              </div>
              <div>
                <div className="font-mono text-[8px] font-bold text-[#999] uppercase">To</div>
                <div className="font-mono text-[11px] font-black">{destName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Action */}
        <div className="border-[3px] border-black bg-white shadow-[4px_4px_0_#000]">
          <div className="px-4 py-2 border-b-[3px] border-black bg-[#f5f5f0]">
            <div className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">02 · Action</div>
          </div>
          <div className="px-4 py-4 flex flex-col items-center justify-center min-h-[140px]">
            <div className="w-14 h-14 border-[3px] border-black bg-[#CCFF00] flex items-center justify-center font-mono text-2xl font-black mb-3">
              {ACTION_ICONS[intent.action_type] ?? '?'}
            </div>
            <div className="font-mono text-lg font-black uppercase tracking-[2px]">
              {ACTION_LABELS[intent.action_type] ?? intent.action_type}
            </div>
            <div className="font-mono text-[9px] font-bold text-[#999] mt-1 uppercase">
              {intent.assets.map(a => a.symbol).join(', ')}
            </div>
            <div className="font-mono text-[8px] font-bold text-[#999] mt-2 uppercase tracking-wider">
              Fee: {intent.fee_preference}
            </div>
          </div>
        </div>

        {/* Card 3: Balance Change */}
        <div className="border-[3px] border-black bg-white shadow-[4px_4px_0_#000]">
          <div className="px-4 py-2 border-b-[3px] border-black bg-[#f5f5f0]">
            <div className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">03 · Balance</div>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div>
              <div className="font-mono text-[8px] font-black uppercase tracking-[2px] text-[#999] mb-1">Before</div>
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-[10px] font-bold text-[#999]">{sourceName}</span>
                <span className="font-mono text-sm font-black">{sweepHuman} INIT</span>
              </div>
              <div className="flex justify-between items-baseline mt-0.5">
                <span className="font-mono text-[10px] font-bold text-[#999]">{destName}</span>
                <span className="font-mono text-sm font-black">{(currentDestAmount / 1e6).toFixed(2)} INIT</span>
              </div>
            </div>
            <div className="h-0.5 bg-black w-full" />
            <div>
              <div className="font-mono text-[8px] font-black uppercase tracking-[2px] text-[#999] mb-1">After (est.)</div>
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-[10px] font-bold text-[#999]">{sourceName}</span>
                <span className="font-mono text-sm font-black text-[#999]">0.00 INIT</span>
              </div>
              <div className="flex justify-between items-baseline mt-0.5">
                <span className="font-mono text-[10px] font-bold text-[#FF5733]">{destName}</span>
                <span className="font-mono text-sm font-black text-[#FF5733]">{afterDestHuman} INIT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ambiguities.length > 0 && (
        <div className="w-full space-y-2">
          {ambiguities.map((flag, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 border-[3px] border-black bg-[#FEE440] font-mono text-[10px] font-bold shadow-[2px_2px_0_#000]">
              <span className="font-black">!!</span>
              <span><strong>{flag.field}</strong> — {flag.reason}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onConfirm}
        className="px-8 py-3 border-[3px] border-black bg-[#FF5733] text-white font-mono text-[11px] font-black uppercase tracking-[2px] shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
      >
        Generate Plans →
      </button>
    </div>
  );
}
