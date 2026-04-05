'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { Header } from '@/components/layout/Header';
import { PhaseBar } from '@/components/ui/PhaseBar';
import { JennieIcon } from '@/components/ui/JennieIcon';
import { NetworkMap } from '@/components/network/NetworkMap';
import { IntentInput } from '@/components/intent/IntentInput';
import { QuickActions } from '@/components/intent/QuickActions';
import { ParseAnimation } from '@/components/intent/ParseAnimation';
import { ParsedFields } from '@/components/parsed/ParsedFields';
import { BalanceOverview } from '@/components/parsed/BalanceOverview';
import { PlanCards } from '@/components/plan/PlanCards';
import { RealExecutionView } from '@/components/execution/RealExecutionView';
import { ResultSummary } from '@/components/result/ResultSummary';
import { RecentHistory } from '@/components/history/RecentHistory';
import { useIntentFlow } from '@/hooks/useIntentFlow';
import { useMultiChainBalances } from '@/hooks/useMultiChainBalances';
import { useRealExecution } from '@/hooks/useRealExecution';
import type { TestnetChain } from '@/config/testnet-chains';
import type { HistoryEntry, FlowPhase } from '@/types/flow';

function saveToHistory(entry: HistoryEntry) {
  try {
    const raw = localStorage.getItem('intentflow_history');
    const history: HistoryEntry[] = raw ? JSON.parse(raw) : [];
    history.unshift(entry);
    localStorage.setItem('intentflow_history', JSON.stringify(history.slice(0, 50)));
  } catch { /* noop */ }
}

const transition = { duration: 0.15, ease: 'easeOut' as const };

