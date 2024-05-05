import { Versions } from "../../version";
import { UInt32 } from "../bytes";
import { Version } from "../version";

type Attribute = {
  name: string;
} & PartialAttributes;
type PartialAttributes = {
  sinceVersion: Version;
  attributeLength?: number;
};

// Todo: Checkout 4.7-C to check where the attributes are used
const AttributesInternal: Record<string, PartialAttributes> = {
  ConstantValue: {
    sinceVersion: Versions.JAVA_1_0_2,
    attributeLength: 2,
  },
  Code: {
    sinceVersion: Versions.JAVA_1_0_2,
  },
  StackMapTable: {
    sinceVersion: Versions.JAVA_6,
  },
  Exceptions: {
    sinceVersion: Versions.JAVA_1_0_2,
  },
  InnerClasses: {
    sinceVersion: Versions.JAVA_1_1,
  },
  EnclosingMethod: {
    sinceVersion: Versions.JAVA_5_0,
  },
  Synthetic: {
    sinceVersion: Versions.JAVA_1_1,
  },
  Signature: {
    sinceVersion: Versions.JAVA_5_0,
  },
  SourceFile: {
    sinceVersion: Versions.JAVA_1_0_2,
  },
  SourceDebugExtension: {
    sinceVersion: Versions.JAVA_5_0,
  },
  LineNumberTable: {
    sinceVersion: Versions.JAVA_1_0_2,
  },
  LocalVariableTable: {
    sinceVersion: Versions.JAVA_1_0_2,
  },
  LocalVariableTypeTable: {
    sinceVersion: Versions.JAVA_5_0,
  },
  Deprecated: {
    sinceVersion: Versions.JAVA_1_1,
  },
  RuntimeVisibleAnnotations: {
    sinceVersion: Versions.JAVA_5_0,
  },
  RuntimeInvisibleAnnotations: {
    sinceVersion: Versions.JAVA_5_0,
  },
  RuntimeVisibleParameterAnnotations: {
    sinceVersion: Versions.JAVA_5_0,
  },
  RuntimeInvisibleParameterAnnotations: {
    sinceVersion: Versions.JAVA_5_0,
  },
  RuntimeVisibleTypeAnnotations: {
    sinceVersion: Versions.JAVA_8,
  },
  RuntimeInvisibleTypeAnnotations: {
    sinceVersion: Versions.JAVA_8,
  },
  AnnotationDefault: {
    sinceVersion: Versions.JAVA_5_0,
  },
  BootstrapMethods: {
    sinceVersion: Versions.JAVA_7,
  },
  MethodParameters: {
    sinceVersion: Versions.JAVA_8,
  },
  Module: {
    sinceVersion: Versions.JAVA_9,
  },
  ModulePackages: {
    sinceVersion: Versions.JAVA_9,
  },
  ModuleMainClass: {
    sinceVersion: Versions.JAVA_9,
  },
  NestHost: {
    sinceVersion: Versions.JAVA_11,
  },
  NestMembers: {
    sinceVersion: Versions.JAVA_11,
  },
  Record: {
    sinceVersion: Versions.JAVA_16,
  },
  PermittedSubclasses: {
    sinceVersion: Versions.JAVA_17,
  },
};

export const Attributes = Object.entries(AttributesInternal).reduce(
  (acc, [name, value]) => {
    const key = name as keyof typeof AttributesInternal;
    acc[key] = { name, ...value };
    return acc;
  },
  {} as Record<keyof typeof AttributesInternal, Attribute>
);

export type AttributeStructBase = {
  attributeLength: UInt32;
};
