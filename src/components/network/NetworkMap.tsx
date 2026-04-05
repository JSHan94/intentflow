'use client';

import { useState, useMemo } from 'react';
import type { ChainConfig, NetworkType } from '@/config/chains';
import { getL1, getRollups } from '@/config/chains';
import type { ChainBalance } from '@/services/balance';
import { JennieIcon } from '@/components/ui/JennieIcon';

interface NetworkMapProps {
  balances: ChainBalance[];
  isConnected: boolean;
  network: NetworkType;
  selectedChain: string | null;
  onChainSelect: (chainName: string | null) => void;
  onQuickAction: (action: string, chain: ChainConfig) => void;
}

const MAP_W = 440;
const MAP_H = 340;
const CX = MAP_W / 2;
const CY = MAP_H / 2;
const ORB_X = 155;
const ORB_Y = 115;

function nodePos(i: number, total: number) {
  const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
  return { x: CX + ORB_X * Math.cos(angle), y: CY + ORB_Y * Math.sin(angle) };
}

export function NetworkMap({ balances, isConnected, network, selectedChain, onChainSelect, onQuickAction }: NetworkMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const l1 = getL1(network);
  const rollups = getRollups(network);

  const balanceMap = useMemo(() => {
    const m: Record<string, ChainBalance> = {};
    for (const b of balances) m[b.chain.chainName] = b;
    return m;
  }, [balances]);

  const l1Bal = balanceMap['initia_l1'];
  const L1_SIZE = 44;
  const MINI_SIZE = 32;

  return (
    <div className="relative w-full flex justify-center overflow-visible">
      <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_#000] w-full" style={{ maxWidth: MAP_W, aspectRatio: `${MAP_W}/${MAP_H}` }}>
        <svg
          width="100%" height="100%"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
          onClick={() => onChainSelect(null)}
        >
          {/* Connection lines */}
          {rollups.map((chain, i) => {
            const pos = nodePos(i, rollups.length);
            const hasBal = parseInt(balanceMap[chain.chainName]?.totalInitAmount ?? '0') > 0;
            const dimmed = selectedChain !== null && selectedChain !== chain.chainName && selectedChain !== 'initia_l1';
            return (
              <line key={`l-${chain.chainName}`}
                x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                stroke="#000" strokeWidth={hasBal ? 2 : 1}
                strokeDasharray={hasBal ? 'none' : '8,5'}
                opacity={dimmed ? 0.05 : hasBal ? 0.25 : 0.08}
              />
            );
          })}

          {/* L1 center node */}
          <g
            className="cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onChainSelect(selectedChain === 'initia_l1' ? null : 'initia_l1'); }}
            opacity={selectedChain && selectedChain !== 'initia_l1' ? 0.3 : 1}
          >
            <rect x={CX - L1_SIZE} y={CY - L1_SIZE} width={L1_SIZE * 2} height={L1_SIZE * 2}
              fill={selectedChain === 'initia_l1' ? '#CCFF00' : '#CCFF00'} stroke="#000" strokeWidth={selectedChain === 'initia_l1' ? 4 : 3} />
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize="9" fontWeight="900" fill="#000" fontFamily="monospace" letterSpacing="2">
              INITIA L1
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle" fontSize="12" fontWeight="900" fill="#000" fontFamily="monospace">
              {l1Bal?.totalInitHuman ?? '—'}
            </text>
            <text x={CX} y={CY + 20} textAnchor="middle" fontSize="8" fontWeight="700" fill="#666" fontFamily="monospace">
              INIT
            </text>
          </g>

          {/* Rollup nodes */}
          {rollups.map((chain, i) => {
            const pos = nodePos(i, rollups.length);
            const bal = balanceMap[chain.chainName];
            const hasBal = parseInt(bal?.totalInitAmount ?? '0') > 0;
            const isSelected = selectedChain === chain.chainName;
            const dimmed = selectedChain !== null && !isSelected;

            return (
              <g key={chain.chainName}
                className="cursor-pointer"
                opacity={dimmed ? 0.15 : hasBal ? 1 : 0.3}
                onClick={(e) => { e.stopPropagation(); onChainSelect(isSelected ? null : chain.chainName); }}
              >
                <rect x={pos.x - MINI_SIZE} y={pos.y - MINI_SIZE}
                  width={MINI_SIZE * 2} height={MINI_SIZE * 2}
                  fill={isSelected ? chain.color : 'white'}
                  stroke="#000" strokeWidth={isSelected ? 4 : 2.5}
                />
                <text x={pos.x} y={pos.y - 4} textAnchor="middle"
                  fontSize="8" fontWeight="900" fill="#000" fontFamily="monospace" letterSpacing="1">
                  {chain.prettyName.toUpperCase()}
                </text>
                <text x={pos.x} y={pos.y + 8} textAnchor="middle"
                  fontSize="10" fontWeight="900" fill="#000" fontFamily="monospace">
                  {bal?.totalInitHuman ?? '—'}
                </text>
                <text x={pos.x} y={pos.y + 19} textAnchor="middle"
                  fontSize="7" fontWeight="700" fill="#999" fontFamily="monospace">
                  {chain.vmType.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Not connected overlay */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f0]/75 z-10">
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
