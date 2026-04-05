import type { EncodeObject } from '@cosmjs/proto-signing';
import { INIT_DENOM, type ChainConfig } from '@/config/chains';

const IBC_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export interface IbcTransferParams {
  sourceChain: ChainConfig;
  senderAddress: string;
  receiverAddress: string;
  amount: string; // raw amount in uinit
  denom?: string;
  memo?: string;
}

/**
 * Build an IBC MsgTransfer EncodeObject for InterwovenKit requestTxBlock
 */
export function buildIbcTransferMsg(params: IbcTransferParams): EncodeObject {
  const {
    sourceChain,
    senderAddress,
    receiverAddress,
    amount,
    denom = INIT_DENOM,
    memo = '',
  } = params;

  const timeoutTimestamp = BigInt((Date.now() + IBC_TIMEOUT_MS) * 1_000_000);

  return {
    typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
    value: {
      sourcePort: 'transfer',
      sourceChannel: sourceChain.ibcChannelToL1,
      token: { denom, amount },
      sender: senderAddress,
      receiver: receiverAddress,
      timeoutHeight: { revisionNumber: BigInt(0), revisionHeight: BigInt(0) },
      timeoutTimestamp,
      memo,
    },
  };
}

/**
 * Build IBC MsgTransfer with Move hook memo for auto-staking on L1
 * This allows single-tx sweep+stake via IBC hooks middleware
 */
export function buildIbcTransferWithStakeMemo(
  params: IbcTransferParams,
  validatorAddress: string,
): EncodeObject {
  const memo = JSON.stringify({
    move: {
      message: {
        module_address: '0x1',
        module_name: 'cosmos',
        function_name: 'delegate',
        type_args: [],
        args: [validatorAddress],
      },
    },
  });

  return buildIbcTransferMsg({ ...params, memo });
}

/**
 * Build multiple IBC transfer messages for sweeping from multiple chains
 */
export function buildSweepMessages(
  chains: { chain: ChainConfig; amount: string; denom?: string }[],
  senderAddress: string,
  receiverAddress: string,
): { msgs: EncodeObject[]; chainId: string }[] {
  return chains.map(({ chain, amount, denom }) => ({
    msgs: [
      buildIbcTransferMsg({
        sourceChain: chain,
        senderAddress,
        receiverAddress,
        amount,
        denom,
      }),
    ],
    chainId: chain.chainId,
  }));
}
