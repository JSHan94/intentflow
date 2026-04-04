import type { UserBalance } from '@/types/chain';

export const MOCK_BALANCES: UserBalance[] = [
  { chain_name: 'blackwing', asset: 'USDC', amount: '500.00', raw_amount: '500000000', value_usd: 500 },
  { chain_name: 'echelon', asset: 'USDC', amount: '200.00', raw_amount: '200000000', value_usd: 200 },
  { chain_name: 'civitia', asset: 'INIT', amount: '1000.00', raw_amount: '1000000000', value_usd: 850 },
  { chain_name: 'tucana', asset: 'ETH', amount: '0.50', raw_amount: '500000000000000000', value_usd: 1600 },
  { chain_name: 'initia_l1', asset: 'INIT', amount: '300.00', raw_amount: '300000000', value_usd: 255 },
  { chain_name: 'initia_l1', asset: 'USDC', amount: '100.00', raw_amount: '100000000', value_usd: 100 },
  { chain_name: 'blackwing', asset: 'INIT', amount: '150.00', raw_amount: '150000000', value_usd: 127.5 },
  { chain_name: 'echelon', asset: 'ETH', amount: '0.25', raw_amount: '250000000000000000', value_usd: 800 },
  { chain_name: 'tucana', asset: 'INIT', amount: '75.00', raw_amount: '75000000', value_usd: 63.75 },
  { chain_name: 'inertia', asset: 'USDC', amount: '350.00', raw_amount: '350000000', value_usd: 350 },
  { chain_name: 'noon', asset: 'INIT', amount: '420.00', raw_amount: '420000000', value_usd: 357 },
  { chain_name: 'noon', asset: 'ETH', amount: '0.10', raw_amount: '100000000000000000', value_usd: 320 },
];
