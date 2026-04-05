'use client';

import { useState, useCallback } from 'react';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import type { DeliverTxResponse } from '@cosmjs/stargate';
import { buildIbcTransferMsg } from '@/services/ibc-transfer';
import { buildDelegateMsg, getTopValidator } from '@/services/staking';
import { TESTNET_L1, INIT_DENOM, type ChainConfig } from '@/config/chains';
import type { ChainBalance } from '@/services/balance';

export type ExecutionPhase = 'idle' | 'sweeping' | 'waiting_ibc' | 'staking' | 'done' | 'error';

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
}

export function useRealExecution() {
  const { requestTxBlock, waitForTxConfirmation, address, initiaAddress } = useInterwovenKit();
  const [state, setState] = useState<RealExecutionState>({
    phase: 'idle',
    steps: [],
    currentStep: -1,
    error: null,
    finalTxHash: null,
  });

  const updateStep = (index: number, update: Partial<ExecutionStep>) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => i === index ? { ...s, ...update } : s),
    }));
  };

  /**
   * Execute sweep: IBC transfer from each minitia to L1, then stake
   */
  const executeSweepAndStake = useCallback(async (
    sweepableChains: ChainBalance[],
    stakeAfterSweep: boolean,
  ) => {
    const receiverAddress = initiaAddress || address;
    if (!receiverAddress) {
      setState(prev => ({ ...prev, phase: 'error', error: 'No wallet connected' }));
      return;
    }

    // Build steps list
    const steps: ExecutionStep[] = [];

    for (const chainBalance of sweepableChains) {
      steps.push({
        label: `IBC Transfer ${chainBalance.totalInitHuman} INIT from ${chainBalance.chain.prettyName} → L1`,
        chainId: chainBalance.chain.chainId,
        status: 'pending',
      });
    }

    if (stakeAfterSweep) {
      steps.push({
        label: 'Stake INIT on Initia L1',
        chainId: TESTNET_L1.chainId,
        status: 'pending',
      });
    }

    setState({
      phase: 'sweeping',
      steps,
      currentStep: 0,
      error: null,
      finalTxHash: null,
    });

    // Execute IBC transfers sequentially
    let stepIndex = 0;
    for (const chainBalance of sweepableChains) {
      updateStep(stepIndex, { status: 'active' });

      try {
        // Find the INIT denom on this chain
        const initBalance = chainBalance.balances.find(
          b => b.denom === INIT_DENOM || b.denom.startsWith('l2/')
        );
        const denom = initBalance?.denom ?? INIT_DENOM;

        const msg = buildIbcTransferMsg({
          sourceChain: chainBalance.chain,
          senderAddress: address,
          receiverAddress,
          amount: chainBalance.totalInitAmount,
          denom,
        });

        const result: DeliverTxResponse = await requestTxBlock({
          messages: [msg],
          chainId: chainBalance.chain.chainId,
        });

        if (result.code !== 0) {
          throw new Error(`TX failed with code ${result.code}`);
        }

        updateStep(stepIndex, {
          status: 'complete',
          txHash: result.transactionHash,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
        updateStep(stepIndex, { status: 'failed', error: errorMsg });
        setState(prev => ({ ...prev, phase: 'error', error: errorMsg }));
        return;
      }

      stepIndex++;
    }

    // Wait for IBC to settle (brief delay for demo)
    if (stakeAfterSweep) {
      setState(prev => ({ ...prev, phase: 'waiting_ibc' }));
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Execute staking
      setState(prev => ({ ...prev, phase: 'staking', currentStep: stepIndex }));
      updateStep(stepIndex, { status: 'active' });

      try {
        const validator = await getTopValidator();

        // Fetch L1 balance to determine stake amount
        const l1BalanceRes = await fetch(
          `${TESTNET_L1.restUrl}/cosmos/bank/v1beta1/balances/${receiverAddress}`
        );
        const l1Data = await l1BalanceRes.json();
        const l1Init = (l1Data.balances ?? []).find(
          (b: { denom: string }) => b.denom === INIT_DENOM
        );
        const availableAmount = l1Init?.amount ?? '0';

        if (parseInt(availableAmount) <= 0) {
          // IBC might not have completed yet — stake whatever was swept
          const totalSwept = sweepableChains.reduce(
            (sum, c) => sum + parseInt(c.totalInitAmount),
            0
          );
          // Leave some for fees
          const stakeAmount = Math.max(0, totalSwept - 50000).toString();

          if (parseInt(stakeAmount) <= 0) {
            updateStep(stepIndex, { status: 'failed', error: 'No funds available to stake' });
            setState(prev => ({ ...prev, phase: 'error', error: 'No funds available to stake' }));
            return;
          }
        }

        // Leave 0.05 INIT for fees
        const stakeAmount = Math.max(0, parseInt(availableAmount) - 50000).toString();

        const msg = buildDelegateMsg(
          receiverAddress,
          validator.operatorAddress,
          stakeAmount,
        );

        const result = await requestTxBlock({
          messages: [msg],
          chainId: TESTNET_L1.chainId,
        });

        if (result.code !== 0) {
          throw new Error(`Staking TX failed with code ${result.code}`);
        }

        updateStep(stepIndex, {
          status: 'complete',
          txHash: result.transactionHash,
        });

        setState(prev => ({
          ...prev,
          phase: 'done',
          finalTxHash: result.transactionHash,
        }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Staking failed';
        updateStep(stepIndex, { status: 'failed', error: errorMsg });
        setState(prev => ({ ...prev, phase: 'error', error: errorMsg }));
      }
    } else {
      setState(prev => ({
        ...prev,
        phase: 'done',
        finalTxHash: prev.steps[prev.steps.length - 1]?.txHash ?? null,
      }));
    }
  }, [address, initiaAddress, requestTxBlock]);

  const reset = useCallback(() => {
    setState({
      phase: 'idle',
      steps: [],
      currentStep: -1,
      error: null,
      finalTxHash: null,
    });
  }, []);

  return {
    state,
    executeSweepAndStake,
    reset,
  };
}
