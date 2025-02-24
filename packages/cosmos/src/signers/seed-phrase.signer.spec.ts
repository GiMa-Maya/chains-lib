import { Msg } from '@xdefi-tech/chains-core';

import { CosmosProvider } from '../chain.provider';
import { IndexerDataSource } from '../datasource';
import { COSMOS_MANIFESTS } from '../manifests';
import { ChainMsg, MsgBody } from '../msg';

import SeedPhraseSigner from './seed-phrase.signer';

jest.mock('@cosmjs/stargate/build/signingstargateclient', () => {
  return {
    SigningStargateClient: {
      createWithSigner: jest.fn().mockResolvedValue({
        sign: jest.fn().mockResolvedValue({}),
      }),
      connectWithSigner: jest.fn().mockResolvedValue({
        sign: jest.fn().mockResolvedValue({}),
      }),
    },
    defaultRegistryTypes: [],
    createDefaultAminoConverters: jest.fn().mockResolvedValue([]),
  };
});

jest.mock('cosmjs-types/cosmos/tx/v1beta1/tx', () => {
  return {
    TxRaw: {
      encode: jest.fn().mockImplementation(() => {
        return { finish: jest.fn().mockReturnValue([1, 1, 1]) };
      }),
    },
  };
});

type CosmosHdPathTypes = {
  cosmos: string;
  terra: string;
  ethermint: string;
};

describe('seed-phrase.signer', () => {
  let mnemonic: string;
  let signer: SeedPhraseSigner;
  let provider: CosmosProvider;
  let txInput: MsgBody;
  let message: Msg;
  let derivations: CosmosHdPathTypes;

  beforeEach(() => {
    jest.setTimeout(15 * 1000);
    mnemonic =
      'question unusual episode tree fresh lawn enforce vocal attitude quarter solution shove early arch topic';
    signer = new SeedPhraseSigner(mnemonic);

    derivations = {
      cosmos: "m/44'/118'/0'/0/0",
      terra: "m/44'/330'/0'/0/0",
      ethermint: "m/44'/60'/0'/0/0",
    };

    provider = new CosmosProvider(
      new IndexerDataSource(COSMOS_MANIFESTS.cosmos)
    );

    txInput = {
      from: 'cosmos1g6qu6hm4v3s3vq7438jehn9fzxg9p720yesq2q',
      to: 'cosmos1g6qu6hm4v3s3vq7438jehn9fzxg9p720yesq2q',
      amount: '0.000001',
      msgs: [],
    };

    message = provider.createMsg(txInput);
  });

  it('should get an address from a seed phrase', async () => {
    expect(await signer.getAddress(derivations.cosmos, 'cosmos')).toBe(
      txInput.from
    );
  });

  it('should get an ethermint address with prefix from a seed phrase', async () => {
    expect(await signer.getAddress(derivations.ethermint, 'evmos')).toBe(
      'evmos14gya7fnnuxhrlnywmp6uzvd4y3yul9vpp7tu6m'
    );
  });

  it('should get an ethermint evm-like address from a seed phrase', async () => {
    expect(await signer.getEthermintAddress(derivations.ethermint)).toBe(
      '0xAa09Df2673e1ae3fcC8ed875C131b52449CF9581'
    );
  });

  it('should get null from getEthermintAddress for non ethermint derivations path', async () => {
    expect(await signer.getEthermintAddress(derivations.cosmos)).toBe(null);
  });

  it('should get a terra address from a seed phrase', async () => {
    expect(await signer.getAddress(derivations.terra)).toBe(
      'terra1elsr769k4kcgap5kgy9fcetzrwdw05qr85gqra'
    );
  });

  it('should sign a transaction using a seed phrase', async () => {
    await signer.sign(message as ChainMsg, derivations.cosmos);

    expect(message.signedTransaction).toBeTruthy();
  });

  // it('should sign a terra transaction using a seed phrase', async () => {
  //   const terraProvider = new CosmosProvider(
  //     new IndexerDataSource(COSMOS_MANIFESTS.terra)
  //   );

  //   const terraMessage = terraProvider.createMsg(txInput);

  //   await signer.sign(
  //     terraMessage as ChainMsg,
  //     derivations.terra,
  //     CosmosChainType.Terra
  //   );

  //   expect(message.signedTransaction).toBeTruthy();
  // });

  it('should return false when verifing an invalid address', async () => {
    expect(signer.verifyAddress('0xDEADBEEF', 'cosmos')).toBe(false);
  });

  it('should return false when verifing an invalid address with no prefix specified', async () => {
    expect(signer.verifyAddress('0xDEADBEEF')).toBe(false);
  });

  it('should validate an address', async () => {
    expect(signer.verifyAddress(txInput.from, 'cosmos')).toBe(true);
    expect(signer.verifyAddress(txInput.from)).toBe(true);
    expect(
      signer.verifyAddress('0xcD558EBF5E7D94CB08BD34FFf7674aC95E3EBd9d')
    ).toBe(true);
    expect(
      signer.verifyAddress('terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8')
    ).toBe(true);
  });
});

