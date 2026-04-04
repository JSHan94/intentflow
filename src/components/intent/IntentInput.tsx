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
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
          What do you want to do?
        </h1>
        <p className="text-sm text-[#6B6B6B]">
          Describe your cross-rollup intent in natural language
        </p>
      </div>

      {/* Input */}
      <div className="w-full border-2 border-[#1A1A1A] rounded-md shadow-[2px_2px_0_rgba(0,0,0,0.06)] bg-white">
        <div className="px-4 pt-3">
          <span className="font-mono text-[10px] text-[#999]">INTENT &gt;</span>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Sweep all my USDC into one Initia destination..."
          rows={3}
          className="w-full bg-transparent font-mono text-sm text-[#1A1A1A] placeholder:text-[#D4D4D4] px-4 py-2 rounded-md resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="font-mono text-[10px] text-[#999]">Press Enter to parse</span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="px-4 py-1.5 rounded-md bg-[#0D9488] text-white font-mono text-xs font-semibold
              border-2 border-[#0A7A70]
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-[#0A7A70] transition-colors"
          >
            Parse Intent
          </button>
        </div>
      </div>

      {/* Preset chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {PRESET_INTENTS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setValue(preset.input);
              textareaRef.current?.focus();
            }}
            className="px-3 py-1.5 rounded-md border-[1.5px] border-[#D4D4D4] bg-white
              font-mono text-[10px] text-[#6B6B6B]
              hover:border-[#0D9488] hover:text-[#0D9488] hover:bg-[#E0F5F3] transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
