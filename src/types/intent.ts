export type ActionType = 'sweep' | 'consolidate' | 'bridge' | 'move' | 'stake' | 'collect' | 'show_options';

export type FeePreference = 'cheapest' | 'fastest' | 'balanced' | 'any';

export interface AssetFilter {
  symbol: string;
  denom?: string;
}

export interface ChainReference {
  chain_name: string | null;
  qualifier: 'specific' | 'all' | 'here' | 'unresolved';
}

export interface Exclusion {
  type: 'chain' | 'asset';
  value: string;
}

export interface ParsedIntent {
  action_type: ActionType;
  assets: AssetFilter[];
  source: ChainReference;
  destination: ChainReference;
  fee_preference: FeePreference;
  min_net_output: number | null;
  exclusions: Exclusion[];
  allow_partial_execution: boolean;
  raw_input: string;
  confidence: number;
}

export interface IntentParseResult {
  candidates: ParsedIntent[];
  ambiguities: AmbiguityFlag[];
  selected: ParsedIntent;
}

export interface AmbiguityFlag {
  field: string;
  reason: string;
  alternatives: string[];
}
