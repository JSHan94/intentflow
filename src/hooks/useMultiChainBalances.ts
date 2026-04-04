'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAllBalances, type ChainBalance } from '@/services/balance';

export function useMultiChainBalances(address: string | undefined) {
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!address) {
      setBalances([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await fetchAllBalances(address);
      setBalances(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Chains that have INIT balance > 0 (excluding L1)
  const sweepableChains = balances.filter(
    (b) => b.chain.chainName !== 'initia_l1' && parseInt(b.totalInitAmount) > 0
  );

  const l1Balance = balances.find((b) => b.chain.chainName === 'initia_l1');

  return {
    balances,
    sweepableChains,
    l1Balance,
    isLoading,
    error,
    refetch,
  };
}
