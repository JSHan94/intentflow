import type { FeeConfig } from '@/types/chain';

export const MOCK_FEES: FeeConfig[] = [
  // Rollup -> L1 via IBC
  { source: 'blackwing', destination: 'initia_l1', method: 'ibc_transfer', base_fee_usd: 0.02, time_seconds: 60 },
  { source: 'echelon', destination: 'initia_l1', method: 'ibc_transfer', base_fee_usd: 0.02, time_seconds: 60 },
  { source: 'civitia', destination: 'initia_l1', method: 'ibc_transfer', base_fee_usd: 0.02, time_seconds: 60 },
  { source: 'tucana', destination: 'initia_l1', method: 'ibc_transfer', base_fee_usd: 0.03, time_seconds: 45 },
  { source: 'inertia', destination: 'initia_l1', method: 'ibc_transfer', base_fee_usd: 0.02, time_seconds: 55 },
  { source: 'noon', destination: 'initia_l1', method: 'ibc_transfer', base_fee_usd: 0.02, time_seconds: 50 },

  // L1 -> Rollup via OP Bridge
  { source: 'initia_l1', destination: 'blackwing', method: 'op_bridge_deposit', base_fee_usd: 0.05, time_seconds: 30 },
  { source: 'initia_l1', destination: 'echelon', method: 'op_bridge_deposit', base_fee_usd: 0.05, time_seconds: 30 },
  { source: 'initia_l1', destination: 'civitia', method: 'op_bridge_deposit', base_fee_usd: 0.04, time_seconds: 30 },
  { source: 'initia_l1', destination: 'tucana', method: 'op_bridge_deposit', base_fee_usd: 0.05, time_seconds: 25 },
  { source: 'initia_l1', destination: 'inertia', method: 'op_bridge_deposit', base_fee_usd: 0.04, time_seconds: 35 },
  { source: 'initia_l1', destination: 'noon', method: 'op_bridge_deposit', base_fee_usd: 0.05, time_seconds: 28 },

  // Rollup -> L1 via OP Bridge withdraw (slower, cheaper)
  { source: 'blackwing', destination: 'initia_l1', method: 'op_bridge_withdraw', base_fee_usd: 0.01, time_seconds: 600 },
  { source: 'echelon', destination: 'initia_l1', method: 'op_bridge_withdraw', base_fee_usd: 0.01, time_seconds: 600 },
  { source: 'tucana', destination: 'initia_l1', method: 'op_bridge_withdraw', base_fee_usd: 0.01, time_seconds: 500 },

  // L1 MinitSwap (denom conversion on L1)
  { source: 'initia_l1', destination: 'initia_l1', method: 'minitswap', base_fee_usd: 0.10, time_seconds: 5 },
];

export function lookupFee(source: string, destination: string, method?: string): FeeConfig | undefined {
  return MOCK_FEES.find(f =>
    f.source === source &&
    f.destination === destination &&
    (!method || f.method === method)
  );
}

export function lookupFees(source: string, destination: string): FeeConfig[] {
  return MOCK_FEES.filter(f => f.source === source && f.destination === destination);
}
