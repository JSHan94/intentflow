'use client';

interface QuickActionsProps {
  onAction: (intent: string) => void;
}

const ACTIONS = [
  { label: 'Sweep All INIT to L1', intent: 'Sweep all my INIT into Initia L1', icon: '↗' },
  { label: 'Bridge Assets', intent: 'Bridge my assets to another rollup', icon: '⇄' },
  { label: 'Stake INIT', intent: 'Stake my INIT on Initia L1', icon: '◎' },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.intent)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border-[1.5px] border-[#D4D4D4] bg-white
            font-mono text-[10px] text-[#6B6B6B]
            hover:border-[#0D9488] hover:text-[#0D9488] hover:bg-[#E0F5F3] transition-colors"
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
