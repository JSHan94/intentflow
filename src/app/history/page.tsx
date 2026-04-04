'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { HistoryEntry } from '@/types/flow';
import { Badge } from '@/components/ui/Badge';

function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('intentflow_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b-2 border-[#1A1A1A]">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-heading text-lg font-bold tracking-tight text-[#1A1A1A]">IntentFlow</span>
        </Link>
        <Link href="/" className="font-mono text-xs text-[#0D9488] hover:text-[#0A7A70] transition-colors">
          New Intent
        </Link>
      </header>

      <main className="flex-1 pt-20 pb-12 px-4 max-w-2xl mx-auto w-full">
        <div className="space-y-5">
          <h1 className="font-heading text-xl font-bold text-[#1A1A1A]">Recent Intents</h1>

          {entries.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-md border-2 border-[#D4D4D4] flex items-center justify-center text-[#999]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-[#6B6B6B]">No intents yet</p>
              <Link href="/" className="inline-block font-mono text-xs text-[#0D9488] hover:underline">
                Create your first intent
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-md border-[1.5px] border-[#D4D4D4] bg-white hover:border-[#1A1A1A] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-[#1A1A1A] truncate">{entry.raw_intent}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-[#999]">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <Badge label={entry.plan_type} color="accent" />
                    </div>
                  </div>
                  <Badge
                    label={entry.result.success ? 'Success' : 'Failed'}
                    color={entry.result.success ? 'success' : 'error'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
