'use client';

import type { RollupAction } from '@/config/chains';

interface ActionNodesProps {
  actions: RollupAction[];
  parentX: number;
  parentY: number;
  parentSize: number;
  onSelect: (intent: string) => void;
}

const ACTION_SPREAD = 70;
const NODE_W = 68;
const NODE_H = 28;

export function ActionNodes({ actions, parentX, parentY, parentSize, onSelect }: ActionNodesProps) {
  return (
    <g>
      {actions.map((action, i) => {
        // Spread actions in a fan around the parent
        const baseAngle = -Math.PI / 2; // start from top
        const spreadAngle = (Math.PI * 0.8); // 144 degrees spread
        const angle = baseAngle + ((i - (actions.length - 1) / 2) / Math.max(actions.length - 1, 1)) * spreadAngle;
        const dist = parentSize + ACTION_SPREAD;
        const ax = parentX + dist * Math.cos(angle);
        const ay = parentY + dist * Math.sin(angle);

        return (
          <g key={action.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect(action.intent); }}>
            {/* Connection line */}
            <line
              x1={parentX} y1={parentY}
              x2={ax} y2={ay}
              stroke={action.color} strokeWidth="2"
            />

            {/* Action node */}
            <rect
              x={ax - NODE_W / 2} y={ay - NODE_H / 2}
              width={NODE_W} height={NODE_H}
              fill="white" stroke="#000" strokeWidth="2.5"
            />
            {/* Color accent bar */}
            <rect
              x={ax - NODE_W / 2} y={ay - NODE_H / 2}
              width={NODE_W} height={4}
              fill={action.color} stroke="#000" strokeWidth="0"
            />
            {/* Label */}
            <text
              x={ax} y={ay + 3}
              textAnchor="middle"
              fontSize="7" fontWeight="900" fill="#000"
              fontFamily="monospace" letterSpacing="0.5"
            >
              {action.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </g>
  );
}
