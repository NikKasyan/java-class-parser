import {
  RawAttributeInfo as RawAttributeInfo,
  RawAttributeInfoWithOffsets,
} from "./attributes";
import { UInt16, UInt32 } from "../bytes";
import { ConstPoolInfo, ConstPoolInfoWithOffsets } from "./const-pool";
import {
  RawFieldInfoWithOffsets,
  RawFieldInfo as RawFieldInfo,
} from "./field-infos";
import {
  RawMethodInfoWithOffsets,
  RawMethodInfo as RawMethodInfo,
} from "./method";

export type RawConstantPoolInfo = ConstPoolInfo;
export type RawConstantPool = ConstPoolInfo[];

export type RawFieldInfos = RawFieldInfo[];

export type RawMethodInfos = RawMethodInfo[];

export type RawAttributeInfos = RawAttributeInfo[];

export type RawClassFile = {
  magic: UInt32;
  minorVersion: UInt16;
  majorVersion: UInt16;
  constantPoolCount: UInt16;
  constantPool: RawConstantPool;
  accessFlags: UInt16;
  thisClass: UInt16;
  superClass: UInt16;
  interfacesCount: UInt16;
  interfaces: UInt16[];
  fieldsCount: UInt16;
  fields: RawFieldInfos;
  methodsCount: UInt16;
  methods: RawMethodInfos;
  attributesCount: UInt16;
  attributes: RawAttributeInfos;
};

export type RawClassFileWithOffsets = {
  magic: UInt32;
  minorVersion: UInt16;
  majorVersion: UInt16;
  constantPoolCount: UInt16;
  constantPool: ConstPoolInfoWithOffsets[];
  accessFlags: UInt16;
  thisClass: UInt16;
  superClass: UInt16;
  interfacesCount: UInt16;
  interfaces: UInt16[];
  fieldsCount: UInt16;
  fields: RawFieldInfoWithOffsets[];
  methodsCount: UInt16;
  methods: RawMethodInfoWithOffsets[];
  attributesCount: UInt16;
  attributes: RawAttributeInfoWithOffsets[];
};
