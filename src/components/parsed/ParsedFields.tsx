'use client';

import type { ParsedIntent, AmbiguityFlag } from '@/types/intent';
import { Badge } from '@/components/ui/Badge';
import { getChainConfig } from '@/config/chains';

interface ParsedFieldsProps {
  intent: ParsedIntent;
  ambiguities: AmbiguityFlag[];
  onConfirm: () => void;
  onEdit: (intent: ParsedIntent) => void;
}

const ACTION_LABELS: Record<string, string> = {
  sweep: 'Sweep', consolidate: 'Consolidate', bridge: 'Bridge',
  move: 'Move', stake: 'Stake', collect: 'Collect', show_options: 'Show Options',
};

const FEE_LABELS: Record<string, string> = {
  cheapest: 'Min Fees', fastest: 'Max Speed', balanced: 'Balanced', any: 'Any',
};

function ParsedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3 border-[3px] border-black bg-white shadow-[3px_3px_0_#000]">
      <div className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">{label}</div>
      <div className="font-mono text-sm font-black text-black mt-1">{value}</div>
    </div>
  );
}

export function ParsedFields({ intent, ambiguities, onConfirm }: ParsedFieldsProps) {
  const sourceName = intent.source.chain_name
    ? getChainConfig(intent.source.chain_name)?.prettyName ?? intent.source.chain_name
    : intent.source.qualifier === 'all' ? 'All Chains' : '???';

  const destName = intent.destination.chain_name
    ? getChainConfig(intent.destination.chain_name)?.prettyName ?? intent.destination.chain_name
    : '???';

  const confidence = Math.round(intent.confidence * 100);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      <h2 className="font-mono text-sm font-black uppercase tracking-[3px]">★ Parsed Intent</h2>

      {/* Raw intent */}
      <div className="w-full px-4 py-3 border-[3px] border-black bg-[#CCFF00] font-mono text-xs font-bold shadow-[3px_3px_0_#000]">
        &ldquo;{intent.raw_input}&rdquo;
      </div>

      {/* Confidence */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">Confidence</span>
          <span className="font-mono text-xs font-black">{confidence}%</span>
        </div>
        <div className="h-3 bg-white border-[3px] border-black">
          <div className="h-full bg-[#CCFF00] transition-[width] duration-300" style={{ width: `${confidence}%` }} />
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <ParsedField label="Action" value={ACTION_LABELS[intent.action_type] ?? intent.action_type} />
        <ParsedField label="Assets" value={intent.assets.map(a => a.symbol).join(', ')} />
        <ParsedField label="Source" value={sourceName} />
        <ParsedField label="Destination" value={destName} />
        <ParsedField label="Fee Strategy" value={FEE_LABELS[intent.fee_preference] ?? intent.fee_preference} />
        {intent.exclusions.length > 0 && (
          <ParsedField label="Exclusions" value={intent.exclusions.map(e => e.value).join(', ')} />
        )}
      </div>

      {/* Ambiguities */}
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
