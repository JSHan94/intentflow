export type NetworkType = 'mainnet' | 'testnet';
export type VmType = 'move' | 'evm' | 'cosmwasm';

export interface ChainConfig {
  chainName: string;
  chainId: string;
  prettyName: string;
  restUrl: string;
  rpcUrl: string;
  jsonRpcUrl?: string;
  ibcChannelToL1: string;
  bridgeId: number;
  feeDenom?: string;
  averageGasPrice?: string;
  vmType: VmType;
  color: string;
  explorerUrl: string;
  network: NetworkType;
  aliases?: string[];
}

export interface RollupAction {
  id: string;
  label: string;
  intent: string;
  color: string;
}

// ── Mainnet ──

export const MAINNET_L1: ChainConfig = {
  chainName: 'initia_l1',
  chainId: 'interwoven-1',
  prettyName: 'Initia L1',
  restUrl: 'https://rest.initia.xyz',
  rpcUrl: 'https://rpc.initia.xyz',
  ibcChannelToL1: '',
  bridgeId: 0,
  vmType: 'move',
  color: '#CCFF00',
  explorerUrl: 'https://scan.initia.xyz',
  network: 'mainnet',
};

export const MAINNET_ROLLUPS: ChainConfig[] = [
  {
    chainName: 'civitia',
    chainId: 'civitia-1',
    prettyName: 'Civitia',
    restUrl: 'https://rest-civitia-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-civitia-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 12,
    vmType: 'move',
    color: '#FF5733',
    explorerUrl: 'https://scan.initia.xyz',
    network: 'mainnet',
  },
  {
    chainName: 'yominet',
    chainId: 'yominet-1',
    prettyName: 'Yominet',
    restUrl: 'https://rest-yominet-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-yominet-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 11,
    vmType: 'evm',
    color: '#00D4FF',
    explorerUrl: 'https://scan.initia.xyz',
    network: 'mainnet',
  },
  {
    chainName: 'cabal',
    chainId: 'cabal-1',
    prettyName: 'Cabal',
    restUrl: 'https://rest-cabal-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-cabal-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 20,
    vmType: 'evm',
    color: '#B388FF',
    explorerUrl: 'https://scan.initia.xyz',
    network: 'mainnet',
  },
  {
    chainName: 'strat',
    chainId: 'strat-1',
    prettyName: 'Strat',
    restUrl: 'https://rest-strat-1.anvil.asia-northeast.initia.xyz',
    rpcUrl: 'https://rpc-strat-1.anvil.asia-northeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 25,
    vmType: 'move',
    color: '#FEE440',
    explorerUrl: 'https://scan.initia.xyz',
    network: 'mainnet',
  },
  {
    chainName: 'echelon',
    chainId: 'echelon-1',
    prettyName: 'Echelon',
    restUrl: 'https://rest-echelon-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-echelon-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 16,
    vmType: 'move',
    color: '#00FF88',
    explorerUrl: 'https://scan.initia.xyz',
    network: 'mainnet',
  },
  {
    chainName: 'ember',
    chainId: 'embrmainnet-1',
    prettyName: 'Ember',
    restUrl: 'https://rest-embrmainnet-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-embrmainnet-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 30,
    vmType: 'evm',
    color: '#FF6B35',
    explorerUrl: 'https://scan.initia.xyz',
    network: 'mainnet',
  },
];

// ── Testnet ──

export const TESTNET_L1: ChainConfig = {
  chainName: 'initia_l1',
  chainId: 'initiation-2',
  prettyName: 'Initia L1',
  restUrl: 'https://rest.testnet.initia.xyz',
  rpcUrl: 'https://rpc.testnet.initia.xyz',
  ibcChannelToL1: '',
  bridgeId: 0,
  feeDenom: 'uinit',
  averageGasPrice: '0.015',
  vmType: 'move',
  color: '#CCFF00',
  explorerUrl: 'https://scan.testnet.initia.xyz',
  network: 'testnet',
  aliases: ['initia', 'initia l1', 'l1', 'layer 1', 'initiation-2', 'initia testnet'],
};

