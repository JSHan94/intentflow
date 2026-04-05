import type { ActionType, AssetFilter, ChainReference, FeePreference, Exclusion } from '@/types/intent';
import {
  ACTION_KEYWORDS,
  ASSET_KEYWORDS,
  CHAIN_KEYWORDS,
  SOURCE_QUALIFIERS,
  DESTINATION_QUALIFIERS,
  FEE_KEYWORDS,
  EXCLUSION_PATTERNS,
  PARTIAL_ALLOW_PATTERNS,
  PARTIAL_FORBID_PATTERNS,
  NUMERIC_PATTERNS,
  AMOUNT_PATTERN,
} from './keyword-maps';

function findBestMatch<T extends string>(input: string, map: Record<T, string[]>): T | null {
  let bestMatch: T | null = null;
  let bestLength = 0;

  for (const [key, synonyms] of Object.entries(map) as [T, string[]][]) {
    for (const synonym of synonyms) {
      if (input.includes(synonym) && synonym.length > bestLength) {
        bestMatch = key;
        bestLength = synonym.length;
      }
    }
  }

  return bestMatch;
}

export function extractAction(input: string): { action: ActionType; matched: boolean } {
  const match = findBestMatch(input, ACTION_KEYWORDS);
  return {
    action: match ?? 'show_options',
    matched: match !== null,
  };
}

export function extractAssets(input: string): AssetFilter[] {
  const assets: AssetFilter[] = [];
  const seen = new Set<string>();

  // Check for ALL first
  for (const synonym of ASSET_KEYWORDS.ALL) {
    if (input.includes(synonym)) {
      return [{ symbol: 'ALL' }];
    }
  }

  // Check specific assets
  for (const [symbol, synonyms] of Object.entries(ASSET_KEYWORDS)) {
    if (symbol === 'ALL') continue;
    for (const synonym of synonyms) {
      if (input.includes(synonym) && !seen.has(symbol)) {
        seen.add(symbol);
        assets.push({ symbol });
      }
    }
  }

  // If no assets found, default to ALL
  if (assets.length === 0) {
    return [{ symbol: 'ALL' }];
  }

  return assets;
}

export function extractAmount(input: string): { amount: number; asset: string } | null {
  const match = input.match(AMOUNT_PATTERN);
  if (!match) return null;

  const amount = parseFloat(match[1]);
  const assetWord = match[2].toLowerCase();

  // Resolve asset word to symbol
  for (const [symbol, synonyms] of Object.entries(ASSET_KEYWORDS)) {
    if (symbol === 'ALL') continue;
    if (synonyms.includes(assetWord) || symbol.toLowerCase() === assetWord) {
      return { amount, asset: symbol };
    }
  }

  return { amount, asset: assetWord.toUpperCase() };
}

export function extractSource(input: string): ChainReference {
  // Check "from X" pattern
  const fromMatch = input.match(/(?:from|on)\s+([\w-]+(?:\s+[\w-]+)?)/i)
    ?? input.match(/([\w-]+)\s*(?:에서|부터)/i);

  // Check source qualifiers
  for (const [qualifier, synonyms] of Object.entries(SOURCE_QUALIFIERS)) {
    for (const synonym of synonyms) {
      if (input.includes(synonym)) {
        return { chain_name: null, qualifier: qualifier as ChainReference['qualifier'] };
      }
    }
  }

  // Check specific chain from "from X" match
  if (fromMatch) {
    const chainText = fromMatch[1].toLowerCase();
    const chain = findBestMatch(chainText, CHAIN_KEYWORDS);
    if (chain) {
      return { chain_name: chain, qualifier: 'specific' };
    }
  }

  // Check if any chain is mentioned in the input with "from" context
  const chain = findBestMatch(input, CHAIN_KEYWORDS);
  if (chain && input.includes('from')) {
    return { chain_name: chain, qualifier: 'specific' };
  }

  // Default: for sweep/consolidate actions, default to 'all'
  return { chain_name: null, qualifier: 'all' };
}

export function extractDestination(input: string): ChainReference {
  // Check "to/into X" pattern
  const toMatch = input.match(/(?:to|into|onto)\s+([\w-]+(?:\s+[\w-]+)?(?:\s+[\w-]+)?)/i)
    ?? input.match(/(?:to|into|onto|on)\s+([\w-]+(?:\s+[\w-]+)?(?:\s+[\w-]+)?)/i)
    ?? input.match(/([\w-]+)\s*(?:로|으로)/i);

  // Check destination qualifiers
  for (const [, synonyms] of Object.entries(DESTINATION_QUALIFIERS)) {
    for (const synonym of synonyms) {
      if (input.includes(synonym)) {
        // "one wallet" / "one destination" defaults to initia_l1
        return { chain_name: 'initia_l1', qualifier: 'specific' };
      }
    }
  }

  // Check specific chain from "to X" match
  if (toMatch) {
    const chainText = toMatch[1].toLowerCase();
    const chain = findBestMatch(chainText, CHAIN_KEYWORDS);
    if (chain) {
      return { chain_name: chain, qualifier: 'specific' };
    }
  }

  // Default: unresolved
  return { chain_name: null, qualifier: 'unresolved' };
}

export function extractFeePreference(input: string): FeePreference {
  return findBestMatch(input, FEE_KEYWORDS) ?? 'any';
}

export function extractMinNetOutput(input: string): number | null {
  for (const pattern of NUMERIC_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

export function extractExclusions(input: string): Exclusion[] {
  const exclusions: Exclusion[] = [];

  for (const pattern of EXCLUSION_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(input)) !== null) {
      const value = match[1].toLowerCase();

      // Check if it's a chain
      const chain = findBestMatch(value, CHAIN_KEYWORDS);
      if (chain) {
        exclusions.push({ type: 'chain', value: chain });
        continue;
      }

      // Check if it's an asset
      for (const [symbol, synonyms] of Object.entries(ASSET_KEYWORDS)) {
        if (symbol === 'ALL') continue;
        if (synonyms.includes(value) || symbol.toLowerCase() === value) {
          exclusions.push({ type: 'asset', value: symbol });
          break;
        }
      }
    }
  }

  return exclusions;
}

export function extractPartialExecution(input: string, actionType: ActionType): boolean {
  // Check explicit allow
  for (const pattern of PARTIAL_ALLOW_PATTERNS) {
    if (pattern.test(input)) return true;
  }

  // Check explicit forbid
  for (const pattern of PARTIAL_FORBID_PATTERNS) {
    if (pattern.test(input)) return false;
  }

  // Default based on action type
  return actionType === 'sweep' || actionType === 'consolidate';
}
