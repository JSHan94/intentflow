'use client';

import { useEffect, useState } from 'react';
import { JennieIcon } from '@/components/ui/JennieIcon';

interface ParseAnimationProps {
  rawIntent: string;
}

export function ParseAnimation({ rawIntent }: ParseAnimationProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const words = rawIntent.split(' ');

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= words.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [words.length]);

  const progress = words.length > 0 ? (scanProgress / words.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <JennieIcon expression="thinking" size="md" />
        <h2 className="font-mono text-sm font-black uppercase tracking-[3px] text-[#999]">Parsing...</h2>
      </div>

      <div className="w-full border-[3px] border-black bg-white p-5 shadow-[4px_4px_0_#000]">
        <p className="font-mono text-base font-bold leading-relaxed">
          {words.map((word, i) => (
            <span
              key={i}
              className={`inline-block mr-2 transition-colors duration-100 ${
                i < scanProgress ? 'text-black bg-[#CCFF00] px-1' : 'text-[#ddd]'
              }`}
            >
              {word}
            </span>
          ))}
        </p>

        <div className="mt-5 h-2 bg-[#e5e5e0] border-2 border-black">
          <div
            className="h-full bg-[#CCFF00] transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
