import { ConstPoolInfoType, ConstPoolTag } from "./raw/const-pool";

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
// Yep needs its own implementation Page 93 of the JVM specification
const parseModifiedUtf8Internal = (
  bytes: Uint8Array,
  offset: number = 0,
  length: number = bytes.length
) => {
  const slice = bytes.slice(offset, offset + length);
  const codePoints = [];
  for (let i = 0; i < slice.length; i++) {
    const byte = slice[i];
    if (byte === 0 || byte > 0x7f) {
      throw new Error("Invalid UTF-8 encoding");
    }
    if (byte < 0x80) {
      codePoints.push(byte);
    } else {
      const u = byte;
      const v = slice[++i];
      if ((v & 0xc0) !== 0x80) {
        throw new Error("Invalid UTF-8 encoding");
      }
      if (u < 0xe0) {
        codePoints.push(((u & 0x1f) << 6) + (v & 0x3f));
      } else {
        const w = slice[++i];
        if ((w & 0xc0) !== 0x80) {
          throw new Error("Invalid UTF-8 encoding");
        }
        if (u < 0xf0) {
          codePoints.push(((u & 0x0f) << 12) + ((v & 0x3f) << 6) + (w & 0x3f));
        } else {
          const x = slice[++i];
          if ((x & 0xc0) !== 0x80) {
            throw new Error("Invalid UTF-8 encoding");
          }
          if (u < 0xf8) {
            const char =
              0x10000 +
              ((v & 0x0f) << 16) +
              ((w & 0x3f) << 10) +
              ((x & 0x0f) << 6) +
              (slice[++i] & 0x3f);
            codePoints.push(char);
          } else {
            throw new Error("Invalid UTF-8 encoding");
          }
        }
      }
    }
  }
  return String.fromCodePoint(...codePoints);
};

export function parseUtf8(
  bytes: Uint8Array,
  offset?: number,
  length?: number
): string;
export function parseUtf8(
  utf8Info: ConstPoolInfoType<ConstPoolTag.Utf8>
): string;

export function parseUtf8(
  utf8InfoOrBytes: ConstPoolInfoType<ConstPoolTag.Utf8> | Uint8Array,
  offset: number = 0,
  length: number = utf8InfoOrBytes.length
): string {
  if (isUtf8Info(utf8InfoOrBytes)) {
    return parseModifiedUtf8Internal(
      utf8InfoOrBytes.bytes,
      0,
      utf8InfoOrBytes.length
    );
  }
  return parseModifiedUtf8Internal(utf8InfoOrBytes, offset, length);
}

function isUtf8Info(
  utf8InfoOrBytes: ConstPoolInfoType<ConstPoolTag.Utf8> | Uint8Array
): utf8InfoOrBytes is ConstPoolInfoType<ConstPoolTag.Utf8> {
  return (
    (utf8InfoOrBytes as ConstPoolInfoType<ConstPoolTag.Utf8>).tag ===
    ConstPoolTag.Utf8
  );
}
