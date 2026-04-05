import type { EncodeObject } from '@cosmjs/proto-signing';
import type { StdFee } from '@cosmjs/stargate';
import { Coin as InitiaCoin, MsgInitiateTokenDeposit } from '@initia/initia.js';
import { INIT_DENOM, type ChainConfig } from '@/config/chains';
import { fetchDenomBalance } from '@/services/balance';

const DEFAULT_GAS_ADJUSTMENT = 1.4;
const DEFAULT_SETTLEMENT_TIMEOUT_MS = 180_000;
const POLL_INTERVAL_MS = 4_000;
const SWEEP_SAFETY_BUFFER = 1_000n;

export interface SimulatedFeePlan {
  fee: StdFee;
  feeAmount: string;
  feeDenom: string;
  gasLimit: number;
  gasAdjustment: number;
  gasPrice: string;
  gasPrices: { amount: string; denom: string }[];
}

interface SimulateFeeParams {
  chain: ChainConfig;
  messages: EncodeObject[];
  memo?: string;
  estimateGas: (params: {
    messages: EncodeObject[];
    memo?: string;
    chainId?: string;
  }) => Promise<number>;
}

function parseGasPrice(value: string | undefined): number {
  const parsed = Number(value ?? '0.015');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.015;
}

function trimTrailingZeros(value: string): string {
  if (!value.includes('.')) return value;
  return value.replace(/\.?0+$/, '');
}

function ceilDecimalProduct(integerValue: bigint, decimalValue: string): bigint {
  const [whole = '0', fractional = ''] = decimalValue.split('.');
  const scale = 10n ** BigInt(fractional.length);
  const scaled = BigInt(`${whole}${fractional}` || '0');
  if (scale === 1n) return integerValue * scaled;
  return (integerValue * scaled + scale - 1n) / scale;
}

export async function simulateFeePlan({
  chain,
  messages,
  memo,
  estimateGas,
}: SimulateFeeParams): Promise<SimulatedFeePlan> {
  const gasEstimate = await estimateGas({ messages, memo, chainId: chain.chainId });
  const gasLimit = Math.ceil(gasEstimate * DEFAULT_GAS_ADJUSTMENT);
  const gasPrice = trimTrailingZeros((parseGasPrice(chain.averageGasPrice)).toString());
  const feeDenom = chain.feeDenom ?? INIT_DENOM;
  const feeAmount = ceilDecimalProduct(BigInt(gasLimit), gasPrice).toString();

  return {
    fee: {
      amount: [{ denom: feeDenom, amount: feeAmount }],
      gas: gasLimit.toString(),
    },
    feeAmount,
    feeDenom,
    gasLimit,
    gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
    gasPrice,
    gasPrices: [{ denom: feeDenom, amount: gasPrice }],
  };
}

export function computeMaxSpendableAmount(
  balanceAmount: string,
  feeAmount: string,
  extraReserveAmount: string = '0',
): string {
  const balance = BigInt(balanceAmount);
  const fee = BigInt(feeAmount);
  const reserve = BigInt(extraReserveAmount);
  const spendable = balance - fee - reserve - SWEEP_SAFETY_BUFFER;
  return spendable > 0n ? spendable.toString() : '0';
}

export async function waitForBalanceIncrease(params: {
  chain: ChainConfig;
  address: string;
  denom?: string;
  baselineAmount: string;
  expectedIncrease: string;
  timeoutMs?: number;
}): Promise<string> {
  const {
    chain,
    address,
    denom = INIT_DENOM,
    baselineAmount,
    expectedIncrease,
    timeoutMs = DEFAULT_SETTLEMENT_TIMEOUT_MS,
  } = params;

  const baseline = BigInt(baselineAmount);
  const expected = BigInt(expectedIncrease);
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    const currentAmount = await fetchDenomBalance(chain, address, denom);
    if (BigInt(currentAmount) >= baseline + expected) {
      return currentAmount;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Timed out waiting for ${chain.prettyName} balance update`);
}

export function buildOpBridgeDepositMsg(params: {
  senderAddress: string;
  receiverAddress: string;
  amount: string;
  bridgeId: number;
  denom?: string;
}): EncodeObject {
  const msg = new MsgInitiateTokenDeposit(
    params.senderAddress,
    params.bridgeId,
    params.receiverAddress,
    new InitiaCoin(params.denom ?? INIT_DENOM, params.amount),
  );

  return {
    typeUrl: '/opinit.ophost.v1.MsgInitiateTokenDeposit',
    value: msg.toProto(),
  };
}
