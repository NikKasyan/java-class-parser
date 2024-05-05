import { Versions } from "../../version";
import { UInt16, UInt32, UInt8 } from "../bytes";
import { Version } from "../version";
import { WithOffsets } from "./debug";

// See Java SE Spec 22 Chapter 4.4 Constant Pool
export enum ConstPoolTag {
  Utf8 = 1,
  Integer = 3,
  Float = 4,
  Long = 5,
  Double = 6,
  Class = 7,
  String = 8,
  FieldRef = 9,
  MethodRef = 10,
  InterfaceMethodRef = 11,
  NameAndType = 12,
  MethodHandle = 15,
  MethodType = 16,
  Dynamic = 17,
  InvokeDynamic = 18,
  Module = 19,
  Package = 20,
}

export type ConstPoolTagInfo = {
  tag: ConstPoolTag;
  kind: string;
  sinceVersion: Version;
} & (
  | {
      loadable: false;
    }
  | {
      loadable: true;
      loadableSince: Version;
    }
);

export const ConstPoolTags: {
  [K in ConstPoolTag]: ConstPoolTagInfo;
} = {
  [ConstPoolTag.Utf8]: {
    tag: ConstPoolTag.Utf8,
    kind: "CONSTANT_Utf8",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: false,
  },
  [ConstPoolTag.Integer]: {
    tag: ConstPoolTag.Integer,
    kind: "CONSTANT_Integer",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: true,
    loadableSince: Versions.JAVA_1_0_2,
  },
  [ConstPoolTag.Float]: {
    tag: ConstPoolTag.Float,
    kind: "CONSTANT_Float",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: true,
    loadableSince: Versions.JAVA_1_0_2,
  },
  [ConstPoolTag.Long]: {
    tag: ConstPoolTag.Long,
    kind: "CONSTANT_Long",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: true,
    loadableSince: Versions.JAVA_1_0_2,
  },
  [ConstPoolTag.Double]: {
    tag: ConstPoolTag.Double,
    kind: "CONSTANT_Double",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: true,
    loadableSince: Versions.JAVA_1_0_2,
  },
  [ConstPoolTag.Class]: {
    tag: ConstPoolTag.Class,
    kind: "CONSTANT_Class",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: true,
    loadableSince: Versions.JAVA_5_0,
  },
  [ConstPoolTag.String]: {
    tag: ConstPoolTag.String,
    kind: "CONSTANT_String",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: true,
    loadableSince: Versions.JAVA_1_0_2,
  },
  [ConstPoolTag.FieldRef]: {
    tag: ConstPoolTag.FieldRef,
    kind: "CONSTANT_FieldRef",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: false,
  },
  [ConstPoolTag.MethodRef]: {
    tag: ConstPoolTag.MethodRef,
    kind: "CONSTANT_MethodRef",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: false,
  },
  [ConstPoolTag.InterfaceMethodRef]: {
    tag: ConstPoolTag.InterfaceMethodRef,
    kind: "CONSTANT_InterfaceMethodRef",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: false,
  },
  [ConstPoolTag.NameAndType]: {
    tag: ConstPoolTag.NameAndType,
    kind: "CONSTANT_NameAndType",
    sinceVersion: Versions.JAVA_1_0_2,
    loadable: false,
  },
  [ConstPoolTag.MethodHandle]: {
    tag: ConstPoolTag.MethodHandle,
    kind: "CONSTANT_MethodHandle",
    sinceVersion: Versions.JAVA_7,
    loadable: true,
    loadableSince: Versions.JAVA_7,
  },
  [ConstPoolTag.MethodType]: {
    tag: ConstPoolTag.MethodType,
    kind: "CONSTANT_MethodType",
    sinceVersion: Versions.JAVA_7,
    loadable: true,
    loadableSince: Versions.JAVA_7,
  },
  [ConstPoolTag.Dynamic]: {
    tag: ConstPoolTag.Dynamic,
    kind: "CONSTANT_Dynamic",
    sinceVersion: Versions.JAVA_11,
    loadable: true,
    loadableSince: Versions.JAVA_11,
  },
  [ConstPoolTag.InvokeDynamic]: {
    tag: ConstPoolTag.InvokeDynamic,
    kind: "CONSTANT_InvokeDynamic",
    sinceVersion: Versions.JAVA_7,
    loadable: false,
  },
  [ConstPoolTag.Module]: {
    tag: ConstPoolTag.Module,
    kind: "CONSTANT_Module",
    sinceVersion: Versions.JAVA_9,
    loadable: false,
  },
  [ConstPoolTag.Package]: {
    tag: ConstPoolTag.Package,
    kind: "CONSTANT_Package",
    sinceVersion: Versions.JAVA_9,
    loadable: false,
  },
};

