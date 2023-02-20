import { Chain } from '@xdefi/chains-core';

export interface EVMManifests {
    [chain: string]: Chain.Manifest
}

export enum EVMChains {
    ethereum = 'ethereum',
    binancesmartchain = 'binancesmartchain',
    polygon = 'polygon',
    avalanche = 'avalanche',
    fantom = 'fantom',
    arbitrum = 'arbitrum',
    aurora = 'aurora',
}

export const EVM_MANIFESTS: EVMManifests= {
    [EVMChains.ethereum]: {
        name: 'Ethereum',
        description: '',
        rpcURL: 'https://eth-rpc.gateway.pokt.network',
        chainSymbol: 'ETH',
        blockExplorerURL: 'https://etherscan.io',
        chainId: '1',
        chain: 'ethereum',
    },
    [EVMChains.binancesmartchain]: {
        name: 'BNB Smart Chain',
        description: '',
        rpcURL: 'https://bsc-dataseed1.defibit.io',
        chainSymbol: 'BNB',
        blockExplorerURL: 'https://bscscan.com',
        chainId: '56',
        chain: 'binancesmartchain',
    },
    [EVMChains.polygon]: {
        name: 'Polygon',
        description: '',
        rpcURL: 'https://polygon-rpc.com',
        chainSymbol: 'MATIC',
        blockExplorerURL: 'https://polygonscan.com',
        chainId: '137',
        chain: 'polygon',
    },
    [EVMChains.avalanche]: {
        name: 'Avalanche',
        description: '',
        rpcURL: 'https://api.avax.network/ext/bc/C/rpc',
        chainSymbol: 'AVAX',
        blockExplorerURL: 'https://snowtrace.io',
        chainId: '43114',
        chain: 'avalanche',
    },
    [EVMChains.fantom]: {
        name: 'Fantom',
        description: '',
        rpcURL: 'https://api.avax.network/ext/bc/C/rpc',
        chainSymbol: 'FTM',
        blockExplorerURL: 'https://rpc.ftm.tools',
        chainId: '250',
        chain: 'fantom',
    },
    [EVMChains.arbitrum]: {
        name: 'Arbitrum',
        description: '',
        rpcURL: 'https://arb1.arbitrum.io/rpc',
        chainSymbol: 'ETH',
        blockExplorerURL: 'https://arbiscan.io',
        chainId: '42161',
        chain: 'arbitrum',
    },
    [EVMChains.aurora]: {
        name: 'Aurora',
        description: '',
        rpcURL: 'https://mainnet.aurora.dev',
        chainSymbol: 'ETH',
        blockExplorerURL: 'https://aurorascan.dev',
        chainId: '1313161554',
        chain: 'aurora',
    },
};