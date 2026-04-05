'use client';

import { useState, useMemo } from 'react';
import type { TestnetChain } from '@/config/testnet-chains';
import { INITIA_L1, TESTNET_MINITIAS } from '@/config/testnet-chains';
import type { ChainBalance } from '@/services/balance';
import { JennieIcon } from '@/components/ui/JennieIcon';
import { ChainPopup } from './ChainPopup';

interface NetworkMapProps {
  balances: ChainBalance[];
  isConnected: boolean;
  onQuickAction: (action: string, chain: TestnetChain) => void;
}

const MAP_W = 560;
const MAP_H = 380;
const CX = MAP_W / 2;
const CY = MAP_H / 2;
const ORB_X = 190;
const ORB_Y = 130;

function nodePos(i: number, total: number) {
  const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
  return { x: CX + ORB_X * Math.cos(angle), y: CY + ORB_Y * Math.sin(angle) };
}

export function NetworkMap({ balances, isConnected, onQuickAction }: NetworkMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  const balanceMap = useMemo(() => {
    const m: Record<string, ChainBalance> = {};
    for (const b of balances) m[b.chain.chainName] = b;
    return m;
  }, [balances]);

  const l1Bal = balanceMap['initia_l1'];
  const minitias = TESTNET_MINITIAS;
  const hoveredConfig = hovered === 'initia_l1' ? INITIA_L1 : minitias.find(m => m.chainName === hovered);

  // Fixed sizes — no dynamic scaling to prevent overflow
  const L1_SIZE = 50;
  const MINI_SIZE = 36;

  return (
    <div className="relative w-full flex justify-center overflow-hidden">
      <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_#000] w-full max-w-[580px]" style={{ aspectRatio: `${MAP_W}/${MAP_H}` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid meet">
          {/* Connection lines */}
          {minitias.map((chain, i) => {
            const pos = nodePos(i, minitias.length);
            const hasBal = parseInt(balanceMap[chain.chainName]?.totalInitAmount ?? '0') > 0;
            return (
              <line key={`l-${chain.chainName}`}
                x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                stroke="#000" strokeWidth={hasBal ? 2 : 1}
                strokeDasharray={hasBal ? 'none' : '8,5'}
                opacity={hasBal ? 0.25 : 0.08}
              />
            );
          })}

          {/* L1 center node */}
          <g className="cursor-pointer"
            onMouseEnter={() => { setHovered('initia_l1'); setPopupPos({ x: CX, y: CY - L1_SIZE - 12 }); }}
            onMouseLeave={() => setHovered(null)}>
            <rect x={CX - L1_SIZE} y={CY - L1_SIZE} width={L1_SIZE * 2} height={L1_SIZE * 2}
              fill="#CCFF00" stroke="#000" strokeWidth="3" />
            <text x={CX} y={CY - 8} textAnchor="middle"
              fontSize="10" fontWeight="900" fill="#000" fontFamily="monospace" letterSpacing="2">
              INITIA L1
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle"
              fontSize="13" fontWeight="900" fill="#000" fontFamily="monospace">
              {l1Bal?.totalInitHuman ?? '—'}
            </text>
            <text x={CX} y={CY + 22} textAnchor="middle"
              fontSize="9" fontWeight="700" fill="#666" fontFamily="monospace">
              INIT
            </text>
          </g>

          {/* Minitia nodes */}
          {minitias.map((chain, i) => {
            const pos = nodePos(i, minitias.length);
            const bal = balanceMap[chain.chainName];
            const hasBal = parseInt(bal?.totalInitAmount ?? '0') > 0;

            return (
              <g key={chain.chainName} className="cursor-pointer"
                opacity={hasBal ? 1 : 0.3}
                onMouseEnter={() => { setHovered(chain.chainName); setPopupPos({ x: pos.x, y: pos.y - MINI_SIZE - 12 }); }}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onQuickAction('sweep', chain)}>
                <rect x={pos.x - MINI_SIZE} y={pos.y - MINI_SIZE}
                  width={MINI_SIZE * 2} height={MINI_SIZE * 2}
                  fill="white" stroke="#000" strokeWidth="2.5" />
                <text x={pos.x} y={pos.y - 6} textAnchor="middle"
                  fontSize="9" fontWeight="900" fill="#000" fontFamily="monospace" letterSpacing="1">
                  {chain.prettyName.toUpperCase()}
                </text>
                <text x={pos.x} y={pos.y + 8} textAnchor="middle"
                  fontSize="11" fontWeight="900" fill="#000" fontFamily="monospace">
                  {bal?.totalInitHuman ?? '—'}
                </text>
                <text x={pos.x} y={pos.y + 20} textAnchor="middle"
                  fontSize="8" fontWeight="700" fill="#999" fontFamily="monospace">
                  INIT
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover popup */}
        {hovered && hoveredConfig && (
          <ChainPopup chain={hoveredConfig} balance={balanceMap[hovered] ?? null} position={popupPos} onAction={onQuickAction} />
        )}

        {/* Not connected overlay */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f0]/75">
            <div className="border-[3px] border-black bg-white px-5 py-4 shadow-[4px_4px_0_#000] flex items-center gap-3">
              <JennieIcon expression="neutral" size="md" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-[#999]">
                Connect wallet<br />to see balances
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
