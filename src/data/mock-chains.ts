import type { RollupConfig, AssetConfig } from '@/types/chain';

export const CHAINS: RollupConfig[] = [
  {
    chain_name: 'initia_l1',
    chain_id: 'interwoven-1',
    pretty_name: 'Initia L1',
    bridge_id: 0,
    ibc_channel: '',
    vm_type: 'move',
    supported_assets: ['INIT', 'USDC', 'ETH', 'TIA', 'ATOM'],
    color: '#6366f1',
  },
  {
    chain_name: 'blackwing',
    chain_id: 'bfb-1',
    pretty_name: 'Blackwing',
    bridge_id: 28,
    ibc_channel: 'channel-0',
    vm_type: 'evm',
    supported_assets: ['INIT', 'USDC', 'ETH'],
    color: '#8b5cf6',
  },
  {
    chain_name: 'echelon',
    chain_id: 'echelon-1',
    pretty_name: 'Echelon',
    bridge_id: 16,
    ibc_channel: 'channel-29',
    vm_type: 'evm',
    supported_assets: ['INIT', 'USDC', 'ETH'],
    color: '#14b8a6',
  },
  {
    chain_name: 'civitia',
    chain_id: 'civitia-1',
    pretty_name: 'Civitia',
    bridge_id: 12,
    ibc_channel: 'channel-5',
    vm_type: 'move',
    supported_assets: ['INIT', 'USDC'],
    color: '#f59e0b',
  },
  {
    chain_name: 'tucana',
    chain_id: 'tucana-1',
    pretty_name: 'Tucana',
    bridge_id: 32,
    ibc_channel: 'channel-25',
    vm_type: 'move',
    supported_assets: ['INIT', 'USDC', 'ETH', 'TIA'],
    color: '#ec4899',
  },
  {
    chain_name: 'inertia',
    chain_id: 'inertia-1',
    pretty_name: 'Inertia',
    bridge_id: 31,
    ibc_channel: 'channel-18',
    vm_type: 'cosmwasm',
    supported_assets: ['INIT', 'USDC'],
    color: '#22c55e',
  },
  {
    chain_name: 'noon',
    chain_id: 'noon-1',
    pretty_name: 'Noon',
    bridge_id: 22,
    ibc_channel: 'channel-12',
    vm_type: 'evm',
    supported_assets: ['INIT', 'USDC', 'ETH'],
    color: '#f97316',
  },
];

export const ASSETS: AssetConfig[] = [
  { symbol: 'INIT', base_denom: 'uinit', decimals: 6, price_usd: 0.85, color: '#6366f1' },
  { symbol: 'USDC', base_denom: 'uusdc', decimals: 6, price_usd: 1.0, color: '#2775ca' },
  { symbol: 'ETH', base_denom: 'ueth', decimals: 18, price_usd: 3200, color: '#627eea' },
  { symbol: 'TIA', base_denom: 'utia', decimals: 6, price_usd: 8.5, color: '#7c3aed' },
  { symbol: 'ATOM', base_denom: 'uatom', decimals: 6, price_usd: 9.2, color: '#2e3148' },
];

export function getChain(name: string): RollupConfig | undefined {
  return CHAINS.find(c => c.chain_name === name);
}

export function getAsset(symbol: string): AssetConfig | undefined {
  return ASSETS.find(a => a.symbol === symbol);
}
