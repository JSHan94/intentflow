'use client';

interface MetricRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function MetricRow({ label, value, highlight }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#999]">{label}</span>
      <span className={`font-mono text-sm font-black ${highlight ? 'text-[#FF5733]' : 'text-black'}`}>
        {value}
      </span>
    </div>
  );
}
