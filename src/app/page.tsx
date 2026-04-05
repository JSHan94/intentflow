'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { Header } from '@/components/layout/Header';
import { PhaseBar } from '@/components/ui/PhaseBar';
import { JennieIcon } from '@/components/ui/JennieIcon';
import { NetworkMap } from '@/components/network/NetworkMap';
import { ChainDetailPanel } from '@/components/network/ChainDetailPanel';
import { IntentInput } from '@/components/intent/IntentInput';
import { QuickActions } from '@/components/intent/QuickActions';
import { ParseAnimation } from '@/components/intent/ParseAnimation';
import { ParsedFields } from '@/components/parsed/ParsedFields';
import { PlanCards } from '@/components/plan/PlanCards';
import { RealExecutionView } from '@/components/execution/RealExecutionView';
import { ResultSummary } from '@/components/result/ResultSummary';
import { RecentHistory } from '@/components/history/RecentHistory';
import { useIntentFlow } from '@/hooks/useIntentFlow';
import { useMultiChainBalances } from '@/hooks/useMultiChainBalances';
import { useRealExecution } from '@/hooks/useRealExecution';
import { getChainConfig, type NetworkType } from '@/config/chains';
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
  const { isConnected, openConnect, initiaAddress } = useInterwovenKit();
  const [network, setNetwork] = useState<NetworkType>('mainnet');
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const walletAddress = initiaAddress || undefined;
  const { balances, refetch: refetchBalances } = useMultiChainBalances(
    isConnected ? walletAddress : undefined,
    network,
  );
  const { state, submitIntent, confirmIntent, selectPlan, goBack, reset, dispatch } = useIntentFlow(balances, network);
  const { state: execState, executePlan, reset: resetExec } = useRealExecution();

  const handleSelectPlan = (plan: Parameters<typeof selectPlan>[0]) => {
    selectPlan(plan);
    executePlan(plan);
  };

  useEffect(() => {
    if (execState.phase === 'done' && state.selected_plan && execState.result) {
      saveToHistory({
        id: crypto.randomUUID(),
        raw_intent: state.raw_intent,
        plan_type: state.selected_plan.label,
        result: execState.result,
        timestamp: Date.now(),
      });
      refetchBalances();
    }
  }, [execState.phase, execState.result, refetchBalances, state.raw_intent, state.selected_plan]);

  const handleReset = () => {
    reset();
    resetExec();
    refetchBalances();
  };

  const handleActionIntent = (intent: string) => {
    setSelectedChain(null);
    submitIntent(intent);
  };

  const handleGoBack = () => {
    if (execState.phase !== 'idle') resetExec();
    goBack();
  };

  const showRealExecution = execState.phase !== 'idle';
  let displayPhase: FlowPhase = state.phase;
  if (showRealExecution && execState.phase !== 'done') displayPhase = 'executing';
  if (execState.phase === 'done') displayPhase = 'result';
  const showDashboard = state.phase === 'input' && !showRealExecution;

  const selectedChainConfig = selectedChain ? getChainConfig(selectedChain) : null;
  const selectedChainBalance = selectedChain ? balances.find(b => b.chain.chainName === selectedChain) ?? null : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onHistoryClick={() => router.push('/history')}
        network={network}
        onNetworkToggle={() => { setNetwork(n => n === 'mainnet' ? 'testnet' : 'mainnet'); setSelectedChain(null); }}
      />

      <main className="flex-1 flex flex-col px-4 pt-20 pb-8">
        {/* Phase bar */}
        {isConnected && !showDashboard && (
          <div className="w-full max-w-3xl mx-auto mb-6 mt-4">
            <PhaseBar currentPhase={displayPhase} onBack={handleGoBack} />
          </div>
        )}

        {/* DASHBOARD — split layout: map left, detail right */}
        {isConnected && showDashboard && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="w-full max-w-5xl mx-auto mt-4 space-y-5"
          >
            <div className="flex gap-5">
              {/* Left: Network Map */}
              <div className="flex-1 min-w-0">
                <NetworkMap
                  balances={balances}
                  isConnected={isConnected}
                  network={network}
                  selectedChain={selectedChain}
                  onChainSelect={setSelectedChain}
                />
              </div>

              {/* Right: Chain Detail Panel */}
              <div className="w-[280px] shrink-0">
                {selectedChainConfig ? (
                  <ChainDetailPanel
                    chain={selectedChainConfig}
                    balance={selectedChainBalance}
                    onAction={handleActionIntent}
                    onClose={() => setSelectedChain(null)}
                  />
                ) : (
                  <div className="border-[3px] border-black bg-white shadow-[6px_6px_0_#000] p-5 flex flex-col items-center justify-center min-h-[300px] text-center">
                    <JennieIcon expression="neutral" size="lg" />
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-[#999] mt-3">
                      Select a rollup<br />to see details
                    </p>
                  </div>
                )}
              </div>
            </div>

            <IntentInput onSubmit={submitIntent} />
            <QuickActions onAction={handleActionIntent} />
            <RecentHistory />
          </motion.div>
        )}

        {/* NOT CONNECTED */}
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
              <NetworkMap
                balances={[]}
                isConnected={false}
                network={network}
                selectedChain={null}
                onChainSelect={() => {}}
              />
              <h1 className="font-mono text-xl font-black uppercase tracking-[3px]">Welcome to IntentFlow</h1>
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
              {state.phase === 'parsing' && !showRealExecution && (
                <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} className="w-full">
                  <ParseAnimation rawIntent={state.raw_intent} />
                </motion.div>
              )}

              {state.phase === 'parsed' && state.parse_result && state.edited_intent && !showRealExecution && (
                <motion.div key="parsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} className="w-full">
                  <ParsedFields
                    intent={state.edited_intent}
                    ambiguities={state.parse_result.ambiguities}
                    balances={balances}
                    onConfirm={confirmIntent}
                    onEdit={(intent) => dispatch({ type: 'EDIT_INTENT', payload: intent })}
                  />
                </motion.div>
              )}

              {state.phase === 'planning' && !showRealExecution && (
                <motion.div key="planning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} className="w-full">
                  {state.plans.length > 0 ? (
                    <PlanCards plans={state.plans} onSelect={handleSelectPlan} />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <JennieIcon expression="thinking" size="lg" />
                      <div className="flex items-center gap-2 font-mono text-xs text-[#999]">
                        <span className="inline-block w-1.5 h-1.5 bg-[#CCFF00] animate-pulse" />
                        Generating execution plans...
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {showRealExecution && execState.phase !== 'done' && (
                <motion.div key="real-executing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} className="w-full">
                  <RealExecutionView steps={execState.steps} phase={execState.phase} error={execState.error} />
                </motion.div>
              )}

              {execState.phase === 'done' && state.selected_plan && execState.result && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} className="w-full">
                  <div className="flex justify-center mb-4">
                    <JennieIcon expression="happy" size="lg" />
                  </div>
                  <ResultSummary
                    result={execState.result}
                    plan={state.selected_plan}
                    rawIntent={state.raw_intent}
                    onNewIntent={handleReset}
                  />
                  <div className="max-w-lg mx-auto mt-4 space-y-2">
                    {execState.steps.filter(s => s.txHash).map((step, i) => (
                      <a key={i}
                        href={`https://scan.testnet.initia.xyz/txs/${step.txHash}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 border-[3px] border-black bg-white font-mono text-[10px] text-[#FF5733] shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] transition-all"
                      >
                        <span className="text-[#999]">{step.label.split(' ').slice(0, 3).join(' ')}</span>
                        <span className="ml-auto font-black">{step.txHash?.slice(0, 10)}...{step.txHash?.slice(-6)} ↗</span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="py-3 text-center font-mono text-[10px] text-[#999] border-t-[3px] border-black">
        Built for INITIATE Hackathon &middot; Cross-rollup intent execution on Initia
      </footer>
    </div>
  );
}
