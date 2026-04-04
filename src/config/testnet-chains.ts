export interface TestnetChain {
  chainName: string;
  chainId: string;
  prettyName: string;
  restUrl: string;
  rpcUrl: string;
  ibcChannelToL1: string;
  bridgeId: number;
  vmType: 'move' | 'evm' | 'cosmwasm';
  color: string;
  explorerUrl: string;
}

export const INITIA_L1: TestnetChain = {
  chainName: 'initia_l1',
  chainId: 'initiation-2',
  prettyName: 'Initia L1',
  restUrl: 'https://rest.initiation-2.initia.xyz',
  rpcUrl: 'https://rpc.initiation-2.initia.xyz',
  ibcChannelToL1: '',
  bridgeId: 0,
  vmType: 'move',
  color: '#6366f1',
  explorerUrl: 'https://scan.testnet.initia.xyz',
};

export const TESTNET_MINITIAS: TestnetChain[] = [
  {
    chainName: 'zaar',
    chainId: 'zaar-testnet-5',
    prettyName: 'Zaar',
    restUrl: 'https://rest-zaar-testnet-5.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-zaar-testnet-5.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 1048,
    vmType: 'evm',
    color: '#8b5cf6',
    explorerUrl: 'https://scan.testnet.initia.xyz',
  },
  {
    chainName: 'civitia',
    chainId: 'civitia-1',
    prettyName: 'Civitia',
    restUrl: 'https://rest-civitia-1.anvil.asia-southeast.initia.xyz',
    rpcUrl: 'https://rpc-civitia-1.anvil.asia-southeast.initia.xyz',
    ibcChannelToL1: 'channel-0',
    bridgeId: 12,
    vmType: 'move',
    color: '#f59e0b',
    explorerUrl: 'https://scan.testnet.initia.xyz',
  },
];

export const ALL_CHAINS = [INITIA_L1, ...TESTNET_MINITIAS];

export const FAUCET_URL = 'https://faucet.testnet.initia.xyz';

export const INIT_DENOM = 'uinit';
export const INIT_DECIMALS = 6;

export function getTestnetChain(chainId: string): TestnetChain | undefined {
  return ALL_CHAINS.find(c => c.chainId === chainId);
}

export function getTestnetChainByName(name: string): TestnetChain | undefined {
  return ALL_CHAINS.find(c => c.chainName === name);
}

export function formatInitAmount(rawAmount: string): string {
  const num = parseInt(rawAmount, 10);
  if (isNaN(num)) return '0';
  return (num / 10 ** INIT_DECIMALS).toFixed(2);
}

export function toRawAmount(humanAmount: number): string {
  return Math.floor(humanAmount * 10 ** INIT_DECIMALS).toString();
}
