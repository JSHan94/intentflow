'use client';

import { useEffect, useState } from 'react';
import type { HistoryEntry } from '@/types/flow';

export function RecentHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('intentflow_history');
      if (raw) setEntries(JSON.parse(raw).slice(0, 3));
    } catch { /* noop */ }
  }, []);

  if (entries.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#999]">Recent</span>
      <div className="space-y-1.5">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#E5E5E5] bg-white font-mono text-[10px]"
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.result.success ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
            <span className="text-[#6B6B6B] truncate flex-1">{entry.raw_intent}</span>
            <span className="text-[#999] shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
