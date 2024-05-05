export type UInt8 = number;
export type UInt16 = number;
export type UInt32 = number;
export type UInt64 = number;

export class Uint8ArraySlice implements Iterable<UInt8> {
  constructor(
    private readonly bytes: Uint8Array,
    private readonly offset: number,
    public readonly length: number
  ) {}

  *[Symbol.iterator](): Iterator<UInt8> {
    for (let i = 0; i < this.length; i++) {
      yield this.bytes[this.offset + i];
    }
  }

  get(index: number): UInt8 {
    if (index < 0 || index >= this.length) {
      throw new Error("Index out of bounds");
    }
    return this.bytes[this.offset + index];
  }
}

export const parseUtf8 = (
  bytes: Uint8Array,
  offset: number,
  length: number
) => {
  const slice = bytes.slice(offset, offset + length);
  const decoder = new TextDecoder();
  return decoder.decode(slice);
};
