export interface TestnetChain {
  chainName: string;
  chainId: string;
  prettyName: string;
  restUrl: string;
  rpcUrl: string;
  jsonRpcUrl?: string;
  ibcChannelToL1: string;
  bridgeId: number;
  feeDenom: string;
  averageGasPrice: string;
  vmType: 'move' | 'evm' | 'cosmwasm';
  color: string;
  explorerUrl: string;
  aliases?: string[];
}

export const INITIA_L1: TestnetChain = {
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
  color: '#6366f1',
  explorerUrl: 'https://scan.testnet.initia.xyz',
  aliases: ['initia', 'initia l1', 'l1', 'layer 1', 'initiation-2', 'initia testnet'],
};

export const MINI_EVM: TestnetChain = {
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
  color: '#8b5cf6',
  explorerUrl: 'https://scan.testnet.initia.xyz',
  aliases: ['minievm', 'mini evm', 'mini-evm', 'evm', 'evm-1', 'mini'],
};

export const TESTNET_MINITIAS: TestnetChain[] = [MINI_EVM];

export const ALL_CHAINS = [INITIA_L1, ...TESTNET_MINITIAS];

export const FAUCET_URL = 'https://faucet.testnet.initia.xyz';

export const INIT_DENOM = 'uinit';
export const INIT_DECIMALS = 6;

export function getTestnetChain(chainId: string): TestnetChain | undefined {
  return ALL_CHAINS.find(c => c.chainId === chainId);
}

export function getTestnetChainByName(name: string): TestnetChain | undefined {
  const normalized = name.toLowerCase().trim();
  return ALL_CHAINS.find((chain) =>
    chain.chainName === normalized ||
    chain.chainId === normalized ||
    chain.aliases?.some((alias) => alias.toLowerCase() === normalized)
  );
}

export function formatInitAmount(rawAmount: string): string {
  const num = parseInt(rawAmount, 10);
  if (isNaN(num)) return '0';
  return (num / 10 ** INIT_DECIMALS).toFixed(2);
}

export function toRawAmount(humanAmount: number): string {
  return Math.floor(humanAmount * 10 ** INIT_DECIMALS).toString();
}
