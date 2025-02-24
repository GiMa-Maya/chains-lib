export type NumberIsh = string | number | bigint; // 1 || '1' || 0x1

export type HexString = string; // '0x...'

export interface FeeData {
  gasLimit: NumberIsh;
  gasPrice?: NumberIsh;
  maxFeePerGas?: NumberIsh;
  maxPriorityFeePerGas?: NumberIsh;
}

export enum MsgEncoding {
  buffer = 'buffer',
  object = 'object',
  base64 = 'base64',
  string = 'string',
  unsigned = 'unsigned',
}
