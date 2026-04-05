import {
  formatInitAmount,
  getChainConfig,
  getL1,
  INIT_DECIMALS,
  INIT_DENOM,
  type ChainConfig,
  type NetworkType,
} from '@/config/chains';
import type { ChainBalance } from '@/services/balance';
import type { ParsedIntent } from '@/types/intent';
import type { ExecutionPlan, PlanGenerationResult, PlanStep, StrategyType } from '@/types/plan';

const INIT_PRICE_USD = 0.85;

const STEP_COST_USD: Record<PlanStep['operation'], number> = {
  ibc_transfer: 0.01,
  op_bridge_deposit: 0.02,
  op_bridge_withdraw: 0.02,
  minitswap: 0.01,
  transfer: 0.01,
  stake: 0.01,
};

const STEP_TIME_SECONDS: Record<PlanStep['operation'], number> = {
  ibc_transfer: 60,
  op_bridge_deposit: 45,
  op_bridge_withdraw: 300,
  minitswap: 10,
  transfer: 15,
  stake: 20,
};

interface InitPosition {
  chain: ChainConfig;
  rawAmount: string;
}

function supportsInit(intent: ParsedIntent): boolean {
  return intent.assets.some((asset) => asset.symbol === 'ALL' || asset.symbol === 'INIT');
}

function getInitPositions(intent: ParsedIntent, balances: ChainBalance[]): InitPosition[] {
  if (!supportsInit(intent)) return [];

  let positions = balances
    .filter((balance) => BigInt(balance.totalInitAmount) > BigInt(0))
    .map((balance) => ({ chain: balance.chain, rawAmount: balance.totalInitAmount }));

  if (intent.source.qualifier === 'specific' && intent.source.chain_name) {
    positions = positions.filter((position) => position.chain.chainName === intent.source.chain_name);
  }

  for (const exclusion of intent.exclusions) {
    if (exclusion.type === 'chain') {
      positions = positions.filter((position) => position.chain.chainName !== exclusion.value);
    }
  }

  return positions;
}

function resolveDestination(intent: ParsedIntent): string {
  if (intent.destination.qualifier === 'specific' && intent.destination.chain_name) {
    return intent.destination.chain_name;
  }

  if (intent.action_type === 'bridge' || intent.action_type === 'move') {
    return 'minievm';
  }

  return 'initia_l1';
}

function selectedStrategy(intent: ParsedIntent): StrategyType {
  if (intent.fee_preference === 'fastest') return 'fastest';
  if (intent.fee_preference === 'balanced') return 'best_recovery';
  return 'cheapest';
}

function labelForStrategy(strategy: StrategyType, fallback: string): string {
  switch (strategy) {
    case 'fastest':
      return `Fastest ${fallback}`;
    case 'best_recovery':
      return `Balanced ${fallback}`;
    case 'cheapest':
    default:
      return `Cheapest ${fallback}`;
  }
}

function createStep(args: {
  operation: PlanStep['operation'];
  source: ChainConfig;
  destination: ChainConfig;
  rawAmount: string;
  stepIndex: number;
}): PlanStep {
  return {
    step_index: args.stepIndex,
    operation: args.operation,
    source_chain: args.source.chainName,
    destination_chain: args.destination.chainName,
    asset: 'INIT',
    amount: `${formatInitAmount(args.rawAmount)} INIT`,
    raw_amount: args.rawAmount,
    estimated_fee_usd: STEP_COST_USD[args.operation],
    estimated_time_seconds: STEP_TIME_SECONDS[args.operation],
    requires_previous: args.stepIndex > 0,
    metadata: {
      channel: args.source.ibcChannelToL1,
      bridge_id: args.destination.bridgeId || args.source.bridgeId,
      denom: INIT_DENOM,
    },
  };
}

