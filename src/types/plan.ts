import type { ParsedIntent } from './intent';

export type OperationType = 'ibc_transfer' | 'op_bridge_deposit' | 'op_bridge_withdraw' | 'minitswap' | 'transfer';

export type RiskLevel = 'low' | 'medium' | 'high';

export type StrategyType = 'cheapest' | 'fastest' | 'best_recovery';

export interface PlanStep {
  step_index: number;
  operation: OperationType;
  source_chain: string;
  destination_chain: string;
  asset: string;
  amount: string;
  raw_amount: string;
  estimated_fee_usd: number;
  estimated_time_seconds: number;
  requires_previous: boolean;
  fallback_step?: PlanStep;
  metadata: {
    channel?: string;
    bridge_id?: number;
    denom?: string;
    memo?: string;
  };
}

export interface ExecutionPlan {
  strategy: StrategyType;
  label: string;
  steps: PlanStep[];
  total_estimated_fee_usd: number;
  total_estimated_time_seconds: number;
  net_output: string;
  net_output_usd: number;
  risk_level: RiskLevel;
  route_summary: string;
  hop_count: number;
  warnings: string[];
}

export interface PlanGenerationResult {
  intent: ParsedIntent;
  plans: ExecutionPlan[];
  generated_at: number;
}
