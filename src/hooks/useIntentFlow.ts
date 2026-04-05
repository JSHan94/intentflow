'use client';

import { useReducer, useCallback, useRef } from 'react';
import type { FlowState, FlowAction, FlowPhase, ExecutionStepStatus } from '@/types/flow';
import type { ExecutionPlan } from '@/types/plan';
import { parseIntent } from '@/parser/intent-parser';
import { generatePlans } from '@/planner/plan-generator';

const initialState: FlowState = {
  phase: 'input',
  phaseHistory: [],
  raw_intent: '',
  parse_result: null,
  edited_intent: null,
  plans: [],
  selected_plan: null,
  execution_steps: [],
  result: null,
};

function pushHistory(state: FlowState): FlowPhase[] {
  return [...state.phaseHistory, state.phase];
}

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'SUBMIT_INTENT':
      return { ...state, phase: 'parsing', phaseHistory: pushHistory(state), raw_intent: action.payload };

    case 'SET_PARSE_RESULT':
      return {
        ...state,
        phase: 'parsed',
        phaseHistory: pushHistory(state),
        parse_result: action.payload,
        edited_intent: action.payload.selected,
      };

    case 'EDIT_INTENT':
      return { ...state, edited_intent: action.payload };

    case 'CONFIRM_INTENT':
      return { ...state, phase: 'planning', phaseHistory: pushHistory(state) };

    case 'SET_PLANS':
      return { ...state, plans: action.payload, phase: 'planning' };

    case 'SELECT_PLAN': {
      const steps: ExecutionStepStatus[] = action.payload.steps.map(step => ({
        step,
        status: 'pending' as const,
      }));
      return {
        ...state,
        selected_plan: action.payload,
        execution_steps: steps,
        phase: 'executing',
        phaseHistory: pushHistory(state),
      };
    }

    case 'UPDATE_STEP': {
      const newSteps = [...state.execution_steps];
      newSteps[action.payload.index] = {
        ...newSteps[action.payload.index],
        status: action.payload.status,
      };
      return { ...state, execution_steps: newSteps };
    }

    case 'SET_RESULT':
      return { ...state, result: action.payload, phase: 'result', phaseHistory: pushHistory(state) };

    case 'BACK': {
      const history = [...state.phaseHistory];
      // Pop back to the last meaningful phase (skip 'parsing' since it's transient)
      let prevPhase: FlowPhase | undefined;
      while (history.length > 0) {
        prevPhase = history.pop();
        if (prevPhase && prevPhase !== 'parsing') break;
      }
      if (!prevPhase || prevPhase === state.phase) {
        return { ...initialState };
      }
      return {
        ...state,
        phase: prevPhase,
        phaseHistory: history,
        // Clear forward state based on where we're going back to
        ...(prevPhase === 'input' ? { parse_result: null, edited_intent: null, plans: [], selected_plan: null, execution_steps: [], result: null } : {}),
        ...(prevPhase === 'parsed' ? { plans: [], selected_plan: null, execution_steps: [], result: null } : {}),
        ...(prevPhase === 'planning' ? { selected_plan: null, execution_steps: [], result: null } : {}),
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useIntentFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const executionRef = useRef<NodeJS.Timeout[]>([]);

  const submitIntent = useCallback((input: string) => {
    dispatch({ type: 'SUBMIT_INTENT', payload: input });

    setTimeout(() => {
      const result = parseIntent(input);
      dispatch({ type: 'SET_PARSE_RESULT', payload: result });
    }, 1800);
  }, []);

  const confirmIntent = useCallback(() => {
    dispatch({ type: 'CONFIRM_INTENT' });

    if (state.edited_intent) {
      setTimeout(() => {
        const result = generatePlans(state.edited_intent!);
        dispatch({ type: 'SET_PLANS', payload: result.plans });
      }, 800);
    }
  }, [state.edited_intent]);

  const selectPlan = useCallback((plan: ExecutionPlan) => {
    dispatch({ type: 'SELECT_PLAN', payload: plan });

    const timers: NodeJS.Timeout[] = [];
    plan.steps.forEach((step, i) => {
      timers.push(setTimeout(() => {
        dispatch({ type: 'UPDATE_STEP', payload: { index: i, status: 'active' } });
      }, i * 1500 + 300));
      timers.push(setTimeout(() => {
        dispatch({ type: 'UPDATE_STEP', payload: { index: i, status: 'complete' } });
      }, (i + 1) * 1500));
    });
    timers.push(setTimeout(() => {
      dispatch({
        type: 'SET_RESULT',
        payload: {
          success: true,
          final_state: `Assets delivered to ${plan.steps[plan.steps.length - 1]?.destination_chain ?? 'destination'}`,
          total_cost_usd: plan.total_estimated_fee_usd,
          total_time_seconds: plan.total_estimated_time_seconds,
          steps_completed: plan.steps.length,
          total_steps: plan.steps.length,
        },
      });
    }, plan.steps.length * 1500 + 600));
    executionRef.current = timers;
  }, []);

  const goBack = useCallback(() => {
    for (const timer of executionRef.current) clearTimeout(timer);
    executionRef.current = [];
    dispatch({ type: 'BACK' });
  }, []);

  const reset = useCallback(() => {
    for (const timer of executionRef.current) clearTimeout(timer);
    executionRef.current = [];
    dispatch({ type: 'RESET' });
  }, []);

  return { state, dispatch, submitIntent, confirmIntent, selectPlan, goBack, reset };
}
