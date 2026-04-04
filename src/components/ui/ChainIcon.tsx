'use client';

import { getChain } from '@/data/mock-chains';

interface ChainIconProps {
  chainName: string;
  size?: number;
}

export function ChainIcon({ chainName, size = 28 }: ChainIconProps) {
  const chain = getChain(chainName);
  const color = chain?.color ?? '#000';
  const label = chain?.pretty_name ?? chainName;
  const letter = label.charAt(0).toUpperCase();

  return (
    <div
      className="inline-flex items-center justify-center font-mono font-black shrink-0 border-2 border-black"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: color,
        color: '#fff',
      }}
    >
      {letter}
    </div>
  );
}