export const TESTNET_ROLLUPS: ChainConfig[] = [
  {
    chainName: 'minievm',
    chainId: 'evm-1',
    prettyName: 'miniEVM',
    restUrl: 'https://rest-evm-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-evm-1.anvil.asia-southeast.initia.xyz',
    jsonRpcUrl: 'https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 1459,
    feeDenom: 'uinit',
    averageGasPrice: '0.015',
    vmType: 'evm',
    color: '#B388FF',
    explorerUrl: 'https://scan.testnet.initia.xyz',
    network: 'testnet',
    aliases: ['minievm', 'mini evm', 'mini-evm', 'evm', 'evm-1'],
  },
  {
    chainName: 'minimove',
    chainId: 'move-1',
    prettyName: 'miniMove',
    restUrl: 'https://rest-move-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-move-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 1460,
    feeDenom: 'uinit',
    averageGasPrice: '0.015',
    vmType: 'move',
    color: '#00FF88',
    explorerUrl: 'https://scan.testnet.initia.xyz',
    network: 'testnet',
    aliases: ['minimove', 'mini move', 'mini-move', 'move', 'move-1'],
  },
  {
    chainName: 'miniwasm',
    chainId: 'wasm-1',
    prettyName: 'miniWasm',
    restUrl: 'https://rest-wasm-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-wasm-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 1461,
    feeDenom: 'uinit',
    averageGasPrice: '0.015',
    vmType: 'cosmwasm',
    color: '#FF5733',
    explorerUrl: 'https://scan.testnet.initia.xyz',
    network: 'testnet',
    aliases: ['miniwasm', 'mini wasm', 'mini-wasm', 'wasm', 'wasm-1'],
  },
];

// ── Rollup Actions ──

export const ROLLUP_ACTIONS: Record<string, RollupAction[]> = {
  civitia: [
    { id: 'bridge-init', label: 'Bridge INIT', intent: 'Bridge INIT to Civitia', color: '#FF5733' },
    { id: 'mint-city', label: 'Mint City NFT', intent: 'Mint a city NFT on Civitia', color: '#FF5733' },
    { id: 'earn-yield', label: 'Earn Yield', intent: 'Earn yield through Civitia community', color: '#FF5733' },
  ],
  yominet: [
    { id: 'swap-init', label: 'Swap INIT', intent: 'Swap INIT on Yominet DEX', color: '#00D4FF' },
    { id: 'trade-kami', label: 'Trade Kamigotchi', intent: 'Trade Kamigotchi NFT on Yominet', color: '#00D4FF' },
    { id: 'stake-init', label: 'Stake INIT', intent: 'Stake INIT on Yominet', color: '#00D4FF' },
  ],
  cabal: [
    { id: 'deposit-iusd', label: 'Deposit iUSD', intent: 'Deposit iUSD into Cabal lending', color: '#B388FF' },
    { id: 'swap-iusd', label: 'Swap iUSD/INIT', intent: 'Swap iUSD to INIT on Cabal', color: '#B388FF' },
    { id: 'bridge-stable', label: 'Bridge Stables', intent: 'Bridge stablecoins to Cabal', color: '#B388FF' },
  ],
  strat: [
    { id: 'create-strat', label: 'Create Strategy', intent: 'Create automated trading strategy on Strat', color: '#FEE440' },
    { id: 'stake-init', label: 'Stake INIT', intent: 'Stake INIT on Strat for yield', color: '#FEE440' },
    { id: 'deploy-contract', label: 'Deploy Contract', intent: 'Deploy Move contract on Strat', color: '#FEE440' },
  ],
  echelon: [
    { id: 'lend-init', label: 'Lend INIT', intent: 'Lend INIT on Echelon money market', color: '#00FF88' },
    { id: 'deposit-milkinit', label: 'Deposit milkINIT', intent: 'Deposit milkINIT on Echelon for enhanced yield', color: '#00FF88' },
    { id: 'leverage-rwa', label: 'Leverage RWA', intent: 'Leverage RWA-backed lending on Echelon', color: '#00FF88' },
  ],
  ember: [
    { id: 'launch-token', label: 'Launch Token', intent: 'Launch a new token on Ember', color: '#FF6B35' },
    { id: 'conc-liquidity', label: 'Add Liquidity', intent: 'Concentrate liquidity on Ember', color: '#FF6B35' },
    { id: 'trade-memes', label: 'Trade Memes', intent: 'Trade meme tokens on Ember DEX', color: '#FF6B35' },
  ],
  // Testnet rollups
  minievm: [
    { id: 'sweep-init', label: 'Sweep INIT', intent: 'Sweep INIT from miniEVM to Initia L1', color: '#B388FF' },
    { id: 'bridge-init', label: 'Bridge to EVM', intent: 'Bridge INIT from Initia L1 to miniEVM', color: '#B388FF' },
    { id: 'deploy-evm', label: 'Deploy EVM', intent: 'Deploy EVM contract on miniEVM', color: '#B388FF' },
  ],
  minimove: [
    { id: 'sweep-init', label: 'Sweep INIT', intent: 'Sweep INIT from miniMove to Initia L1', color: '#00FF88' },
    { id: 'bridge-init', label: 'Bridge to Move', intent: 'Bridge INIT from Initia L1 to miniMove', color: '#00FF88' },
    { id: 'deploy-move', label: 'Deploy Move', intent: 'Deploy Move module on miniMove', color: '#00FF88' },
  ],
  miniwasm: [
    { id: 'sweep-init', label: 'Sweep INIT', intent: 'Sweep INIT from miniWasm to Initia L1', color: '#FF5733' },
    { id: 'bridge-init', label: 'Bridge to Wasm', intent: 'Bridge INIT from Initia L1 to miniWasm', color: '#FF5733' },
    { id: 'deploy-wasm', label: 'Deploy Wasm', intent: 'Deploy CosmWasm contract on miniWasm', color: '#FF5733' },
  ],
  initia_l1: [
    { id: 'stake', label: 'Stake INIT', intent: 'Stake my INIT on Initia L1', color: '#CCFF00' },
    { id: 'sweep-all', label: 'Sweep All', intent: 'Sweep all my INIT into Initia L1', color: '#CCFF00' },
    { id: 'bridge-out', label: 'Bridge Out', intent: 'Bridge INIT from Initia L1 to miniEVM', color: '#CCFF00' },
  ],
};

