import { parseRawClassFile } from "./raw-class-parser";
import {
  ClassFile,
  ClassFileWithRaw,
  extractFromRawClassFile,
} from "./types/class-file";

const MAGIC = 0xcafebabe;

export function parseClassFile(
  bytes: Uint8Array,
  includeRaw: true
): ClassFileWithRaw;

export function parseClassFile(bytes: Uint8Array, includeRaw: false): ClassFile;

export function parseClassFile(
  bytes: Uint8Array,
  includeRaw: boolean
): ClassFile | ClassFileWithRaw;

export function parseClassFile(
  bytes: Uint8Array,
  includeRaw = true
): ClassFile | ClassFileWithRaw {
  return extractFromRawClassFile(parseRawClassFile(bytes), includeRaw);
}