export default function Home() {
  const router = useRouter();
  const { isConnected, openConnect, address } = useInterwovenKit();
  const { state, submitIntent, confirmIntent, selectPlan, reset, dispatch } = useIntentFlow();
  const { balances, sweepableChains, isLoading: balancesLoading, refetch: refetchBalances } = useMultiChainBalances(
    isConnected ? address : undefined
  );
  const { state: execState, executeSweepAndStake, reset: resetExec } = useRealExecution();

  const handleSelectPlan = (plan: Parameters<typeof selectPlan>[0]) => {
    selectPlan(plan);
    const shouldStake = state.edited_intent?.action_type === 'sweep' ||
      state.edited_intent?.action_type === 'consolidate';
    executeSweepAndStake(sweepableChains, shouldStake);
  };

  useEffect(() => {
    if (execState.phase === 'done' && state.selected_plan) {
      saveToHistory({
        id: crypto.randomUUID(),
        raw_intent: state.raw_intent,
        plan_type: state.selected_plan.label,
        result: {
          success: true,
          final_state: 'Assets swept and staked on Initia L1',
          total_cost_usd: state.selected_plan.total_estimated_fee_usd,
          total_time_seconds: state.selected_plan.total_estimated_time_seconds,
          steps_completed: execState.steps.filter(s => s.status === 'complete').length,
          total_steps: execState.steps.length,
        },
        timestamp: Date.now(),
      });
    }
  }, [execState.phase, state.selected_plan, state.raw_intent, execState.steps]);

  const handleReset = () => {
    reset();
    resetExec();
    refetchBalances();
  };

  const handleNetworkAction = (action: string, chain: TestnetChain) => {
    if (action === 'explorer') {
      window.open(`${chain.explorerUrl}/address/${address}`, '_blank');
      return;
    }
    if (action === 'sweep') {
      submitIntent(`Sweep all INIT from ${chain.prettyName} to Initia L1`);
    } else if (action === 'stake') {
      submitIntent('Stake my INIT on Initia L1');
    } else if (action === 'bridge') {
      submitIntent(`Bridge assets to ${chain.prettyName}`);
    }
  };

  const handleQuickAction = (intent: string) => {
    submitIntent(intent);
  };

  const showRealExecution = execState.phase !== 'idle';

  let displayPhase: FlowPhase = state.phase;
  if (showRealExecution && execState.phase !== 'done') displayPhase = 'executing';
  if (execState.phase === 'done') displayPhase = 'result';

  // Input phase = dashboard view
  const showDashboard = state.phase === 'input' && !showRealExecution;

  return (
    <div className="flex flex-col min-h-screen">
      <Header onHistoryClick={() => router.push('/history')} />

      <main className="flex-1 flex flex-col px-4 pt-20 pb-8">
        {/* Phase bar — shown during non-dashboard phases */}
        {isConnected && !showDashboard && (
          <div className="w-full max-w-2xl mx-auto mb-6 mt-4">
            <PhaseBar currentPhase={displayPhase} />
          </div>
        )}

        {/* DASHBOARD VIEW — Input phase */}
        {isConnected && showDashboard && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="w-full max-w-2xl mx-auto space-y-5 mt-4"
          >
            {/* Network Map */}
            <NetworkMap
              balances={balances}
              isConnected={isConnected}
              onQuickAction={handleNetworkAction}
            />

            {/* Intent Input */}
            <IntentInput onSubmit={submitIntent} />

            {/* Quick Actions */}
            <QuickActions onAction={handleQuickAction} />

            {/* Recent History */}
            <RecentHistory />
          </motion.div>
        )}

        {/* NOT CONNECTED — welcome with Jennie */}
        {!isConnected && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              key="connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
              className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto text-center"
            >
              {/* Network map preview (not connected) */}
              <NetworkMap
                balances={[]}
                isConnected={false}
                onQuickAction={() => openConnect()}
              />

              <h1 className="font-mono text-xl font-black uppercase tracking-[3px]">
                Welcome to IntentFlow
              </h1>
              <p className="font-mono text-xs text-[#999] max-w-sm">
                Describe what you want to do across Initia rollups in natural language. Connect your wallet to get started.
              </p>
              <button
                onClick={openConnect}
                className="px-6 py-3 border-[3px] border-black bg-[#FF5733] text-white font-mono text-[11px] font-black uppercase tracking-[2px] shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                Connect Wallet →
              </button>
            </motion.div>
          </div>
        )}

        {/* NON-DASHBOARD PHASES */}
        {isConnected && !showDashboard && (
          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {/* Parsing */}
              {state.phase === 'parsing' && !showRealExecution && (
                <motion.div
                  key="parsing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                  className="w-full"
                >
                  <ParseAnimation rawIntent={state.raw_intent} />
                </motion.div>
              )}

              {/* Parsed */}
              {state.phase === 'parsed' && state.parse_result && state.edited_intent && !showRealExecution && (
                <motion.div
                  key="parsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                  className="w-full"
                >
                  <ParsedFields
                    intent={state.edited_intent}
                    ambiguities={state.parse_result.ambiguities}
                    onConfirm={confirmIntent}
                    onEdit={(intent) => dispatch({ type: 'EDIT_INTENT', payload: intent })}
                  />
                  <div className="max-w-2xl mx-auto mt-5">
                    <BalanceOverview balances={balances} isLoading={balancesLoading} />
                  </div>
                </motion.div>
              )}

              {/* Planning */}
              {state.phase === 'planning' && !showRealExecution && (
                <motion.div
                  key="planning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                  className="w-full"
                >
                  {state.plans.length > 0 ? (
                    <PlanCards plans={state.plans} onSelect={handleSelectPlan} />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <JennieIcon expression="thinking" size="lg" />
                      <div className="flex items-center gap-2 font-mono text-xs text-[#999]">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
                        Generating execution plans...
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Executing */}
              {showRealExecution && execState.phase !== 'done' && (
                <motion.div
                  key="real-executing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                  className="w-full"
                >
                  <RealExecutionView
                    steps={execState.steps}
                    phase={execState.phase}
                    error={execState.error}
                  />
                </motion.div>
              )}

              {/* Result */}
              {execState.phase === 'done' && state.selected_plan && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transition}
                  className="w-full"
                >
                  <div className="flex justify-center mb-4">
                    <JennieIcon expression="happy" size="lg" />
                  </div>
                  <ResultSummary
                    result={{
                      success: true,
                      final_state: 'Assets swept and staked on Initia L1',
                      total_cost_usd: state.selected_plan.total_estimated_fee_usd,
                      total_time_seconds: state.selected_plan.total_estimated_time_seconds,
                      steps_completed: execState.steps.filter(s => s.status === 'complete').length,
                      total_steps: execState.steps.length,
                    }}
                    plan={state.selected_plan}
                    rawIntent={state.raw_intent}
                    onNewIntent={handleReset}
                  />
                  <div className="max-w-lg mx-auto mt-4 space-y-2">
                    {execState.steps.filter(s => s.txHash).map((step, i) => (
                      <a
                        key={i}
                        href={`https://scan.testnet.initia.xyz/txs/${step.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-md border-[1.5px] border-[#D4D4D4] bg-white font-mono text-[10px] text-[#0D9488] hover:border-[#0D9488] transition-colors"
                      >
                        <span className="text-[#6B6B6B]">{step.label.split(' ').slice(0, 3).join(' ')}</span>
                        <span className="ml-auto">{step.txHash?.slice(0, 10)}...{step.txHash?.slice(-6)}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="py-3 text-center font-mono text-[10px] text-[#999] border-t-2 border-[#E5E5E5]">
        Built for INITIATE Hackathon &middot; Cross-rollup intent execution on Initia
      </footer>
    </div>
  );
}
