'use client';

import { getChain } from '@/data/mock-chains';

interface ChainIconProps {
  chainName: string;
  size?: number;
}

export function ChainIcon({ chainName, size = 28 }: ChainIconProps) {
  const chain = getChain(chainName);
  const color = chain?.color ?? '#0D9488';
  const label = chain?.pretty_name ?? chainName;
  const letter = label.charAt(0).toUpperCase();

  return (
    <div
      className="inline-flex items-center justify-center rounded-[4px] font-mono font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: `${color}18`,
        color: color,
        border: `1.5px solid ${color}40`,
      }}
    >
      {letter}
    </div>
  );
}
