import { getAllChains, INIT_DENOM, INIT_DECIMALS, type ChainConfig } from '@/config/chains';

export interface ChainBalance {
  chain: ChainConfig;
  balances: TokenBalance[];
  totalInitAmount: string;
  totalInitHuman: string;
}

export interface TokenBalance {
  denom: string;
  amount: string;
  humanAmount: string;
}

/**
 * Fetch all token balances for an address on a specific chain
 */
export async function fetchChainBalances(
  chain: ChainConfig,
  address: string,
): Promise<ChainBalance> {
  const url = `${chain.restUrl}/cosmos/bank/v1beta1/balances/${address}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return { chain, balances: [], totalInitAmount: '0', totalInitHuman: '0.00' };
    }

    const data = await res.json();
    const rawBalances: { denom: string; amount: string }[] = data.balances ?? [];

    const balances: TokenBalance[] = rawBalances.map((b) => ({
      denom: b.denom,
      amount: b.amount,
      humanAmount: formatAmount(b.amount, getDecimals(b.denom)),
    }));

    // Find INIT balance (could be uinit or an IBC-wrapped version)
    const initBalance = rawBalances.find(
      (b) => b.denom === INIT_DENOM || b.denom.startsWith('l2/')
    );
    const totalInitAmount = initBalance?.amount ?? '0';
    const totalInitHuman = formatAmount(totalInitAmount, INIT_DECIMALS);

    return { chain, balances, totalInitAmount, totalInitHuman };
  } catch {
    return { chain, balances: [], totalInitAmount: '0', totalInitHuman: '0.00' };
  }
}

/**
 * Fetch balances from all configured chains in parallel
 */
export async function fetchAllBalances(address: string): Promise<ChainBalance[]> {
  const results = await Promise.allSettled(
    getAllChains('testnet').map((chain) => fetchChainBalances(chain, address))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ChainBalance> => r.status === 'fulfilled')
    .map((r) => r.value);
}

function formatAmount(rawAmount: string, decimals: number): string {
  const num = parseInt(rawAmount, 10);
  if (isNaN(num) || num === 0) return '0.00';
  return (num / 10 ** decimals).toFixed(2);
}

function getDecimals(denom: string): number {
  if (denom === INIT_DENOM) return INIT_DECIMALS;
  if (denom.startsWith('l2/')) return INIT_DECIMALS;
  return 6; // default
}
