import React, { useCallback, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { Signer, SignerDecorator } from '@xdefi/chains-core'
import {
  IndexerDataSource,
  EvmProvider,
  EVM_MANIFESTS,
} from '@xdefi/chains-evm'

const MOCK_TX_TYPE_ONE = {
  to: '0x76075A5997be82E39d9A3c8Eae660E74E1D9984B',
  from: '0xD669fd4484d2C1fB2032B57a4C42AB4Cfb9395ff',
  gasLimit: 21000,
  gasPrice: 20,
  data: '0x',
  value: '0.001',
  chainId: '1',
  type: 1,
}

const MOCK_TX_TYPE_TWO = {
  to: '0x76075A5997be82E39d9A3c8Eae660E74E1D9984B',
  from: '0xD669fd4484d2C1fB2032B57a4C42AB4Cfb9395ff',
  gasLimit: 21000,
  data: '0x',
  value: '0.001',
  chainId: '1',
  type: 2,
  maxPriorityFeePerGas: 0.24,
  maxFeePerGas: 25.34,
}

const Home: NextPage = () => {
  const [balanceInput, setBalanceInput] = useState(
    '0x90b0d2d51464efefb38aad00f954649cb5d16040'
  )

  const handleInput = useCallback((event: any) => {
    setBalanceInput(event.target.value)
  }, [])

  const testBalancesSubs = useCallback(async () => {
    try {
      const provider = new EvmProvider(
        new IndexerDataSource(EVM_MANIFESTS.ethereum)
      )
      const resp = await provider.getBalance(balanceInput)
      const observer = await resp.getObserver()
      observer.subscribe((data) => {
        console.log('balance data', data)
      })
    } catch (err) {
      console.log('init error')
      console.error(err)
    }
  }, [])

  const testTransactionsSubs = useCallback(async () => {
    try {
      const provider = new EvmProvider(
        new IndexerDataSource(EVM_MANIFESTS.ethereum)
      )
      const resp = await provider.getTransactions(balanceInput)
      const observer = await resp.getObserver()
      observer.subscribe((data) => {
        console.log('transaction data', data)
      })
    } catch (err) {
      console.log('init error')
      console.error(err)
    }
  }, [])

  useEffect(() => {
    // testBalancesSubs()
    // testTransactionsSubs()

    @SignerDecorator(Signer.SignerType.TRUST_WALLET)
    class TrustWalletSigner<S = string> extends Signer.Provider<S> {
      getAddress(derivation: string): Promise<string> {
        throw new Error('Method not implemented.')
      }
      sign(derivation: string, msg: any): Promise<S> {
        throw new Error('Method not implemented.')
      }
      verifyAddress(address: string): boolean {
        throw new Error('Method not implemented.')
      }
    }

    const provider = new EvmProvider(
      new IndexerDataSource(EVM_MANIFESTS.ethereum),
      { signers: [TrustWalletSigner] }
    )
    console.log(
      `Has ${Signer.SignerType.CUSTOM} signer type?`,
      provider.hasSigner(Signer.SignerType.CUSTOM)
    )
  }, [])

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.block}>
          <h4>Balance</h4>
          <div className={styles.inputBlock}>
            <input
              style={{ flex: 1 }}
              type="text"
              value={balanceInput}
              onInput={handleInput}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
