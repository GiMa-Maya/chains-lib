import { Signer, SignerDecorator } from '@xdefi-tech/chains-core';
import { utils, Wallet } from 'ethers';

import { ChainMsg } from '../msg';

@SignerDecorator(Signer.SignerType.PRIVATE_KEY)
export class PrivateKeySigner extends Signer.Provider {
  verifyAddress(address: string): boolean {
    return utils.isAddress(address);
  }

  async getPrivateKey(): Promise<string> {
    return this.key;
  }

  async getAddress(): Promise<string> {
    const wallet = new Wallet(this.key);
    return wallet.address;
  }

  async sign(msg: ChainMsg): Promise<void> {
    const wallet = new Wallet(this.key);
    const txData = await msg.buildTx();
    const signature = await wallet.signTransaction({
      to: txData.to,
      from: txData.from,
      nonce: txData.nonce,
      gasLimit: txData.gasLimit,
      value: txData.value,
      chainId: parseInt(txData.chainId),
      ...(txData.maxPriorityFeePerGas && {
        maxPriorityFeePerGas: txData.maxPriorityFeePerGas,
      }),
      ...(txData.maxFeePerGas && { maxFeePerGas: txData.maxFeePerGas }),
      ...(txData.gasPrice && { gasPrice: txData.gasPrice }),
      data: txData.data,
      type: txData.type,
    });
    msg.sign(signature);
  }
}

export default PrivateKeySigner;
