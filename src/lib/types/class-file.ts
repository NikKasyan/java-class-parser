import {
  ClassAccessFlags,
  FieldAccessFlags,
  MethodAccessFlags,
} from "./access-flags";
import { AttributeInfo } from "./attributes/";
import { RawAttributeInfo } from "./raw/attributes";
import { ConstPoolTagInfo } from "./raw/const-pool";
import { RawMethodInfo } from "./raw/method";
import {
  RawClassFile,
  RawConstantPoolInfo,
  RawFieldInfos,
} from "./raw/raw-class";
import { Version } from "./version";

export type Constant = {
  tagInfo: ConstPoolTagInfo;
  value?: unknown;
};

export type FieldInfo = {
  accessFlags: FieldAccessFlags;
  nameIndex: number;
  name: string;
  descriptorIndex: number;
  descriptor: string;
  attributes: AttributeInfo[];
};

export type MethodInfo = {
  accessFlags: MethodAccessFlags;
  nameIndex: number;
  name: string;
  descriptorIndex: number;
  descriptor: string;
  attributes: AttributeInfo[];
};

export type ThisClass = {
  index: number;
  name: string;
};

export type SuperClass = {
  index: number;
  name: string;
};

export type Interface = {
  index: number;
  name: string;
};

export type ClassFile = {
  version: Version;
  minorVersion: number;
  constantPool: Constant[];
  accessFlags: ClassAccessFlags;
  thisClass: ThisClass;
  superClass: SuperClass;
  interfaces: Interface[];
  fields: FieldInfo[];
  methods: MethodInfo[];
  attributes: AttributeInfo[];
};

export type ConstantWithRaw = Constant & { raw: RawConstantPoolInfo };
export type FieldInfoWithRaw = FieldInfo & { raw: RawFieldInfos };
export type MethodInfoWithRaw = MethodInfo & { raw: RawMethodInfo };
export type AttributeInfoWithRaw = AttributeInfo & { raw: RawAttributeInfo };

export type ClassFileWithRaw = {
  version: Version;
  minorVersion: number;
  constantPool: ConstantWithRaw[];
  accessFlags: ClassAccessFlags;
  thisClass: ThisClass;
  superClass: SuperClass;
  interfaces: Interface[];
  fields: FieldInfoWithRaw[];
  methods: MethodInfoWithRaw[];
  attributes: AttributeInfoWithRaw[];
  raw: RawClassFile;
};
