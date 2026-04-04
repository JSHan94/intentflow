'use client';

interface QuickActionsProps {
  onAction: (intent: string) => void;
}

const ACTIONS = [
  { label: 'Sweep All', intent: 'Sweep all my INIT into Initia L1', color: '#CCFF00' },
  { label: 'Bridge', intent: 'Bridge my assets to another rollup', color: 'white' },
  { label: 'Stake', intent: 'Stake my INIT on Initia L1', color: 'white' },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.intent)}
          className="px-3 py-2 border-[3px] border-black font-mono text-[9px] font-black uppercase tracking-[2px] shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
          style={{ background: action.color }}
        >
          {action.label} →
        </button>
      ))}
    </div>
  );
}
