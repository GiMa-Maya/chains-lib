import { Signer, SignerDecorator } from '@xdefi-tech/chains-core';
import { Secp256k1HdWallet } from '@cosmjs/launchpad';
import { SigningStargateClient } from '@cosmjs/stargate';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { bech32 } from 'bech32';

import { ChainMsg } from '../msg';
import { STARGATE_CLIENT_OPTIONS } from '../utils';

@SignerDecorator(Signer.SignerType.SEED_PHRASE)
export class SeedPhraseSigner extends Signer.Provider {
  verifyAddress(address: string, prefix: string): boolean {
    try {
      const result = bech32.decode(address);
      return result.prefix === prefix && result.words.length === 32;
    } catch (err) {
      return false;
    }
  }

  async getAddress(derivation: string, prefix: string): Promise<string> {
    const wallet = await Secp256k1HdWallet.fromMnemonic(this.key, {
      prefix,
    });
    const [{ address }] = await wallet.getAccounts();
    if (!this.verifyAddress(address, prefix)) {
      throw new Error('Invalid address');
    }
    return address;
  }

  async sign(msg: ChainMsg): Promise<void> {
    const txData = await msg.buildTx();
    const wallet = await Secp256k1HdWallet.fromMnemonic(this.key, {
      prefix: msg.provider.manifest.prefix,
    });
    const [{ address: senderAddress }] = await wallet.getAccounts();
    const client = await SigningStargateClient.connectWithSigner(
      msg.provider.manifest.rpcURL,
      wallet,
      STARGATE_CLIENT_OPTIONS
    );
    const signedTx = await client.sign(
      senderAddress,
      txData.msgs,
      txData.fee,
      txData.memo
    );
    const txBytes = TxRaw.encode(signedTx as TxRaw).finish();
    const rawTx = Buffer.from(txBytes).toString('base64');
    msg.sign(rawTx);
  }
}

export default SeedPhraseSigner;
