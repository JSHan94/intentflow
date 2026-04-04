'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HistoryEntry } from '@/types/flow';
import { JennieIcon } from '@/components/ui/JennieIcon';

function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('intentflow_history');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-[#f5f5f0] border-b-[3px] border-black">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <JennieIcon expression="neutral" size="sm" />
          <span className="font-mono text-sm font-black uppercase tracking-[3px]">IntentFlow</span>
        </Link>
        <Link href="/" className="px-3 py-1.5 border-[3px] border-black bg-[#CCFF00] font-mono text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] transition-all">
          New →
        </Link>
      </header>

      <main className="flex-1 pt-20 pb-12 px-4 max-w-2xl mx-auto w-full">
        <div className="space-y-5">
          <h1 className="font-mono text-lg font-black uppercase tracking-[3px]">★ History</h1>

          {entries.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <JennieIcon expression="neutral" size="lg" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#999]">No intents yet</p>
              <Link href="/" className="inline-block px-4 py-2 border-[3px] border-black bg-[#CCFF00] font-mono text-[9px] font-black uppercase tracking-wider shadow-[3px_3px_0_#000]">
                Create first intent →
              </Link>
            </div>
          ) : (
            <div className="border-[3px] border-black bg-white shadow-[4px_4px_0_#000] overflow-hidden">
              {entries.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < entries.length - 1 ? 'border-b-2 border-black' : ''}`}
                >
                  <span className={`w-3 h-3 border-2 border-black shrink-0 ${entry.result.success ? 'bg-[#CCFF00]' : 'bg-[#FF5733]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] font-bold truncate">{entry.raw_intent}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[8px] font-bold text-[#999]">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span className="font-mono text-[8px] font-black uppercase px-1.5 py-0.5 border border-black bg-[#CCFF00]">
                        {entry.plan_type}
                      </span>
                    </div>
                  </div>
                  <span className={`font-mono text-[8px] font-black uppercase px-2 py-1 border-2 border-black ${entry.result.success ? 'bg-[#CCFF00]' : 'bg-[#FF5733] text-white'}`}>
                    {entry.result.success ? '✓' : '!!'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
