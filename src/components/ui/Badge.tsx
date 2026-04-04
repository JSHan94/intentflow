'use client';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  success: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
  warning: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  error: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
  neutral: 'bg-[#F5F5F5] text-[#6B6B6B] border-[#E5E5E5]',
  accent: 'bg-[#E0F5F3] text-[#0D9488] border-[#99D5CF]',
  green: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
  amber: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  red: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
  blue: 'bg-[#E0F5F3] text-[#0D9488] border-[#99D5CF]',
  teal: 'bg-[#E0F5F3] text-[#0D9488] border-[#99D5CF]',
  violet: 'bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]',
  default: 'bg-[#F5F5F5] text-[#6B6B6B] border-[#E5E5E5]',
};

export function Badge({ label, color = 'default', size = 'sm' }: BadgeProps) {
  const classes = colorMap[color] ?? colorMap.default;
  const sizeClasses = size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-3 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono font-semibold uppercase tracking-wider ${classes} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