describe('seed-phase.addressGeneration', () => {
  let derivations: {
    cosmos: (index: number) => string;
    terra: (index: number) => string;
    ethermint: (index: number) => string;
    secret: (index: number) => string;
  };
  let seedPhrases: string[];
  let signers: SeedPhraseSigner[];
  let firstAddresses: {
    cosmos: string;
    terra: string;
    ethermint: string;
    evmos: string;
    zetachain: string;
    secret: string;
    akash: string;
    dymension: string;
  }[];
  let secondAddresses: {
    cosmos: string;
    terra: string;
    ethermint: string;
  }[];

  beforeEach(() => {
    seedPhrases = [
      'access before split cram spoon snap secret month sphere fog embark donor',
      'identify issue disorder vote family fury oval stock when maple debris surprise',
      'happy inquiry mail thank riot release horn napkin nasty rail inner repair',
    ];

    derivations = {
      cosmos: (index) => `m/44'/118'/0'/0/${index}`,
      terra: (index) => `m/44'/330'/0'/${index}/0`,
      ethermint: (index) => `m/44'/60'/0'/0/${index}`,
      secret: (index) => `m/44'/529'/0'/0/${index}`,
    };
    signers = [];
    for (const seedPhrase of seedPhrases) {
      signers.push(new SeedPhraseSigner(seedPhrase));
    }

    firstAddresses = [
      {
        cosmos: 'cosmos1ryvnmdm2cxn7um2p489el7uhjvc4vjl562v09n',
        terra: 'terra1sswsyj4wn2z4t8y8qfvj9e2x0etdfqm2xrxf2n',
        ethermint: '0x230e9c3deE180bf702cd40852feF85eb5fa5635B',
        evmos: 'evmos1yv8fc00wrq9lwqkdgzzjlmu9ad062c6msl8uyr',
        zetachain: 'zeta1yv8fc00wrq9lwqkdgzzjlmu9ad062c6my6c8ym',
        secret: 'secret1wau4wsmzxgd4fzkajq2pelv798rsm34y9p5l8k',
        akash: 'akash1ryvnmdm2cxn7um2p489el7uhjvc4vjl5h3pguf',
        dymension: 'dym1yv8fc00wrq9lwqkdgzzjlmu9ad062c6mqr65m9',
      },
      {
        cosmos: 'cosmos1f68fxcgv5hyfhv7vr6mu50mldphemd4vr9ud3w',
        terra: 'terra1f9hrf3ge5r7nvxyvpc6ryl9md30wcuwx8jcaur',
        ethermint: '0x501Be002298Fcb3Fa20b3Aaf8615b1745AffE0D0',
        evmos: 'evmos12qd7qq3f3l9nlgst82hcv9d3w3d0lcxs6k4fvs',
        zetachain: 'zeta12qd7qq3f3l9nlgst82hcv9d3w3d0lcxswn2jvg',
        secret: 'secret1d07u0vmlhsm7mr3q6pth78ge4auenxj83pu44s',
        akash: 'akash1f68fxcgv5hyfhv7vr6mu50mldphemd4vw732g5',
        dymension: 'dym12qd7qq3f3l9nlgst82hcv9d3w3d0lcxs22gpnk',
      },
      {
        cosmos: 'cosmos1yh3lcs6634sw6utz3t8fnykp3vqmlegp6kzkya',
        terra: 'terra1csmnpajt68necwnehmtuyffwrzsmmwkm79gxgy',
        ethermint: '0x0EFBD3F51620AFB9BB9f47cc79523f76DF18C0AE',
        evmos: 'evmos1pmaa8agkyzhmnwulglx8j53lwm033s9wvzcypf',
        zetachain: 'zeta1pmaa8agkyzhmnwulglx8j53lwm033s9wc88lp3',
        secret: 'secret1mzuh3vngns0fz2547zrrpzehsuk8d92djz5xzs',
        akash: 'akash1yh3lcs6634sw6utz3t8fnykp3vqmlegphd03a8',
        dymension: 'dym1pmaa8agkyzhmnwulglx8j53lwm033s9wu79v70',
      },
    ];
    secondAddresses = [
      {
        cosmos: 'cosmos1ex5jkphkzdgvm08qqlfd4rfcp78gqsg57lpfms',
        terra: 'terra1g9n44s3jp8hazt3mcyx8jy7cx5qdrd56uzg7wv',
        ethermint: '0x2370aDcbE0d9FBD581a0F881f2278d2EB626E8A8',
      },
      {
        cosmos: 'cosmos1x52a47k685xtjzv20vs8ukglh24exsm3hrszxw',
        terra: 'terra1crepeq9j9y05qrxrqnrj2462u7leya892u0r7k',
        ethermint: '0x95D781AA5A28599633dF91D7B6257BD61fb38D63',
      },
      {
        cosmos: 'cosmos1xtgkfd50znkhphca7j7eue9skxky9x8f07sk4y',
        terra: 'terra1j4fv4yfupaqpw2uevdwwwlufyxjv5fh9dhphqa',
        ethermint: '0x5Ac498aa00E48d2f04dD9C240BC53027D49702Ea',
      },
    ];
  });

  it('should get an cosmos address from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const firstAddress = firstAddresses[i];
      expect(await signer.getAddress(derivations.cosmos(0))).toBe(
        firstAddress.cosmos
      );
    }
  });

  it('should get the second cosmos address form the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const secondAddress = secondAddresses[i];
      expect(await signer.getAddress(derivations.cosmos(1))).toBe(
        secondAddress.cosmos
      );
    }
  });

  it('should get an terra address from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const firstAddress = firstAddresses[i];
      expect(await signer.getAddress(derivations.terra(0))).toBe(
        firstAddress.terra
      );
    }
  });

  it('should get the second terra address form the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const secondAddress = secondAddresses[i];
      expect(await signer.getAddress(derivations.terra(1))).toBe(
        secondAddress.terra
      );
    }
  });

  it('should get a first ethermint evm-like address from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const firstAddress = firstAddresses[i];
      expect(await signer.getEthermintAddress(derivations.ethermint(0))).toBe(
        firstAddress.ethermint
      );
    }
  });

  it('should get the second ethermint evm-like address from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const secondAddress = secondAddresses[i];
      expect(await signer.getEthermintAddress(derivations.ethermint(1))).toBe(
        secondAddress.ethermint
      );
    }
  });

  it('should get the evoms address from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const firstAddress = firstAddresses[i];
      expect(await signer.getAddress(derivations.ethermint(0), 'evmos')).toBe(
        firstAddress.evmos
      );
    }
  });

  it('should get a zetachain address from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const firstAddress = firstAddresses[i];
      expect(await signer.getAddress(derivations.ethermint(0), 'zeta')).toBe(
        firstAddress.zetachain
      );
    }
  });

  it('should get a secret address from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const firstAddress = firstAddresses[i];
      expect(await signer.getAddress(derivations.secret(0), 'secret')).toBe(
        firstAddress.secret
      );
    }
  });

  it('should get an akash from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const firstAddress = firstAddresses[i];
      expect(await signer.getAddress(derivations.cosmos(0), 'akash')).toBe(
        firstAddress.akash
      );
    }
  });

  it('should get an dymension from the seed phrase', async () => {
    for (let i = 0; i < signers.length; i++) {
      const signer = signers[i];
      const firstAddress = firstAddresses[i];
      expect(await signer.getAddress(derivations.ethermint(0), 'dym')).toBe(
        firstAddress.dymension
      );
    }
  });
});
