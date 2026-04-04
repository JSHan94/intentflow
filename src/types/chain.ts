import type { OperationType } from './plan';

export interface RollupConfig {
  chain_name: string;
  chain_id: string;
  pretty_name: string;
  bridge_id: number;
  ibc_channel: string;
  vm_type: 'move' | 'cosmwasm' | 'evm';
  supported_assets: string[];
  color: string;
}

export interface AssetConfig {
  symbol: string;
  base_denom: string;
  decimals: number;
  price_usd: number;
  color: string;
}

export interface FeeConfig {
  source: string;
  destination: string;
  method: OperationType;
  base_fee_usd: number;
  time_seconds: number;
}

export interface UserBalance {
  chain_name: string;
  asset: string;
  amount: string;
  raw_amount: string;
  value_usd: number;
}
