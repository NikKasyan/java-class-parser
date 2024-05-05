import { UInt16 } from "../bytes";
import { WithOffsets } from "./debug";

type AttributeBase = {
  attributeNameIndex: UInt16;
  attributeLength: UInt16;
  info: Uint8Array;
};

export type RawAttributeInfo = AttributeBase;

export type RawAttributeInfoWithOffsets = WithOffsets<RawAttributeInfo>;
