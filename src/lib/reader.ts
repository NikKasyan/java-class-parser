import { UInt16, UInt32, UInt64, UInt8 } from "./types/bytes";

export interface Reader {
  readUint8: () => UInt8;
  readUint16: () => UInt16;
  readUint32: () => UInt32;
  readUint64: () => UInt64;
  readBytes: (length: number) => Uint8Array;
  skip: (length: number) => void;
  offset: () => number;
}

export const newReader = (array: Uint8Array, startOffset = 0): Reader => {
  let offset = startOffset;
  const readUint8 = () => {
    if (array.length < offset + 1) throw new Error("Invalid byte length");
    return array[offset++] & 0xff;
  };
  const readUint16 = () => {
    if (array.length < offset + 2) throw new Error("Invalid byte length");
    const value = (array[offset] << 8) | array[offset + 1];
    offset += 2;
    return value & 0xffff;
  };
  const readUint32 = () => {
    if (array.length < offset + 4) throw new Error("Invalid byte length");
    const value =
      (array[offset] << 24) |
      (array[offset + 1] << 16) |
      (array[offset + 2] << 8) |
      array[offset + 3];
    offset += 4;
    return value & 0xffffffff;
  };
  const readUint64 = () => {
    if (array.length < offset + 8) throw new Error("Invalid byte length");
    const value =
      (array[offset] << 56) |
      (array[offset + 1] << 48) |
      (array[offset + 2] << 40) |
      (array[offset + 3] << 32) |
      (array[offset + 4] << 24) |
      (array[offset + 5] << 16) |
      (array[offset + 6] << 8) |
      array[offset + 7];
    offset += 8;
    return value;
  };

  const readBytes = (length: number) => {
    if (array.length < offset + length) throw new Error("Invalid byte length");
    const slice = array.slice(offset, offset + length);
    offset += length;
    return slice;
  };

  const skip = (length: number) => {
    if (array.length < offset + length) throw new Error("Invalid byte length");
    offset += length;
  };

  return {
    readUint8,
    readUint16,
    readUint32,
    readUint64,
    readBytes,
    skip,
    offset: () => offset,
  };
};
