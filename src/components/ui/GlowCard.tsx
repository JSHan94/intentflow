'use client';

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function GlowCard({ children, className = '', onClick, selected }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-md bg-white p-4
        transition-[border-color,box-shadow] duration-100
        ${selected
          ? 'border-2 border-[#0D9488] bg-[#E0F5F3] shadow-[3px_3px_0_rgba(0,0,0,0.08)]'
          : 'border-2 border-[#D4D4D4] hover:border-[#1A1A1A] hover:shadow-[2px_2px_0_rgba(0,0,0,0.06)]'
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
