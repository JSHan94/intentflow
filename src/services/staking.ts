import type { EncodeObject } from '@cosmjs/proto-signing';
import { TESTNET_L1, INIT_DENOM } from '@/config/chains';

export interface ValidatorInfo {
  operatorAddress: string;
  moniker: string;
  tokens: string;
  commission: string;
  status: string;
}

/**
 * Fetch bonded validators from L1 testnet, sorted by voting power
 */
export async function fetchValidators(limit = 10): Promise<ValidatorInfo[]> {
  const url = `${TESTNET_L1.restUrl}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch validators: ${res.status}`);

  const data = await res.json();

  return (data.validators ?? [])
    .map((v: Record<string, unknown>) => ({
      operatorAddress: v.operator_address as string,
      moniker: (v.description as Record<string, string>)?.moniker ?? 'Unknown',
      tokens: v.tokens as string,
      commission: ((v.commission as Record<string, Record<string, string>>)?.commission_rates?.rate ?? '0'),
      status: v.status as string,
    }))
    .sort((a: ValidatorInfo, b: ValidatorInfo) => parseInt(b.tokens) - parseInt(a.tokens));
}

/**
 * Get the top validator by voting power
 */
export async function getTopValidator(): Promise<ValidatorInfo> {
  const validators = await fetchValidators(1);
  if (validators.length === 0) throw new Error('No bonded validators found');
  return validators[0];
}

/**
 * Build a MsgDelegate EncodeObject for staking
 */
export function buildDelegateMsg(
  delegatorAddress: string,
  validatorAddress: string,
  amount: string,
  denom: string = INIT_DENOM,
): EncodeObject {
  return {
    typeUrl: '/initia.mstaking.v1.MsgDelegate',
    value: {
      delegatorAddress,
      validatorAddress,
      amount: [{ denom, amount }],
    },
  };
}

/**
 * Fetch current delegations for an address
 */
export async function fetchDelegations(address: string): Promise<{
  validator: string;
  amount: string;
}[]> {
  const url = `${TESTNET_L1.restUrl}/cosmos/staking/v1beta1/delegations/${address}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.delegation_responses ?? []).map((d: Record<string, unknown>) => ({
      validator: (d.delegation as Record<string, string>)?.validator_address ?? '',
      amount: ((d.balance as Record<string, string>)?.amount ?? '0'),
    }));
  } catch {
    return [];
  }
}
