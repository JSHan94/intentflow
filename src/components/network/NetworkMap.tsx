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

const MAP_WIDTH = 500;
const MAP_HEIGHT = 340;
const CENTER_X = MAP_WIDTH / 2;
const CENTER_Y = MAP_HEIGHT / 2;
const ORBIT_RX = 170;
const ORBIT_RY = 110;

function getNodePosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER_X + ORBIT_RX * Math.cos(angle),
    y: CENTER_Y + ORBIT_RY * Math.sin(angle),
  };
}

function getNodeSize(balance: string, min = 22, max = 38): number {
  const amt = parseInt(balance || '0');
  if (amt <= 0) return min;
  const scale = Math.min(Math.log10(amt / 1e6 + 1) / 2, 1);
  return min + scale * (max - min);
}

export function NetworkMap({ balances, isConnected, onQuickAction }: NetworkMapProps) {
  const [hoveredChain, setHoveredChain] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const balanceMap = useMemo(() => {
    const map: Record<string, ChainBalance> = {};
    for (const b of balances) map[b.chain.chainName] = b;
    return map;
  }, [balances]);

  const l1Balance = balanceMap['initia_l1'];
  const l1Size = getNodeSize(l1Balance?.totalInitAmount ?? '0', 32, 48);

  const minitias = TESTNET_MINITIAS;

  const handleNodeHover = (chainName: string, x: number, y: number) => {
    setHoveredChain(chainName);
    setPopupPos({ x, y });
  };

  const hoveredChainConfig = hoveredChain
    ? (hoveredChain === 'initia_l1' ? INITIA_L1 : minitias.find(m => m.chainName === hoveredChain))
    : null;

  return (
    <div className="relative w-full flex justify-center">
      <div className="relative" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
        <svg
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="overflow-visible"
        >
          {/* Connection lines from each minitia to L1 */}
          {minitias.map((chain, i) => {
            const pos = getNodePosition(i, minitias.length);
            const bal = balanceMap[chain.chainName];
            const hasBalance = parseInt(bal?.totalInitAmount ?? '0') > 0;

            return (
              <line
                key={`line-${chain.chainName}`}
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={pos.x}
                y2={pos.y}
                stroke={chain.color}
                strokeWidth={hasBalance ? 1.5 : 1}
                strokeDasharray={hasBalance ? 'none' : '4,4'}
                opacity={hasBalance ? 0.5 : 0.2}
              />
            );
          })}

          {/* L1 center node */}
          <g
            className="cursor-pointer"
            onMouseEnter={(e) => {
              const rect = (e.target as SVGElement).closest('svg')!.getBoundingClientRect();
              handleNodeHover('initia_l1', CENTER_X, CENTER_Y - l1Size - 8);
            }}
            onMouseLeave={() => setHoveredChain(null)}
            onClick={() => onQuickAction('stake', INITIA_L1)}
          >
            <circle cx={CENTER_X} cy={CENTER_Y} r={l1Size + 8} fill={INITIA_L1.color} opacity="0.08" />
            <circle cx={CENTER_X} cy={CENTER_Y} r={l1Size} fill={INITIA_L1.color} opacity="0.15" stroke={INITIA_L1.color} strokeWidth="2" />
            <text x={CENTER_X} y={CENTER_Y - 6} textAnchor="middle" fontSize="9" fontWeight="600" fill={INITIA_L1.color} fontFamily="var(--font-code), monospace">
              Initia L1
            </text>
            <text x={CENTER_X} y={CENTER_Y + 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1A1A1A" fontFamily="var(--font-code), monospace">
              {l1Balance?.totalInitHuman ?? '—'} INIT
            </text>
          </g>

          {/* Minitia nodes */}
          {minitias.map((chain, i) => {
            const pos = getNodePosition(i, minitias.length);
            const bal = balanceMap[chain.chainName];
            const hasBalance = parseInt(bal?.totalInitAmount ?? '0') > 0;
            const nodeSize = getNodeSize(bal?.totalInitAmount ?? '0');

            return (
              <g
                key={chain.chainName}
                className="cursor-pointer"
                onMouseEnter={() => handleNodeHover(chain.chainName, pos.x, pos.y - nodeSize - 8)}
                onMouseLeave={() => setHoveredChain(null)}
                onClick={() => onQuickAction('sweep', chain)}
                opacity={hasBalance ? 1 : 0.4}
              >
                <circle cx={pos.x} cy={pos.y} r={nodeSize} fill={chain.color} opacity="0.12" stroke={chain.color} strokeWidth="1.5" />
                <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize="8" fontWeight="600" fill={chain.color} fontFamily="var(--font-code), monospace">
                  {chain.prettyName}
                </text>
                <text x={pos.x} y={pos.y + 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1A1A1A" fontFamily="var(--font-code), monospace">
                  {bal?.totalInitHuman ?? '—'}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Jennie in center background */}
        <div
          className="absolute pointer-events-none"
          style={{ left: CENTER_X - 12, top: CENTER_Y - 42, opacity: 0.25 }}
        >
          <JennieIcon expression="neutral" size="sm" />
        </div>

        {/* Hover popup */}
        {hoveredChain && hoveredChainConfig && (
          <ChainPopup
            chain={hoveredChainConfig}
            balance={balanceMap[hoveredChain] ?? null}
            position={popupPos}
            onAction={onQuickAction}
          />
        )}
      </div>

      {/* Not connected overlay */}
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FAFAF8]/60 backdrop-blur-[2px] rounded-md">
          <div className="text-center space-y-2">
            <JennieIcon expression="neutral" size="lg" />
            <p className="font-mono text-xs text-[#999]">Connect wallet to see your balances</p>
          </div>
        </div>
      )}
    </div>
  );
}
