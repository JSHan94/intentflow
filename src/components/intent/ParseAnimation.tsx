'use client';

import { useEffect, useState } from 'react';

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
      <div className="text-center space-y-2">
        <h2 className="font-heading text-lg font-semibold text-[#6B6B6B]">Parsing your intent...</h2>
      </div>

      {/* Animated text */}
      <div className="w-full border-2 border-[#1A1A1A] rounded-md bg-white p-5">
        <p className="font-mono text-base leading-relaxed">
          {words.map((word, i) => (
            <span
              key={i}
              className={`inline-block mr-2 transition-colors duration-100 ${
                i < scanProgress ? 'text-[#0D9488] font-medium' : 'text-[#D4D4D4]'
              }`}
            >
              {word}
            </span>
          ))}
        </p>

        {/* Progress bar */}
        <div className="mt-5 h-1 rounded-sm bg-[#E5E5E5] overflow-hidden border border-[#D4D4D4]">
          <div
            className="h-full bg-[#0D9488] transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-[#999]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
        Extracting structured fields...
      </div>
    </div>
  );
}
