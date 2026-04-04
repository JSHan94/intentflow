'use client';

import type { FlowPhase } from '@/types/flow';

interface PhaseBarProps {
  currentPhase: FlowPhase;
}

const PHASES: { key: FlowPhase; label: string }[] = [
  { key: 'input', label: 'Input' },
  { key: 'parsing', label: 'Parse' },
  { key: 'parsed', label: 'Review' },
  { key: 'planning', label: 'Plan' },
  { key: 'executing', label: 'Execute' },
  { key: 'result', label: 'Result' },
];

const PHASE_ORDER: FlowPhase[] = ['input', 'parsing', 'parsed', 'planning', 'executing', 'result'];

function getPhaseState(phase: FlowPhase, currentPhase: FlowPhase): 'done' | 'active' | 'pending' {
  const currentIdx = PHASE_ORDER.indexOf(currentPhase);
  const phaseIdx = PHASE_ORDER.indexOf(phase);
  if (phaseIdx < currentIdx) return 'done';
  if (phaseIdx === currentIdx) return 'active';
  return 'pending';
}

export function PhaseBar({ currentPhase }: PhaseBarProps) {
  return (
    <div className="flex border-2 border-[#1A1A1A] rounded-md overflow-hidden">
      {PHASES.map((phase, i) => {
        const state = getPhaseState(phase.key, currentPhase);
        return (
          <div
            key={phase.key}
            className={`
              flex-1 text-center py-2 px-3
              font-mono text-[10px] font-semibold uppercase tracking-wider
              ${i < PHASES.length - 1 ? 'border-r-[1.5px] border-[#D4D4D4]' : ''}
              ${state === 'active' ? 'bg-[#0D9488] text-white' : ''}
              ${state === 'done' ? 'bg-[#E0F5F3] text-[#0D9488]' : ''}
              ${state === 'pending' ? 'bg-white text-[#999]' : ''}
            `}
          >
            {phase.label}
          </div>
        );
      })}
    </div>
  );
}
