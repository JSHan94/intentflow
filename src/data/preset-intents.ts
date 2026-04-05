export interface PresetIntent {
  label: string;
  input: string;
  category: 'sweep' | 'bridge' | 'move' | 'explore';
}

export const PRESET_INTENTS: PresetIntent[] = [
  {
    label: 'Sweep to L1',
    input: 'Sweep all my INIT from miniEVM to Initia L1',
    category: 'sweep',
  },
  {
    label: 'Bridge to miniEVM',
    input: 'Bridge my INIT from Initia L1 to miniEVM',
    category: 'bridge',
  },
  {
    label: 'Stake on L1',
    input: 'Stake my INIT on Initia L1',
    category: 'move',
  },
  {
    label: 'Consolidate INIT',
    input: 'Consolidate my INIT balances on Initia L1',
    category: 'sweep',
  },
  {
    label: 'Fast bridge',
    input: 'Move my INIT to miniEVM as fast as possible',
    category: 'bridge',
  },
  {
    label: 'Show options',
    input: 'Show me the best option for my INIT on initiation-2 or miniEVM',
    category: 'explore',
  },
];
