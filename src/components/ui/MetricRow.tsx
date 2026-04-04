'use client';

interface MetricRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function MetricRow({ label, value, highlight }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-[#6B6B6B]">{label}</span>
      <span className={`text-sm font-mono font-medium ${highlight ? 'text-[#0D9488]' : 'text-[#1A1A1A]'}`}>
        {value}
      </span>
    </div>
  );
}
