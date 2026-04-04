import type { ParsedIntent, IntentParseResult } from './intent';
import type { ExecutionPlan, PlanStep } from './plan';

export type FlowPhase = 'input' | 'parsing' | 'parsed' | 'planning' | 'executing' | 'result';

export interface ExecutionStepStatus {
  step: PlanStep;
  status: 'pending' | 'active' | 'complete' | 'failed';
}

export interface ExecutionResult {
  success: boolean;
  final_state: string;
  total_cost_usd: number;
  total_time_seconds: number;
  steps_completed: number;
  total_steps: number;
}

export interface HistoryEntry {
  id: string;
  raw_intent: string;
  plan_type: string;
  result: ExecutionResult;
  timestamp: number;
}

export interface FlowState {
  phase: FlowPhase;
  raw_intent: string;
  parse_result: IntentParseResult | null;
  edited_intent: ParsedIntent | null;
  plans: ExecutionPlan[];
  selected_plan: ExecutionPlan | null;
  execution_steps: ExecutionStepStatus[];
  result: ExecutionResult | null;
}

export type FlowAction =
  | { type: 'SUBMIT_INTENT'; payload: string }
  | { type: 'SET_PARSE_RESULT'; payload: IntentParseResult }
  | { type: 'EDIT_INTENT'; payload: ParsedIntent }
  | { type: 'CONFIRM_INTENT' }
  | { type: 'SET_PLANS'; payload: ExecutionPlan[] }
  | { type: 'SELECT_PLAN'; payload: ExecutionPlan }
  | { type: 'UPDATE_STEP'; payload: { index: number; status: ExecutionStepStatus['status'] } }
  | { type: 'SET_RESULT'; payload: ExecutionResult }
  | { type: 'RESET' };
