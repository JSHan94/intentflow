'use client';

import type { ParsedIntent, AmbiguityFlag } from '@/types/intent';
import { Badge } from '@/components/ui/Badge';
import { getChain } from '@/data/mock-chains';

interface ParsedFieldsProps {
  intent: ParsedIntent;
  ambiguities: AmbiguityFlag[];
  onConfirm: () => void;
  onEdit: (intent: ParsedIntent) => void;
}

const ACTION_LABELS: Record<string, string> = {
  sweep: 'Sweep',
  consolidate: 'Consolidate',
  bridge: 'Bridge',
  move: 'Move',
  collect: 'Collect',
  show_options: 'Show Options',
};

const FEE_LABELS: Record<string, string> = {
  cheapest: 'Minimize Fees',
  fastest: 'Maximize Speed',
  balanced: 'Balanced',
  any: 'No Preference',
};

function ParsedField({ label, value, status }: { label: string; value: string; status: 'high' | 'inferred' | 'low' }) {
  const statusColor = status === 'high' ? 'success' : status === 'inferred' ? 'warning' : 'error';
  const statusLabel = status === 'high' ? 'High' : status === 'inferred' ? 'Inferred' : 'Low';

  return (
    <div className="flex items-center justify-between px-3 py-3 rounded-md border-[1.5px] border-[#D4D4D4] bg-white">
      <div>
        <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#999]">{label}</div>
        <div className="font-mono text-sm font-semibold text-[#1A1A1A] mt-0.5">{value}</div>
      </div>
      <Badge label={statusLabel} color={statusColor} />
    </div>
  );
}

export function ParsedFields({ intent, ambiguities, onConfirm }: ParsedFieldsProps) {
  const sourceName = intent.source.chain_name
    ? getChain(intent.source.chain_name)?.pretty_name ?? intent.source.chain_name
    : intent.source.qualifier === 'all' ? 'All Chains' : 'Unspecified';

  const destName = intent.destination.chain_name
    ? getChain(intent.destination.chain_name)?.pretty_name ?? intent.destination.chain_name
    : 'Unspecified';

  const assetsLabel = intent.assets.map(a => a.symbol).join(', ');
  const confidence = Math.round(intent.confidence * 100);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-lg font-semibold text-[#1A1A1A]">Parsed Intent</h2>
        <p className="text-sm text-[#6B6B6B]">Review and confirm the extracted fields</p>
      </div>

      {/* Raw intent */}
      <div className="w-full px-4 py-3 rounded-md border-[1.5px] border-[#D4D4D4] bg-[#F5F5F5] font-mono text-sm text-[#6B6B6B] italic">
        &ldquo;{intent.raw_input}&rdquo;
      </div>

      {/* Confidence */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-[#999] uppercase tracking-wider">Confidence</span>
          <span className="font-mono text-xs font-semibold text-[#0D9488]">{confidence}%</span>
        </div>
        <div className="h-1 rounded-sm bg-[#E5E5E5] overflow-hidden">
          <div
            className="h-full bg-[#0D9488] transition-[width] duration-300"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        <ParsedField label="Action" value={ACTION_LABELS[intent.action_type] ?? intent.action_type} status="high" />
        <ParsedField label="Assets" value={assetsLabel} status="high" />
        <ParsedField label="Source" value={sourceName} status={intent.source.chain_name ? 'high' : 'inferred'} />
        <ParsedField label="Destination" value={destName} status="high" />
        <ParsedField label="Fee Strategy" value={FEE_LABELS[intent.fee_preference] ?? intent.fee_preference} status="high" />
        {intent.exclusions.length > 0 && (
          <ParsedField label="Exclusions" value={intent.exclusions.map(e => e.value).join(', ')} status="high" />
        )}
      </div>

      {/* Ambiguities */}
      {ambiguities.length > 0 && (
        <div className="w-full space-y-2">
          {ambiguities.map((flag, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-md bg-[#FEF3C7] border border-[#FDE68A] text-sm">
              <span className="text-[#D97706] font-bold mt-0.5">!</span>
              <div>
                <span className="text-[#D97706] font-mono font-semibold text-xs">{flag.field}</span>
                <span className="text-[#6B6B6B] ml-1 text-xs">{flag.reason}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={onConfirm}
        className="px-6 py-2.5 rounded-md bg-[#0D9488] text-white font-mono text-xs font-semibold
          border-2 border-[#0A7A70] hover:bg-[#0A7A70] transition-colors"
      >
        Generate Execution Plans
      </button>
    </div>
  );
}
