'use client';

import { useState, useRef, useEffect } from 'react';
import { PRESET_INTENTS } from '@/data/preset-intents';

interface IntentInputProps {
  onSubmit: (input: string) => void;
}

export function IntentInput({ onSubmit }: IntentInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      <div className="border-[3px] border-black bg-white shadow-[4px_4px_0_#000]">
        <div className="px-4 pt-3">
          <span className="font-mono text-[9px] font-black uppercase tracking-[3px] text-[#999]">Intent ▸▸▸</span>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Sweep all my INIT to L1..."
          rows={2}
          className="w-full bg-transparent font-mono text-sm font-bold text-black placeholder:text-[#ddd] px-4 py-2 resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#ccc]">Enter to parse</span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="px-4 py-2 border-[3px] border-black bg-black text-[#CCFF00] font-mono text-[10px] font-black uppercase tracking-wider
              disabled:opacity-30 disabled:cursor-not-allowed
              hover:bg-[#CCFF00] hover:text-black transition-colors"
          >
            Parse →
          </button>
        </div>
      </div>
    </div>
  );
}
