'use client';

import { useReducer, useCallback, useRef } from 'react';
import type { FlowState, FlowAction, ExecutionStepStatus } from '@/types/flow';
import type { ExecutionPlan } from '@/types/plan';
import { parseIntent } from '@/parser/intent-parser';
import { generatePlans } from '@/planner/plan-generator';

const initialState: FlowState = {
  phase: 'input',
  raw_intent: '',
  parse_result: null,
  edited_intent: null,
  plans: [],
  selected_plan: null,
  execution_steps: [],
  result: null,
};

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'SUBMIT_INTENT':
      return { ...state, phase: 'parsing', raw_intent: action.payload };

    case 'SET_PARSE_RESULT':
      return {
        ...state,
        phase: 'parsed',
        parse_result: action.payload,
        edited_intent: action.payload.selected,
      };

    case 'EDIT_INTENT':
      return { ...state, edited_intent: action.payload };

    case 'CONFIRM_INTENT':
      return { ...state, phase: 'planning' };

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
      return { ...state, result: action.payload, phase: 'result' };

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

    // Simulate parsing delay for animation
    setTimeout(() => {
      const result = parseIntent(input);
      dispatch({ type: 'SET_PARSE_RESULT', payload: result });
    }, 1800);
  }, []);

  const confirmIntent = useCallback(() => {
    dispatch({ type: 'CONFIRM_INTENT' });

    if (state.edited_intent) {
      // Simulate planning delay
      setTimeout(() => {
        const result = generatePlans(state.edited_intent!);
        dispatch({ type: 'SET_PLANS', payload: result.plans });
      }, 800);
    }
  }, [state.edited_intent]);

  const selectPlan = useCallback((plan: ExecutionPlan) => {
    dispatch({ type: 'SELECT_PLAN', payload: plan });

    // Simulate step-by-step execution
    const timers: NodeJS.Timeout[] = [];

    plan.steps.forEach((step, i) => {
      // Set active
      const activeTimer = setTimeout(() => {
        dispatch({ type: 'UPDATE_STEP', payload: { index: i, status: 'active' } });
      }, i * 1500 + 300);
      timers.push(activeTimer);

      // Set complete
      const completeTimer = setTimeout(() => {
        dispatch({ type: 'UPDATE_STEP', payload: { index: i, status: 'complete' } });
      }, (i + 1) * 1500);
      timers.push(completeTimer);
    });

    // Set final result
    const resultTimer = setTimeout(() => {
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
    }, plan.steps.length * 1500 + 600);
    timers.push(resultTimer);

    executionRef.current = timers;
  }, []);

  const reset = useCallback(() => {
    // Clean up timers
    for (const timer of executionRef.current) {
      clearTimeout(timer);
    }
    executionRef.current = [];
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    dispatch,
    submitIntent,
    confirmIntent,
    selectPlan,
    reset,
  };
}