// ── Helpers ──

export function getL1(network: NetworkType): ChainConfig {
  return network === 'mainnet' ? MAINNET_L1 : TESTNET_L1;
}

export function getRollups(network: NetworkType): ChainConfig[] {
  return network === 'mainnet' ? MAINNET_ROLLUPS : TESTNET_ROLLUPS;
}

export function getAllChains(network: NetworkType): ChainConfig[] {
  return [getL1(network), ...getRollups(network)];
}

export function getChainConfig(chainName: string, network?: NetworkType): ChainConfig | undefined {
  const normalized = chainName.toLowerCase().trim();
  const matches = (chain: ChainConfig) =>
    chain.chainName === normalized ||
    chain.chainId === normalized ||
    chain.aliases?.some((alias) => alias.toLowerCase() === normalized);

  if (network) return getAllChains(network).find(matches);
  return getAllChains('mainnet').find(matches)
    ?? getAllChains('testnet').find(matches);
}

export function findChainByChainId(chainId: string): ChainConfig | undefined {
  return getAllChains('mainnet').find(c => c.chainId === chainId)
    ?? getAllChains('testnet').find(c => c.chainId === chainId);
}

export function getActions(chainName: string): RollupAction[] {
  return ROLLUP_ACTIONS[chainName] ?? [];
}

export const INIT_DENOM = 'uinit';
export const INIT_DECIMALS = 6;
export const FAUCET_URL = 'https://faucet.testnet.initia.xyz';

export function formatInitAmount(rawAmount: string): string {
  const num = parseInt(rawAmount, 10);
  if (isNaN(num)) return '0';
  return (num / 10 ** INIT_DECIMALS).toFixed(2);
}

export function toRawAmount(humanAmount: number): string {
  return Math.floor(humanAmount * 10 ** INIT_DECIMALS).toString();
}
