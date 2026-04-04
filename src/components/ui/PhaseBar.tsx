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
    <div className="flex border-[3px] border-black overflow-hidden shadow-[3px_3px_0_#000]">
      {PHASES.map((phase, i) => {
        const state = getPhaseState(phase.key, currentPhase);
        return (
          <div
            key={phase.key}
            className={`
              flex-1 text-center py-2 px-2
              font-mono text-[9px] font-black uppercase tracking-[2px]
              ${i < PHASES.length - 1 ? 'border-r-[2px] border-black' : ''}
              ${state === 'active' ? 'bg-[#CCFF00] text-black' : ''}
              ${state === 'done' ? 'bg-black text-[#CCFF00]' : ''}
              ${state === 'pending' ? 'bg-white text-[#ccc]' : ''}
            `}
          >
            {phase.label}
          </div>
        );
      })}
    </div>
  );
}
