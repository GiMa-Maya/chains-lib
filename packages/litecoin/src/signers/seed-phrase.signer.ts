import { Signer, SignerDecorator } from '@xdefi-tech/chains-core';
import { UTXO } from '@xdefi-tech/chains-utxo';
import * as bip39 from 'bip39';
/*eslint import/namespace: [2, { allowComputed: true }]*/
import * as Litecoin from 'bitcoinjs-lib';
import coininfo from 'coininfo';
import { BIP32Factory } from 'bip32';
import tinysecp from 'tiny-secp256k1';
import ECPairFactory, { ECPairAPI } from 'ecpair';

import { ChainMsg } from '../msg';

@SignerDecorator(Signer.SignerType.SEED_PHRASE)
export class SeedPhraseSigner extends Signer.Provider {
  private _ECPair?: ECPairAPI;
  private _bip32?: ReturnType<typeof BIP32Factory>;

  private get ECPair(): ECPairAPI {
    if (!this._ECPair) {
      this._ECPair = ECPairFactory(tinysecp);
    }
    return this._ECPair;
  }

  private get bip32() {
    if (!this._bip32) {
      this._bip32 = BIP32Factory(tinysecp);
    }
    return this._bip32;
  }

  verifyAddress(address: string): boolean {
    try {
      Litecoin.address.toOutputScript(
        address,
        coininfo.litecoin.main.toBitcoinJS()
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  async getPrivateKey(derivation: string): Promise<string> {
    if (!this.key) {
      throw new Error('Seed phrase not set!');
    }
    const seed = await bip39.mnemonicToSeed(this.key, '');
    const root = this.bip32.fromSeed(seed, coininfo.litecoin.main.toBitcoinJS());
    const master = root.derivePath(derivation);

    return master.toWIF();
  }

  async getAddress(
    derivation: string,
    type: 'p2ms' | 'p2pk' | 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh' = 'p2wpkh'
  ): Promise<string> {
    const network = coininfo.litecoin.main.toBitcoinJS();
    const privateKey = await this.getPrivateKey(derivation);
    const pk = this.ECPair.fromWIF(privateKey, network);
    const { address } = Litecoin.payments[type]({
      pubkey: pk.publicKey,
      network,
    });

    if (!address) throw new Error('LTC address is undefined');

    return address;
  }

  async sign(message: ChainMsg, derivation: string) {
    const { inputs, outputs, compiledMemo, from } = await message.buildTx();
    const network = coininfo.litecoin.main.toBitcoinJS();
    const psbt = new Litecoin.Psbt({ network });
    psbt.addInputs(
      inputs.map((utxo: UTXO) => ({
        hash: utxo.hash,
        index: utxo.index,
        witnessUtxo: utxo.witnessUtxo,
      }))
    );

    outputs.forEach((output: Litecoin.PsbtTxOutput) => {
      if (!output.address) {
        output.address = from;
      }
      if (!output.script) {
        psbt.addOutput(output);
      } else {
        if (compiledMemo) {
          psbt.addOutput({ script: compiledMemo, value: 0 });
        }
      }
    });
    const privateKey = await this.getPrivateKey(derivation);
    psbt.signAllInputs(this.ECPair.fromWIF(privateKey, network));
    psbt.finalizeAllInputs();

    message.sign(psbt.extractTransaction(true).toHex());
  }
}

export default SeedPhraseSigner;
