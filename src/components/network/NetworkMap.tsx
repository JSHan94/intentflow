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

const MAP_W = 500;
const MAP_H = 320;
const CX = MAP_W / 2;
const CY = MAP_H / 2;
const ORB_X = 170;
const ORB_Y = 100;

function nodePos(i: number, total: number) {
  const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
  return { x: CX + ORB_X * Math.cos(angle), y: CY + ORB_Y * Math.sin(angle) };
}

function nodeSize(balance: string, min = 22, max = 38): number {
  const amt = parseInt(balance || '0');
  if (amt <= 0) return min;
  return min + Math.min(Math.log10(amt / 1e6 + 1) / 2, 1) * (max - min);
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
  const l1Size = nodeSize(l1Bal?.totalInitAmount ?? '0', 32, 48);
  const minitias = TESTNET_MINITIAS;

  const hoveredConfig = hovered === 'initia_l1' ? INITIA_L1 : minitias.find(m => m.chainName === hovered);

  return (
    <div className="relative w-full flex justify-center">
      <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_#000]" style={{ width: MAP_W, height: MAP_H }}>
        <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="overflow-visible">
          {/* Lines */}
          {minitias.map((chain, i) => {
            const pos = nodePos(i, minitias.length);
            const hasBal = parseInt(balanceMap[chain.chainName]?.totalInitAmount ?? '0') > 0;
            return (
              <line key={`l-${chain.chainName}`} x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                stroke="#000" strokeWidth={hasBal ? 2 : 1} strokeDasharray={hasBal ? 'none' : '6,4'} opacity={hasBal ? 0.3 : 0.1} />
            );
          })}

          {/* L1 center */}
          <g className="cursor-pointer"
            onMouseEnter={() => { setHovered('initia_l1'); setPopupPos({ x: CX, y: CY - l1Size - 8 }); }}
            onMouseLeave={() => setHovered(null)}>
            <rect x={CX - l1Size} y={CY - l1Size} width={l1Size * 2} height={l1Size * 2} fill="#CCFF00" stroke="#000" strokeWidth="3" />
            <text x={CX} y={CY - 4} textAnchor="middle" fontSize="9" fontWeight="900" fill="#000" fontFamily="monospace" letterSpacing="2">INITIA L1</text>
            <text x={CX} y={CY + 10} textAnchor="middle" fontSize="12" fontWeight="900" fill="#000" fontFamily="monospace">
              {l1Bal?.totalInitHuman ?? '—'} INIT
            </text>
          </g>

          {/* Minitia nodes */}
          {minitias.map((chain, i) => {
            const pos = nodePos(i, minitias.length);
            const bal = balanceMap[chain.chainName];
            const hasBal = parseInt(bal?.totalInitAmount ?? '0') > 0;
            const ns = nodeSize(bal?.totalInitAmount ?? '0');
            return (
              <g key={chain.chainName} className="cursor-pointer" opacity={hasBal ? 1 : 0.35}
                onMouseEnter={() => { setHovered(chain.chainName); setPopupPos({ x: pos.x, y: pos.y - ns - 8 }); }}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onQuickAction('sweep', chain)}>
                <rect x={pos.x - ns} y={pos.y - ns} width={ns * 2} height={ns * 2} fill="white" stroke="#000" strokeWidth="2.5" />
                <text x={pos.x} y={pos.y - 3} textAnchor="middle" fontSize="8" fontWeight="900" fill="#000" fontFamily="monospace" letterSpacing="1">
                  {chain.prettyName.toUpperCase()}
                </text>
                <text x={pos.x} y={pos.y + 9} textAnchor="middle" fontSize="10" fontWeight="900" fill="#000" fontFamily="monospace">
                  {bal?.totalInitHuman ?? '—'}
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
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f0]/70">
            <div className="text-center space-y-2">
              <JennieIcon expression="neutral" size="lg" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#999]">Connect wallet to see balances</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
