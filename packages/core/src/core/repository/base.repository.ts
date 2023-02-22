import { Manifest } from 'core/chain';
import { Coin, GasFee, GasFeeSpeed, Msg, Transaction } from 'core';
import { providers } from 'ethers';

export abstract class BaseRepository {
    // Share base chain & call methods without any code
    public rpcProvider: providers.StaticJsonRpcProvider;
    public manifest: Manifest;

    constructor(manifest: Manifest) {
        // pass config here, get it in the provider
        this.manifest = manifest;
        this.rpcProvider = new providers.StaticJsonRpcProvider(manifest.rpcURL);
    }

    abstract getBalance(address: string): Promise<Coin[]>;

    abstract getTransactions(address: string, afterBlock?: number | string): Promise<Transaction[]>;

    abstract estimateFee(msgs: Msg[], speed: GasFeeSpeed): Promise<Msg[]>;

    abstract gasFeeOptions(): Promise<GasFee>;

    async getNonce(address: string): Promise<number> {
        return 0;
    }

    get name(): string {
        return this.constructor.name;
    }
}