function buildPlan(
  strategy: StrategyType,
  baseLabel: string,
  steps: PlanStep[],
  totalRawAmount: bigint,
): ExecutionPlan | null {
  if (steps.length === 0) return null;

  const totalFee = steps.reduce((sum, step) => sum + step.estimated_fee_usd, 0);
  const totalTime = steps.reduce((sum, step) => sum + step.estimated_time_seconds, 0);
  const totalValueUsd = (Number(totalRawAmount) / 10 ** INIT_DECIMALS) * INIT_PRICE_USD;
  const uniqueChains = Array.from(new Set(
    steps.flatMap((step) => [step.source_chain, step.destination_chain])
  ));

  return {
    strategy,
    label: labelForStrategy(strategy, baseLabel),
    steps,
    total_estimated_fee_usd: Number(totalFee.toFixed(2)),
    total_estimated_time_seconds: totalTime,
    net_output: `$${Math.max(totalValueUsd - totalFee, 0).toFixed(2)}`,
    net_output_usd: totalValueUsd - totalFee,
    risk_level: strategy === 'best_recovery' ? 'low' : 'medium',
    route_summary: uniqueChains
      .map((chainName) => getChainConfig(chainName)?.prettyName ?? chainName)
      .join(' → '),
    hop_count: steps.length,
    warnings: [],
  };
}

function buildStakeSteps(positions: InitPosition[], l1: ChainConfig): PlanStep[] {
  const steps: PlanStep[] = [];
  const nonL1 = positions.filter((p) => p.chain.chainName !== l1.chainName);

  for (const position of nonL1) {
    steps.push(createStep({
      operation: 'ibc_transfer',
      source: position.chain,
      destination: l1,
      rawAmount: position.rawAmount,
      stepIndex: steps.length,
    }));
  }

  const totalRawAmount = positions.reduce((sum, p) => sum + BigInt(p.rawAmount), BigInt(0));
  if (totalRawAmount > BigInt(0)) {
    steps.push(createStep({
      operation: 'stake',
      source: l1,
      destination: l1,
      rawAmount: totalRawAmount.toString(),
      stepIndex: steps.length,
    }));
  }

  return steps;
}

function buildTransferSteps(
  positions: InitPosition[],
  destination: ChainConfig,
  l1: ChainConfig,
): PlanStep[] {
  const steps: PlanStep[] = [];

  if (destination.chainName === l1.chainName) {
    const nonL1 = positions.filter((p) => p.chain.chainName !== l1.chainName);
    for (const position of nonL1) {
      steps.push(createStep({
        operation: 'ibc_transfer',
        source: position.chain,
        destination: l1,
        rawAmount: position.rawAmount,
        stepIndex: steps.length,
      }));
    }
    return steps;
  }

  const l1Position = positions.find((p) => p.chain.chainName === l1.chainName);
  if (!l1Position) return [];

  steps.push(createStep({
    operation: 'op_bridge_deposit',
    source: l1,
    destination,
    rawAmount: l1Position.rawAmount,
    stepIndex: 0,
  }));

  return steps;
}

export function generatePlans(
  intent: ParsedIntent,
  balances: ChainBalance[],
  network: NetworkType = 'testnet',
): PlanGenerationResult {
  const l1 = getL1(network);
  const positions = getInitPositions(intent, balances);
  const strategy = selectedStrategy(intent);
  const destination = getChainConfig(resolveDestination(intent), network) ?? l1;

  let plan: ExecutionPlan | null = null;

  if (intent.action_type === 'stake') {
    const totalRawAmount = positions.reduce((sum, p) => sum + BigInt(p.rawAmount), BigInt(0));
    plan = buildPlan(strategy, 'Stake Plan', buildStakeSteps(positions, l1), totalRawAmount);
  } else {
    const transferSteps = buildTransferSteps(positions, destination, l1);
    const label = destination.chainName === l1.chainName ? 'Sweep Plan' : 'Bridge Plan';
    const totalRawAmount = transferSteps.reduce((sum, step) => sum + BigInt(step.raw_amount), BigInt(0));
    plan = buildPlan(strategy, label, transferSteps, totalRawAmount);
  }

  const plans = plan ? [plan] : [];
  const filteredPlans = intent.min_net_output !== null
    ? plans.filter((entry) => entry.net_output_usd >= intent.min_net_output!)
    : plans;

  return {
    intent,
    plans: filteredPlans.length > 0 ? filteredPlans : plans,
    generated_at: Date.now(),
  };
}
