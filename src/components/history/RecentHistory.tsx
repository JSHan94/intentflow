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
      <span className="font-mono text-[8px] font-black uppercase tracking-[3px] text-[#999]">★ Recent</span>
      <div className="border-[3px] border-black bg-white shadow-[3px_3px_0_#000] overflow-hidden">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex items-center gap-2 px-3 py-2 font-mono text-[10px] ${i < entries.length - 1 ? 'border-b-2 border-black' : ''}`}
          >
            <span className={`w-2 h-2 border border-black shrink-0 ${entry.result.success ? 'bg-[#CCFF00]' : 'bg-[#FF5733]'}`} />
            <span className="font-bold truncate flex-1">{entry.raw_intent}</span>
            <span className="text-[#999] font-bold shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
