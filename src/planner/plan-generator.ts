import type { ParsedIntent } from '@/types/intent';
import type { ExecutionPlan, PlanStep, PlanGenerationResult, StrategyType } from '@/types/plan';
import type { UserBalance } from '@/types/chain';
import { MOCK_BALANCES } from '@/data/mock-balances';
import { CHAINS, getAsset, getChain } from '@/data/mock-chains';
import { buildRoutes, cheapestRoute, fastestRoute, fewestHopsRoute, type Route } from './route-builder';

interface BalanceRoute {
  balance: UserBalance;
  routes: Route[];
}

function filterBalances(intent: ParsedIntent): UserBalance[] {
  let balances = [...MOCK_BALANCES];

  // Filter by asset
  const isAll = intent.assets.some(a => a.symbol === 'ALL');
  if (!isAll) {
    const symbols = new Set(intent.assets.map(a => a.symbol));
    balances = balances.filter(b => symbols.has(b.asset));
  }

  // Filter by source
  if (intent.source.qualifier === 'specific' && intent.source.chain_name) {
    balances = balances.filter(b => b.chain_name === intent.source.chain_name);
  }

  // Apply exclusions
  for (const exclusion of intent.exclusions) {
    if (exclusion.type === 'chain') {
      balances = balances.filter(b => b.chain_name !== exclusion.value);
    } else {
      balances = balances.filter(b => b.asset !== exclusion.value);
    }
  }

  return balances;
}

function resolveDestination(intent: ParsedIntent): string {
  if (intent.destination.qualifier === 'specific' && intent.destination.chain_name) {
    return intent.destination.chain_name;
  }
  return 'initia_l1'; // Default destination
}

function routeToSteps(route: Route, balance: UserBalance, stepOffset: number): PlanStep[] {
  return route.hops.map((hop, i) => ({
    step_index: stepOffset + i,
    operation: hop.method,
    source_chain: hop.from,
    destination_chain: hop.to,
    asset: balance.asset,
    amount: `${balance.amount} ${balance.asset}`,
    raw_amount: balance.raw_amount,
    estimated_fee_usd: hop.fee_usd,
    estimated_time_seconds: hop.time_seconds,
    requires_previous: i > 0,
    metadata: {
      channel: getChain(hop.to)?.ibc_channel,
      bridge_id: getChain(hop.to)?.bridge_id,
      denom: getAsset(balance.asset)?.base_denom,
    },
  }));
}

function buildPlan(
  strategy: StrategyType,
  balanceRoutes: BalanceRoute[],
  selectRoute: (routes: Route[]) => Route | null,
  feeMultiplier: number,
): ExecutionPlan | null {
  const steps: PlanStep[] = [];
  let totalFee = 0;
  let totalTime = 0;
  let totalValueUsd = 0;
  const chainPath: string[] = [];

  for (const { balance, routes } of balanceRoutes) {
    const route = selectRoute(routes);
    if (!route) continue;

    const planSteps = routeToSteps(route, balance, steps.length);
    steps.push(...planSteps);

    const adjustedFee = route.total_fee_usd * feeMultiplier;
    totalFee += adjustedFee;
    totalTime = Math.max(totalTime, route.total_time_seconds); // parallel execution
    totalValueUsd += balance.value_usd;

    // Build route summary
    for (const hop of route.hops) {
      if (!chainPath.includes(hop.from)) chainPath.push(hop.from);
      if (!chainPath.includes(hop.to)) chainPath.push(hop.to);
    }
  }

  if (steps.length === 0) return null;

  const netOutputUsd = totalValueUsd - totalFee;

  const labels: Record<StrategyType, string> = {
    cheapest: 'Cheapest Route',
    fastest: 'Fastest Route',
    best_recovery: 'Best Recovery',
  };

  const riskLevels: Record<StrategyType, 'low' | 'medium' | 'high'> = {
    cheapest: 'medium',
    fastest: 'low',
    best_recovery: 'low',
  };

  return {
    strategy,
    label: labels[strategy],
    steps,
    total_estimated_fee_usd: Math.round(totalFee * 100) / 100,
    total_estimated_time_seconds: totalTime,
    net_output: `$${netOutputUsd.toFixed(2)}`,
    net_output_usd: netOutputUsd,
    risk_level: riskLevels[strategy],
    route_summary: chainPath.map(c => getChain(c)?.pretty_name ?? c).join(' → '),
    hop_count: steps.length,
    warnings: totalFee > totalValueUsd * 0.05 ? ['Fees exceed 5% of total value'] : [],
  };
}

export function generatePlans(intent: ParsedIntent): PlanGenerationResult {
  const balances = filterBalances(intent);
  const destination = resolveDestination(intent);

  // Build routes for each balance that's not already at destination
  const balanceRoutes: BalanceRoute[] = [];
  for (const balance of balances) {
    if (balance.chain_name === destination) continue;
    const routes = buildRoutes(balance.chain_name, destination);
    if (routes.length > 0) {
      balanceRoutes.push({ balance, routes });
    }
  }

  const plans: ExecutionPlan[] = [];

  // Cheapest: minimize fees (0.8x fee multiplier for batching)
  const cheapest = buildPlan('cheapest', balanceRoutes, cheapestRoute, 0.8);
  if (cheapest) plans.push(cheapest);

  // Fastest: fewest hops, lowest time (1.2x fee premium)
  const fastest = buildPlan('fastest', balanceRoutes, fewestHopsRoute, 1.2);
  if (fastest) plans.push(fastest);

  // Best Recovery: cheapest route with fallback (1.1x fee multiplier)
  const recovery = buildPlan('best_recovery', balanceRoutes, cheapestRoute, 1.1);
  if (recovery) {
    // Add fallback steps
    recovery.steps = recovery.steps.map(step => ({
      ...step,
      fallback_step: step.operation === 'ibc_transfer'
        ? { ...step, operation: 'op_bridge_deposit' as const, estimated_time_seconds: step.estimated_time_seconds * 2 }
        : undefined,
    }));
    plans.push(recovery);
  }

  // Filter by min_net_output
  const filteredPlans = intent.min_net_output !== null
    ? plans.filter(p => p.net_output_usd >= intent.min_net_output!)
    : plans;

  return {
    intent,
    plans: filteredPlans.length > 0 ? filteredPlans : plans,
    generated_at: Date.now(),
  };
}
