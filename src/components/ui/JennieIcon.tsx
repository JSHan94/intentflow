'use client';

import type { ReactNode } from 'react';

type Expression = 'neutral' | 'happy' | 'thinking' | 'sad';
type Size = 'sm' | 'md' | 'lg';

interface JennieIconProps {
  expression?: Expression;
  size?: Size;
  className?: string;
}

const SIZES: Record<Size, number> = { sm: 24, md: 32, lg: 48 };

export function JennieIcon({ expression = 'neutral', size = 'md', className = '' }: JennieIconProps) {
  const s = SIZES[size];

  // Eye expressions
  const eyes: Record<Expression, ReactNode> = {
    neutral: (
      <>
        <ellipse cx="37" cy="44" rx="3.5" ry="4" fill="#1A1A1A" />
        <ellipse cx="63" cy="44" rx="3.5" ry="4" fill="#1A1A1A" />
        <circle cx="38.5" cy="42.5" r="1.2" fill="white" />
        <circle cx="64.5" cy="42.5" r="1.2" fill="white" />
      </>
    ),
    happy: (
      <>
        {/* Closed happy eyes (arcs) */}
        <path d="M33 44 Q37 39 41 44" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M59 44 Q63 39 67 44" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </>
    ),
    thinking: (
      <>
        <ellipse cx="37" cy="44" rx="3.5" ry="4" fill="#1A1A1A" />
        <ellipse cx="63" cy="46" rx="3.5" ry="3" fill="#1A1A1A" />
        <circle cx="38.5" cy="42.5" r="1.2" fill="white" />
        <circle cx="64.5" cy="44.5" r="1.2" fill="white" />
        {/* Raised eyebrow */}
        <path d="M58 37 Q63 34 68 37" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </>
    ),
    sad: (
      <>
        <ellipse cx="37" cy="46" rx="3" ry="3.5" fill="#1A1A1A" />
        <ellipse cx="63" cy="46" rx="3" ry="3.5" fill="#1A1A1A" />
        <circle cx="38" cy="44.5" r="1" fill="white" />
        <circle cx="64" cy="44.5" r="1" fill="white" />
        {/* Sad eyebrows */}
        <path d="M31 40 Q37 37 43 40" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M57 40 Q63 37 69 40" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </>
    ),
  };

  // Mouth expressions
  const mouths: Record<Expression, ReactNode> = {
    neutral: (
      <path d="M42 56 Q50 60 58 56" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
    ),
    happy: (
      <path d="M40 54 Q50 64 60 54" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
    ),
    thinking: (
      <circle cx="55" cy="57" r="3" fill="#1A1A1A" opacity="0.6" />
    ),
    sad: (
      <path d="M42 60 Q50 54 58 60" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
    ),
  };

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      {/* Body / Head — round dog face */}
      <circle cx="50" cy="52" r="30" fill="#0D9488" />
      <circle cx="50" cy="52" r="30" fill="white" opacity="0.15" />

      {/* Inner face (lighter) */}
      <circle cx="50" cy="54" r="22" fill="#E0F5F3" />

      {/* Ears */}
      <ellipse cx="26" cy="30" rx="12" ry="16" fill="#0D9488" transform="rotate(-15 26 30)" />
      <ellipse cx="74" cy="30" rx="12" ry="16" fill="#0D9488" transform="rotate(15 74 30)" />
      <ellipse cx="27" cy="31" rx="7" ry="10" fill="#0A7A70" transform="rotate(-15 27 31)" />
      <ellipse cx="73" cy="31" rx="7" ry="10" fill="#0A7A70" transform="rotate(15 73 31)" />

      {/* Nose */}
      <ellipse cx="50" cy="51" rx="4" ry="3" fill="#0A7A70" />

      {/* Eyes */}
      {eyes[expression]}

      {/* Mouth */}
      {mouths[expression]}

      {/* Blush */}
      <circle cx="32" cy="54" r="4" fill="#F59E0B" opacity="0.2" />
      <circle cx="68" cy="54" r="4" fill="#F59E0B" opacity="0.2" />

      {/* Thinking bubble (only for thinking expression) */}
      {expression === 'thinking' && (
        <>
          <circle cx="78" cy="28" r="2.5" fill="#D4D4D4" />
          <circle cx="84" cy="20" r="4" fill="#D4D4D4" />
        </>
      )}
    </svg>
  );
}
