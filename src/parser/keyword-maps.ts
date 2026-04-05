import type { ActionType, FeePreference } from '@/types/intent';

export const ACTION_KEYWORDS: Record<ActionType, string[]> = {
  sweep: ['sweep', 'sweep up', 'gather', 'pull together', 'scoop', 'collect all', '스윕', '모으기', '쓸어오기'],
  consolidate: ['consolidate', 'merge', 'combine', 'unify', 'aggregate', '통합', '합치기'],
  bridge: ['bridge', 'ibc transfer', 'cross-chain', 'relay', '브리지', '입금', '출금'],
  move: ['move', 'send', 'transfer', 'shift', 'migrate', 'port', '이동', '전송'],
  stake: ['stake', 'delegate', 'staking', 'bond', '스테이크', '스테이킹', '위임'],
  collect: ['collect', 'find best', 'best option', 'recommend', 'options'],
  show_options: ['show', 'display', 'list', 'check', 'view', 'what can i', 'show me'],
};

export const ASSET_KEYWORDS: Record<string, string[]> = {
  USDC: ['usdc', 'usd coin', 'dollar', 'stablecoin', 'stable', 'stables'],
  ETH: ['eth', 'ether', 'ethereum', 'weth'],
  INIT: ['init', 'initia', 'uinit'],
  TIA: ['tia', 'celestia'],
  ATOM: ['atom', 'cosmos'],
  ALL: ['all', 'everything', 'all my', 'all assets', 'every token', 'my balances', 'all balances', 'my funds', 'all funds'],
};

export const CHAIN_KEYWORDS: Record<string, string[]> = {
  initia_l1: ['initia', 'l1', 'layer 1', 'initia l1', 'initia destination', 'initia testnet', 'initiation-2', 'initiation 2', '이니시아', '레이어1'],
  minievm: ['minievm', 'mini evm', 'mini-evm', 'evm', 'evm-1', 'mini', '미니이브이엠', '미니evm'],
};

export const SOURCE_QUALIFIERS: Record<string, string[]> = {
  all: ['all', 'everywhere', 'every chain', 'all rollups', 'all chains', 'across all', 'from everywhere', '전체', '전부', '모든 체인'],
  here: ['here', 'this chain', 'current', 'this rollup', '여기', '현재 체인'],
};

export const DESTINATION_QUALIFIERS: Record<string, string[]> = {
  one_wallet: ['one wallet', 'one place', 'single wallet', 'one destination', 'single destination', 'one account', 'together', 'into one', '한 곳으로', '한 지갑으로'],
  here: ['here', 'this chain', 'this wallet', 'current', '여기', '현재 체인'],
};

export const FEE_KEYWORDS: Record<FeePreference, string[]> = {
  cheapest: ['cheap', 'cheapest', 'low fees', 'lowest fee', 'minimize fees', 'save on fees', 'fee efficient', 'fees are low', 'low enough'],
  fastest: ['fast', 'fastest', 'quick', 'quickest', 'asap', 'immediately', 'right now', 'hurry', 'rush', 'as fast as possible'],
  balanced: ['balanced', 'optimal', 'best'],
  any: ['any', "don't care", 'doesnt matter', 'whatever'],
};

export const EXCLUSION_PATTERNS: RegExp[] = [
  /(?:except|excluding|not from|skip|ignore|but not)\s+(\w+)/gi,
  /(?:don'?t|do not)\s+(?:include|touch|use)\s+(\w+)/gi,
];

export const PARTIAL_ALLOW_PATTERNS: RegExp[] = [
  /partial(?:ly)?/i,
  /whatever (?:you )?can/i,
  /as much as/i,
  /best effort/i,
  /partial is fine/i,
];

export const PARTIAL_FORBID_PATTERNS: RegExp[] = [
  /all or nothing/i,
  /complete(?:ly)? or not/i,
  /don't do partial/i,
  /must be full/i,
];

export const NUMERIC_PATTERNS: RegExp[] = [
  /(?:at least|minimum|min|no less than|above)\s+\$?([\d,]+\.?\d*)/i,
  /(?:net|output|receive|get)\s+(?:at least\s+)?\$?([\d,]+\.?\d*)/i,
  /\$?([\d,]+\.?\d*)\s+(?:minimum|min|or more|at least)/i,
];

export const AMOUNT_PATTERN = /(\d+(?:\.\d+)?)\s*(?:of\s+)?(\w+)/i;
