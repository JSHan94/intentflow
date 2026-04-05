import type { ParsedIntent, IntentParseResult, AmbiguityFlag } from '@/types/intent';
import { tokenize } from './tokenizer';
import {
  extractAction,
  extractAssets,
  extractAmount,
  extractSource,
  extractDestination,
  extractFeePreference,
  extractMinNetOutput,
  extractExclusions,
  extractPartialExecution,
} from './extractors';

function computeConfidence(intent: ParsedIntent, actionMatched: boolean): number {
  let confidence = 0.5;

  if (actionMatched) confidence += 0.15;
  if (intent.assets.length > 0 && intent.assets[0].symbol !== 'ALL') confidence += 0.10;
  if (intent.source.qualifier === 'specific' || intent.source.qualifier === 'all') confidence += 0.10;
  if (intent.destination.qualifier === 'specific') confidence += 0.10;
  if (intent.fee_preference !== 'any') confidence += 0.05;

  return Math.min(confidence, 1.0);
}

function detectAmbiguities(intent: ParsedIntent, actionMatched: boolean): AmbiguityFlag[] {
  const flags: AmbiguityFlag[] = [];

  if (!actionMatched) {
    flags.push({
      field: 'action_type',
      reason: 'No clear action keyword found',
      alternatives: ['sweep', 'consolidate', 'bridge', 'move', 'stake'],
    });
  }

  if (intent.destination.qualifier === 'unresolved') {
    flags.push({
      field: 'destination',
      reason: 'No destination specified',
      alternatives: ['initia_l1', 'minievm'],
    });
  }

  if (intent.source.qualifier === 'unresolved') {
    flags.push({
      field: 'source',
      reason: 'No source specified',
      alternatives: ['all chains', 'initia_l1', 'minievm'],
    });
  }

  return flags;
}

export function parseIntent(rawInput: string): IntentParseResult {
  const { normalized } = tokenize(rawInput);

  const { action, matched: actionMatched } = extractAction(normalized);
  const assets = extractAssets(normalized);
  const amount = extractAmount(normalized);
  const source = extractSource(normalized);
  const destination = extractDestination(normalized);
  const fee_preference = extractFeePreference(normalized);
  const min_net_output = extractMinNetOutput(normalized);
  const exclusions = extractExclusions(normalized);
  const allow_partial_execution = extractPartialExecution(normalized, action);

  // If amount was found and it specifies an asset, override the assets array
  const finalAssets = amount
    ? [{ symbol: amount.asset }]
    : assets;

  const primary: ParsedIntent = {
    action_type: action,
    assets: finalAssets,
    source,
    destination,
    fee_preference,
    min_net_output,
    exclusions,
    allow_partial_execution,
    raw_input: rawInput,
    confidence: 0,
  };

  primary.confidence = computeConfidence(primary, actionMatched);

  const ambiguities = detectAmbiguities(primary, actionMatched);

  // Generate alternative candidates if ambiguous
  const candidates: ParsedIntent[] = [primary];

  if (!actionMatched) {
    // Generate alternate action interpretations
    const alternateActions = ['sweep', 'consolidate', 'move', 'stake'] as const;
    for (const altAction of alternateActions) {
      if (altAction === primary.action_type) continue;
      const alt: ParsedIntent = {
        ...primary,
        action_type: altAction,
        confidence: primary.confidence - 0.15,
      };
      candidates.push(alt);
    }
  }

  // If destination is unresolved for sweep/consolidate, default to initia_l1
  if (
    primary.destination.qualifier === 'unresolved' &&
    (
      primary.action_type === 'sweep' ||
      primary.action_type === 'consolidate' ||
      primary.action_type === 'stake'
    )
  ) {
    primary.destination = { chain_name: 'initia_l1', qualifier: 'specific' };
    primary.confidence += 0.05;
  }

  // Sort candidates by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  return {
    candidates,
    ambiguities,
    selected: candidates[0],
  };
}
