'use client';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  success: 'bg-[#CCFF00] text-black border-black',
  warning: 'bg-[#FEE440] text-black border-black',
  error: 'bg-[#FF5733] text-white border-black',
  accent: 'bg-[#CCFF00] text-black border-black',
  neutral: 'bg-white text-black border-black',
  green: 'bg-[#CCFF00] text-black border-black',
  amber: 'bg-[#FEE440] text-black border-black',
  red: 'bg-[#FF5733] text-white border-black',
  blue: 'bg-[#00D4FF] text-black border-black',
  teal: 'bg-[#00D4FF] text-black border-black',
  violet: 'bg-[#B388FF] text-black border-black',
  default: 'bg-white text-black border-black',
};

export function Badge({ label, color = 'default', size = 'sm' }: BadgeProps) {
  const classes = colorMap[color] ?? colorMap.default;
  const sizeClasses = size === 'sm' ? 'text-[8px] px-2 py-0.5' : 'text-[9px] px-3 py-1';

  return (
    <span className={`inline-flex items-center border-2 font-mono font-black uppercase tracking-widest ${classes} ${sizeClasses}`}>
      {label}
    </span>
  );
}
