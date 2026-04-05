'use client';

import { useCallback, useState } from 'react';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import type { EncodeObject } from '@cosmjs/proto-signing';
import type { DeliverTxResponse } from '@cosmjs/stargate';
import { getChainConfig, INIT_DENOM, TESTNET_L1, type ChainConfig } from '@/config/chains';
import { fetchDenomBalance } from '@/services/balance';
import { buildOpBridgeDepositMsg, computeMaxSpendableAmount, simulateFeePlan, waitForBalanceIncrease } from '@/services/execution';
import { buildIbcTransferMsg } from '@/services/ibc-transfer';
import { buildDelegateMsg, getTopValidator } from '@/services/staking';
import type { ExecutionResult } from '@/types/flow';
import type { ExecutionPlan, PlanStep } from '@/types/plan';

const INIT_PRICE_USD = 0.85;

export type ExecutionPhase =
  | 'idle'
  | 'sweeping'
  | 'bridging'
  | 'waiting_ibc'
  | 'staking'
  | 'done'
  | 'error';

export interface ExecutionStep {
  label: string;
  chainId: string;
  status: 'pending' | 'active' | 'complete' | 'failed';
  txHash?: string;
  error?: string;
}

export interface RealExecutionState {
  phase: ExecutionPhase;
  steps: ExecutionStep[];
  currentStep: number;
  error: string | null;
  finalTxHash: string | null;
  result: ExecutionResult | null;
}

function humanizeStep(step: PlanStep): string {
  const source = getChainConfig(step.source_chain, 'testnet');
  const destination = getChainConfig(step.destination_chain, 'testnet');

  switch (step.operation) {
    case 'ibc_transfer':
      return `Sweep ${step.amount} from ${source?.prettyName ?? step.source_chain} → ${destination?.prettyName ?? step.destination_chain}`;
    case 'op_bridge_deposit':
      return `Bridge ${step.amount} from ${source?.prettyName ?? step.source_chain} → ${destination?.prettyName ?? step.destination_chain}`;
    case 'stake':
      return `Stake ${step.amount} on ${destination?.prettyName ?? step.destination_chain}`;
    default:
      return `${step.operation} ${step.amount}`;
  }
}

function phaseForStep(step: PlanStep): ExecutionPhase {
  if (step.operation === 'stake') return 'staking';
  if (step.operation === 'op_bridge_deposit') return 'bridging';
  return 'sweeping';
}

function ensureTxSuccess(result: DeliverTxResponse): DeliverTxResponse {
  if (result.code !== 0) {
    throw new Error(result.rawLog || `Transaction failed with code ${result.code}`);
  }
  return result;
}

