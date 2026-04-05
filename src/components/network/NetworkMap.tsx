'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ChainConfig, NetworkType } from '@/config/chains';
import { getL1, getRollups, getActions } from '@/config/chains';
import type { ChainBalance } from '@/services/balance';
import { JennieIcon } from '@/components/ui/JennieIcon';
import { ChainPopup } from './ChainPopup';
import { ActionNodes } from './ActionNodes';

interface NetworkMapProps {
  balances: ChainBalance[];
  isConnected: boolean;
  network: NetworkType;
  onQuickAction: (action: string, chain: ChainConfig) => void;
  onActionIntent: (intent: string) => void;
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

export function NetworkMap({ balances, isConnected, network, onQuickAction, onActionIntent }: NetworkMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [expandedChain, setExpandedChain] = useState<string | null>(null);

  const l1 = getL1(network);
  const rollups = getRollups(network);

  const balanceMap = useMemo(() => {
    const m: Record<string, ChainBalance> = {};
    for (const b of balances) m[b.chain.chainName] = b;
    return m;
  }, [balances]);

  const l1Bal = balanceMap['initia_l1'];
  const hoveredConfig = hovered === 'initia_l1' ? l1 : rollups.find(m => m.chainName === hovered);

  const L1_SIZE = 50;
  const MINI_SIZE = 36;

  // Close expanded on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedChain(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleNodeClick = (chainName: string) => {
    setExpandedChain(prev => prev === chainName ? null : chainName);
    setHovered(null);
  };

  const handleBgClick = () => {
    setExpandedChain(null);
  };

  return (
    <div className="relative w-full flex justify-center overflow-hidden">
      <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_#000] w-full max-w-[580px]" style={{ aspectRatio: `${MAP_W}/${MAP_H}` }}>
        <svg
          width="100%" height="100%"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleBgClick}
        >
          {/* Connection lines */}
          {rollups.map((chain, i) => {
            const pos = nodePos(i, rollups.length);
            const hasBal = parseInt(balanceMap[chain.chainName]?.totalInitAmount ?? '0') > 0;
            const dimmed = expandedChain !== null && expandedChain !== chain.chainName && expandedChain !== 'initia_l1';
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
            onClick={(e) => { e.stopPropagation(); handleNodeClick('initia_l1'); }}
            onMouseEnter={() => { if (!expandedChain) { setHovered('initia_l1'); setPopupPos({ x: CX, y: CY - L1_SIZE - 12 }); } }}
            onMouseLeave={() => setHovered(null)}
            opacity={expandedChain && expandedChain !== 'initia_l1' ? 0.3 : 1}
          >
            <rect x={CX - L1_SIZE} y={CY - L1_SIZE} width={L1_SIZE * 2} height={L1_SIZE * 2}
              fill={expandedChain === 'initia_l1' ? '#CCFF00' : '#CCFF00'} stroke="#000" strokeWidth="3" />
            <text x={CX} y={CY - 8} textAnchor="middle" fontSize="10" fontWeight="900" fill="#000" fontFamily="monospace" letterSpacing="2">
              INITIA L1
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle" fontSize="13" fontWeight="900" fill="#000" fontFamily="monospace">
              {l1Bal?.totalInitHuman ?? '—'}
            </text>
            <text x={CX} y={CY + 22} textAnchor="middle" fontSize="9" fontWeight="700" fill="#666" fontFamily="monospace">
              INIT
            </text>
          </g>

          {/* L1 action nodes when expanded */}
          {expandedChain === 'initia_l1' && (
            <ActionNodes
              actions={getActions('initia_l1')}
              parentX={CX}
              parentY={CY}
              parentSize={L1_SIZE}
              onSelect={onActionIntent}
            />
          )}

          {/* Rollup nodes */}
          {rollups.map((chain, i) => {
            const pos = nodePos(i, rollups.length);
            const bal = balanceMap[chain.chainName];
            const hasBal = parseInt(bal?.totalInitAmount ?? '0') > 0;
            const isExpanded = expandedChain === chain.chainName;
            const dimmed = expandedChain !== null && !isExpanded;

            return (
              <g key={chain.chainName}>
                {/* Node */}
                <g
                  className="cursor-pointer"
                  opacity={dimmed ? 0.15 : hasBal ? 1 : 0.3}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(chain.chainName); }}
                  onMouseEnter={() => { if (!expandedChain) { setHovered(chain.chainName); setPopupPos({ x: pos.x, y: pos.y - MINI_SIZE - 12 }); } }}
                  onMouseLeave={() => setHovered(null)}
                >
                  <rect x={pos.x - MINI_SIZE} y={pos.y - MINI_SIZE}
                    width={MINI_SIZE * 2} height={MINI_SIZE * 2}
                    fill={isExpanded ? chain.color : 'white'}
                    stroke="#000" strokeWidth={isExpanded ? 3 : 2.5}
                  />
                  <text x={pos.x} y={pos.y - 6} textAnchor="middle"
                    fontSize="9" fontWeight="900" fill={isExpanded ? '#000' : '#000'} fontFamily="monospace" letterSpacing="1">
                    {chain.prettyName.toUpperCase()}
                  </text>
                  <text x={pos.x} y={pos.y + 8} textAnchor="middle"
                    fontSize="11" fontWeight="900" fill="#000" fontFamily="monospace">
                    {bal?.totalInitHuman ?? '—'}
                  </text>
                  <text x={pos.x} y={pos.y + 20} textAnchor="middle"
                    fontSize="8" fontWeight="700" fill="#999" fontFamily="monospace">
                    {chain.vmType.toUpperCase()}
                  </text>
                </g>

                {/* Action nodes when expanded */}
                {isExpanded && (
                  <ActionNodes
                    actions={getActions(chain.chainName)}
                    parentX={pos.x}
                    parentY={pos.y}
                    parentSize={MINI_SIZE}
                    onSelect={onActionIntent}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover popup (only when no node is expanded) */}
        {!expandedChain && hovered && hoveredConfig && (
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
