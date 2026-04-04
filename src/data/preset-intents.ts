export interface PresetIntent {
  label: string;
  input: string;
  category: 'sweep' | 'bridge' | 'move' | 'explore';
}

export const PRESET_INTENTS: PresetIntent[] = [
  {
    label: 'Sweep USDC',
    input: 'Sweep all my USDC into one Initia destination',
    category: 'sweep',
  },
  {
    label: 'Bridge ETH',
    input: 'Bridge my ETH from Echelon to Blackwing',
    category: 'bridge',
  },
  {
    label: 'Move to Blackwing',
    input: 'Move everything to Blackwing',
    category: 'move',
  },
  {
    label: 'Consolidate cheap',
    input: 'Consolidate my balances if fees are low enough',
    category: 'sweep',
  },
  {
    label: 'Fast INIT transfer',
    input: 'Send 100 INIT from Civitia to Tucana as fast as possible',
    category: 'bridge',
  },
  {
    label: 'Collect all assets',
    input: 'Show me the best option to collect assets into one wallet',
    category: 'explore',
  },
];