export function useRealExecution() {
  const {
    initiaAddress,
    autoSign,
    estimateGas,
    requestTxBlock,
    submitTxBlock,
  } = useInterwovenKit();
  const [state, setState] = useState<RealExecutionState>({
    phase: 'idle',
    steps: [],
    currentStep: -1,
    error: null,
    finalTxHash: null,
    result: null,
  });

  const walletAddress = initiaAddress || undefined;

  const updateStep = useCallback((index: number, update: Partial<ExecutionStep>) => {
    setState((prev) => ({
      ...prev,
      steps: prev.steps.map((step, stepIndex) => stepIndex === index ? { ...step, ...update } : step),
    }));
  }, []);

  const broadcastTx = useCallback(async (params: {
    chain: ChainConfig;
    messages: EncodeObject[];
    feePlan: Awaited<ReturnType<typeof simulateFeePlan>>;
  }) => {
    const { chain, messages, feePlan } = params;

    if (autoSign.isEnabledByChain[chain.chainId]) {
      return ensureTxSuccess(await submitTxBlock({
        chainId: chain.chainId,
        messages,
        fee: feePlan.fee,
      }));
    }

    return ensureTxSuccess(await requestTxBlock({
      chainId: chain.chainId,
      messages,
      gas: feePlan.gasLimit,
      gasAdjustment: feePlan.gasAdjustment,
      gasPrices: feePlan.gasPrices,
    }));
  }, [autoSign.isEnabledByChain, requestTxBlock, submitTxBlock]);

  const executeStep = useCallback(async (step: PlanStep) => {
    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    const sourceChain = getChainConfig(step.source_chain, 'testnet');
    const destinationChain = getChainConfig(step.destination_chain, 'testnet');

    if (!sourceChain || !destinationChain) {
      throw new Error(`Unsupported route: ${step.source_chain} → ${step.destination_chain}`);
    }

    if (step.operation === 'ibc_transfer') {
      const sourceBalance = await fetchDenomBalance(sourceChain, walletAddress, INIT_DENOM);
      const destinationBalance = await fetchDenomBalance(destinationChain, walletAddress, INIT_DENOM);
      const simulationMsg = buildIbcTransferMsg({
        sourceChain,
        senderAddress: walletAddress,
        receiverAddress: walletAddress,
        amount: sourceBalance,
        denom: INIT_DENOM,
      });
      const feePlan = await simulateFeePlan({
        chain: sourceChain,
        messages: [simulationMsg],
        estimateGas,
      });
      const transferAmount = computeMaxSpendableAmount(sourceBalance, feePlan.feeAmount);
      if (BigInt(transferAmount) <= BigInt(0)) {
        throw new Error(`Not enough ${sourceChain.prettyName} INIT to cover gas`);
      }

      const tx = await broadcastTx({
        chain: sourceChain,
        messages: [buildIbcTransferMsg({
          sourceChain,
          senderAddress: walletAddress,
          receiverAddress: walletAddress,
          amount: transferAmount,
          denom: INIT_DENOM,
        })],
        feePlan,
      });

      setState((prev) => ({ ...prev, phase: 'waiting_ibc' }));
      await waitForBalanceIncrease({
        chain: destinationChain,
        address: walletAddress,
        baselineAmount: destinationBalance,
        expectedIncrease: transferAmount,
      });

      return { tx, feeAmount: feePlan.feeAmount };
    }

    if (step.operation === 'op_bridge_deposit') {
      const sourceBalance = await fetchDenomBalance(sourceChain, walletAddress, INIT_DENOM);
      const destinationBalance = await fetchDenomBalance(destinationChain, walletAddress, INIT_DENOM);
      const simulationMsg = buildOpBridgeDepositMsg({
        senderAddress: walletAddress,
        receiverAddress: walletAddress,
        amount: sourceBalance,
        bridgeId: destinationChain.bridgeId,
      });
      const feePlan = await simulateFeePlan({
        chain: sourceChain,
        messages: [simulationMsg],
        estimateGas,
      });
      const depositAmount = computeMaxSpendableAmount(sourceBalance, feePlan.feeAmount);
      if (BigInt(depositAmount) <= BigInt(0)) {
        throw new Error('Not enough Initia L1 INIT to cover bridge gas');
      }

      const tx = await broadcastTx({
        chain: sourceChain,
        messages: [buildOpBridgeDepositMsg({
          senderAddress: walletAddress,
          receiverAddress: walletAddress,
          amount: depositAmount,
          bridgeId: destinationChain.bridgeId,
        })],
        feePlan,
      });

      await waitForBalanceIncrease({
        chain: destinationChain,
        address: walletAddress,
        baselineAmount: destinationBalance,
        expectedIncrease: depositAmount,
      });

      return { tx, feeAmount: feePlan.feeAmount };
    }

    if (step.operation === 'stake') {
      const validator = await getTopValidator();
      const l1Balance = await fetchDenomBalance(TESTNET_L1, walletAddress, INIT_DENOM);
      const simulationMsg = buildDelegateMsg(walletAddress, validator.operatorAddress, l1Balance);
      const feePlan = await simulateFeePlan({
        chain: TESTNET_L1,
        messages: [simulationMsg],
        estimateGas,
      });
      const stakeAmount = computeMaxSpendableAmount(l1Balance, feePlan.feeAmount);
      if (BigInt(stakeAmount) <= BigInt(0)) {
        throw new Error('Not enough Initia L1 INIT to cover staking gas');
      }

      const tx = await broadcastTx({
        chain: TESTNET_L1,
        messages: [buildDelegateMsg(walletAddress, validator.operatorAddress, stakeAmount)],
        feePlan,
      });

      return { tx, feeAmount: feePlan.feeAmount };
    }

    throw new Error(`Unsupported operation: ${step.operation}`);
  }, [broadcastTx, estimateGas, walletAddress]);

  const executePlan = useCallback(async (plan: ExecutionPlan) => {
    if (!walletAddress) {
      setState((prev) => ({ ...prev, phase: 'error', error: 'No wallet connected' }));
      return;
    }
    if (plan.steps.length === 0) {
      setState((prev) => ({ ...prev, phase: 'error', error: 'No executable steps in selected plan' }));
      return;
    }

    const steps: ExecutionStep[] = plan.steps.map((step) => ({
      label: humanizeStep(step),
      chainId: getChainConfig(step.source_chain, 'testnet')?.chainId ?? TESTNET_L1.chainId,
      status: 'pending',
    }));

    setState({
      phase: phaseForStep(plan.steps[0]),
      steps,
      currentStep: 0,
      error: null,
      finalTxHash: null,
      result: null,
    });

    const startedAt = Date.now();
    let totalFeeUsd = 0;
    let finalTxHash: string | null = null;

    for (const [index, step] of plan.steps.entries()) {
      setState((prev) => ({
        ...prev,
        phase: phaseForStep(step),
        currentStep: index,
      }));
      updateStep(index, { status: 'active' });

      try {
        const { tx, feeAmount } = await executeStep(step);
        finalTxHash = tx.transactionHash;
        totalFeeUsd += (Number(feeAmount) / 1_000_000) * INIT_PRICE_USD;
        updateStep(index, { status: 'complete', txHash: tx.transactionHash });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Execution failed';
        updateStep(index, { status: 'failed', error: message });
        setState((prev) => ({
          ...prev,
          phase: 'error',
          error: message,
        }));
        return;
      }
    }

    const lastStep = plan.steps[plan.steps.length - 1];
    const result: ExecutionResult = {
      success: true,
      final_state: lastStep?.operation === 'stake'
        ? 'INIT staked on Initia L1'
        : `INIT delivered to ${getChainConfig(lastStep?.destination_chain ?? 'initia_l1', 'testnet')?.prettyName ?? 'destination'}`,
      total_cost_usd: Number(totalFeeUsd.toFixed(2)),
      total_time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      steps_completed: plan.steps.length,
      total_steps: plan.steps.length,
    };

    setState((prev) => ({
      ...prev,
      phase: 'done',
      finalTxHash,
      result,
    }));
  }, [executeStep, updateStep, walletAddress]);

  const reset = useCallback(() => {
    setState({
      phase: 'idle',
      steps: [],
      currentStep: -1,
      error: null,
      finalTxHash: null,
      result: null,
    });
  }, []);

  return {
    state,
    executePlan,
    reset,
  };
}