type ConstantClassInfo = {
  tag: ConstPoolTag.Class;
  nameIndex: UInt16;
};

type ConstantFieldRefInfo = {
  tag: ConstPoolTag.FieldRef;
  classIndex: UInt16;
  nameAndTypeIndex: UInt16;
};

type ConstantMethodRefInfo = {
  tag: ConstPoolTag.MethodRef;
  classIndex: UInt16;
  nameAndTypeIndex: UInt16;
};

type ConstantInterfaceMethodRefInfo = {
  tag: ConstPoolTag.InterfaceMethodRef;
  classIndex: UInt16;
  nameAndTypeIndex: UInt16;
};

type ConstantStringInfo = {
  tag: ConstPoolTag.String;
  stringIndex: UInt16;
};

type ConstantIntegerInfo = {
  tag: ConstPoolTag.Integer;
  bytes: UInt32;
};

type ConstantFloatInfo = {
  tag: ConstPoolTag.Float;
  bytes: UInt32;
};

type ConstantLongInfo = {
  tag: ConstPoolTag.Long;
  highBytes: UInt32;
  lowBytes: UInt32;
};

type ConstantDoubleInfo = {
  tag: ConstPoolTag.Double;
  highBytes: UInt32;
  lowBytes: UInt32;
};

type ConstantNameAndTypeInfo = {
  tag: ConstPoolTag.NameAndType;
  nameIndex: UInt16;
  descriptorIndex: UInt16;
};

type ConstantUtf8Info = {
  tag: ConstPoolTag.Utf8;
  length: UInt16;
  bytes: Uint8Array;
};

type ConstantMethodHandleInfo = {
  tag: ConstPoolTag.MethodHandle;
  referenceKind: UInt8;
  referenceIndex: UInt16;
};

type ConstantMethodTypeInfo = {
  tag: ConstPoolTag.MethodType;
  descriptorIndex: UInt16;
};

type ConstantInvokeDynamicInfo = {
  tag: ConstPoolTag.InvokeDynamic;
  bootstrapMethodAttrIndex: UInt16;
  nameAndTypeIndex: UInt16;
};

type ConstantDynamicInfo = {
  tag: ConstPoolTag.Dynamic;
  bootstrapMethodAttrIndex: UInt16;
  nameAndTypeIndex: UInt16;
};

type ConstantModuleInfo = {
  tag: ConstPoolTag.Module;
  nameIndex: UInt16;
};

type ConstantPackageInfo = {
  tag: ConstPoolTag.Package;
  nameIndex: UInt16;
};

export type ConstPoolInfoType<T extends ConstPoolTag> = {
  [ConstPoolTag.Utf8]: ConstantUtf8Info;
  [ConstPoolTag.Integer]: ConstantIntegerInfo;
  [ConstPoolTag.Float]: ConstantFloatInfo;
  [ConstPoolTag.Long]: ConstantLongInfo;
  [ConstPoolTag.Double]: ConstantDoubleInfo;
  [ConstPoolTag.Class]: ConstantClassInfo;
  [ConstPoolTag.String]: ConstantStringInfo;
  [ConstPoolTag.FieldRef]: ConstantFieldRefInfo;
  [ConstPoolTag.MethodRef]: ConstantMethodRefInfo;
  [ConstPoolTag.InterfaceMethodRef]: ConstantInterfaceMethodRefInfo;
  [ConstPoolTag.NameAndType]: ConstantNameAndTypeInfo;
  [ConstPoolTag.MethodHandle]: ConstantMethodHandleInfo;
  [ConstPoolTag.MethodType]: ConstantMethodTypeInfo;
  [ConstPoolTag.Dynamic]: ConstantDynamicInfo;
  [ConstPoolTag.InvokeDynamic]: ConstantInvokeDynamicInfo;
  [ConstPoolTag.Module]: ConstantModuleInfo;
  [ConstPoolTag.Package]: ConstantPackageInfo;
}[T];

type ConstPoolInfoBase = {
  tag: ConstPoolTag;
};
export type ConstPoolInfo = (
  | ConstantClassInfo
  | ConstantFieldRefInfo
  | ConstantMethodRefInfo
  | ConstantInterfaceMethodRefInfo
  | ConstantStringInfo
  | ConstantIntegerInfo
  | ConstantFloatInfo
  | ConstantLongInfo
  | ConstantDoubleInfo
  | ConstantNameAndTypeInfo
  | ConstantUtf8Info
  | ConstantMethodHandleInfo
  | ConstantMethodTypeInfo
  | ConstantInvokeDynamicInfo
  | ConstantDynamicInfo
  | ConstantModuleInfo
  | ConstantPackageInfo
) &
  ConstPoolInfoBase;

export type ConstPoolInfoWithOffsets = WithOffsets<ConstPoolInfo>;
