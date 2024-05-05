import { RawAttributeInfo } from "./attributes";
import { UInt16 } from "../bytes";
import { WithOffsets } from "./debug";

export type RawFieldInfo = {
  accessFlags: UInt16;
  nameIndex: UInt16;
  descriptorIndex: UInt16;
  attributesCount: UInt16;
  attributes: RawAttributeInfo[];
};

export type RawFieldInfoWithOffsets = WithOffsets<RawFieldInfo>;
