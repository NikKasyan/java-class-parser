import { ClassAccessFlags, ParameterAccessFlags } from "../access-flags";
import { UInt16, UInt32, UInt8 } from "../bytes";
import { Annotation, ElementValue, TypeAnnotation } from "./annotation";
import { AttributeStructBase } from "./attributes";
import { ModuleAttribute } from "./module";
import { StackMapTable } from "./stack-map-table";

export type ConstantValueAttribute = {
  name: "ConstantValue";
  constantValueIndex: UInt16;
} & AttributeStructBase;

type ExceptionTableEntry = {
  startPc: UInt16;
  endPc: UInt16;
  handlerPc: UInt16;
  catchType: UInt16;
};

export type CodeAttribute = {
  name: "Code";
  maxStack: UInt16;
  maxLocals: UInt16;
  codeLength: UInt32;
  code: Uint8Array;
  exceptionTableLength: UInt16;
  exceptionTable: ExceptionTableEntry[];
  attributesCount: UInt16;
  attributes: AttributeInfo[];
} & AttributeStructBase;

export type ExceptionsAttribute = {
  name: "Exceptions";
  numberOfExceptions: UInt16;
  exceptionIndexTable: UInt16[];
} & AttributeStructBase;

type InnerClassInfo = {
  innerClassInfoIndex: UInt16;
  outerClassInfoIndex: UInt16;
  innerNameIndex: UInt16;
  innerClassAccessFlags: ClassAccessFlags;
};

export type InnerClassAttribute = {
  name: "InnerClasses";
  numberOfClasses: UInt16;
  classes: InnerClassInfo[];
} & AttributeStructBase;

export type EnclosingMethodAttribute = {
  name: "EnclosingMethod";
  classIndex: UInt16;
  methodIndex: UInt16;
} & AttributeStructBase;

export type SyntheticAttribute = {
  name: "Synthetic";
} & AttributeStructBase;

export type SignatureAttribute = {
  name: "Signature";
  signatureIndex: UInt16;
} & AttributeStructBase;

export type SourceFileAttribute = {
  name: "SourceFile";
  sourceFileIndex: UInt16;
} & AttributeStructBase;

export type SourceDebugExtensionAttribute = {
  name: "SourceDebugExtension";
  debugExtension: Uint8Array;
} & AttributeStructBase;

type LineNumberTableEntry = {
  startPc: UInt16;
  lineNumber: UInt16;
};

export type LineNumberTableAttribute = {
  name: "LineNumberTable";
  lineNumberTableLength: UInt16;
  lineNumberTable: LineNumberTableEntry[];
} & AttributeStructBase;

type LocalVariableTableEntry = {
  startPc: UInt16;
  length: UInt16;
  nameIndex: UInt16;
  descriptorIndex: UInt16;
  index: UInt16;
};

export type LocalVariableTableAttribute = {
  name: "LocalVariableTable";
  localVariableTableLength: UInt16;
  localVariableTable: LocalVariableTableEntry[];
} & AttributeStructBase;

type LocalVariableTypeTableEntry = {
  startPc: UInt16;
  length: UInt16;
  nameIndex: UInt16;
  signatureIndex: UInt16;
  index: UInt16;
};

export type LocalVariableTypeTableAttribute = {
  name: "LocalVariableTypeTable";
  localVariableTypeTableLength: UInt16;
  localVariableTypeTable: LocalVariableTypeTableEntry[];
} & AttributeStructBase;

export type DeprecatedAttribute = {
  name: "Deprecated";
} & AttributeStructBase;

export type RuntimeVisibleAnnotationsAttribute = {
  name: "RuntimeVisibleAnnotations";
  numAnnotations: UInt16;
  annotations: Annotation[];
} & AttributeStructBase;

export type RuntimeInvisibleAnnotationsAttribute = {
  name: "RuntimeInvisibleAnnotations";
  numAnnotations: UInt16;
  annotations: Annotation[];
} & AttributeStructBase;

type ParameterAnnotation = {
  numAnnotations: UInt16;
  annotations: Annotation[];
};
export type RuntimeVisibleParameterAnnotationsAttribute = {
  name: "RuntimeVisibleParameterAnnotations";
  numParameters: UInt8;
  parameterAnnotations: ParameterAnnotation[];
} & AttributeStructBase;

export type RuntimeInvisibleParameterAnnotationsAttribute = {
  name: "RuntimeInvisibleParameterAnnotations";
  numParameters: UInt8;
  parameterAnnotations: ParameterAnnotation[];
} & AttributeStructBase;

type RuntimeVisibleTypeAnnotationsAttribute = {
  name: "RuntimeVisibleTypeAnnotations";
  numAnnotations: UInt16;
  annotations: TypeAnnotation[];
} & AttributeStructBase;

type RuntimeInvisibleTypeAnnotationsAttribute = {
  name: "RuntimeInvisibleTypeAnnotations";
  numAnnotations: UInt16;
  annotations: TypeAnnotation[];
} & AttributeStructBase;

type AnnotationDefaultAttribute = {
  name: "AnnotationDefault";
  defaultValue: ElementValue;
} & AttributeStructBase;

type BootstrapMethod = {
  bootstrapMethodRef: UInt16;
  numBootstrapArguments: UInt16;
  bootstrapArguments: UInt16[];
};

type BootstrapMethodsAttribute = {
  name: "BootstrapMethods";
  numBootstrapMethods: UInt16;
  bootstrapMethods: BootstrapMethod[];
} & AttributeStructBase;

type MethodParametersEntry = {
  nameIndex: UInt16;
  accessFlags: ParameterAccessFlags;
};

export type MethodParametersAttribute = {
  name: "MethodParameters";
  parametersCount: UInt8;
  parameters: MethodParametersEntry[];
} & AttributeStructBase;

export type ModulePackagesAttribute = {
  name: "ModulePackages";
  numPackages: UInt16;
  packageIndexTable: UInt16[];
} & AttributeStructBase;

export type ModuleMainClassAttribute = {
  name: "ModuleMainClass";
  mainClassIndex: UInt16;
} & AttributeStructBase;

export type NestHostAttribute = {
  name: "NestHost";
  hostClassIndex: UInt16;
} & AttributeStructBase;

export type NestMembersAttribute = {
  name: "NestMembers";
  numberOfClasses: UInt16;
  classes: UInt16[];
} & AttributeStructBase;

type RecordComponentInfo = {
  nameIndex: UInt16;
  descriptorIndex: UInt16;
  attributesCount: UInt16;
  attributes: AttributeInfo[];
};

export type RecordAttribute = {
  name: "Record";
  componentCount: UInt16;
  components: RecordComponentInfo[];
} & AttributeStructBase;

export type PermittedSubclassesAttribute = {
  name: "PermittedSubclasses";
  numberOfClasses: UInt16;
  classes: UInt16[];
} & AttributeStructBase;

export type AttributeInfo =
  | ConstantValueAttribute
  | CodeAttribute
  | StackMapTable
  | ExceptionsAttribute
  | InnerClassAttribute
  | EnclosingMethodAttribute
  | SyntheticAttribute
  | SignatureAttribute
  | SourceFileAttribute
  | SourceDebugExtensionAttribute
  | LineNumberTableAttribute
  | LocalVariableTableAttribute
  | LocalVariableTypeTableAttribute
  | DeprecatedAttribute
  | RuntimeVisibleAnnotationsAttribute
  | RuntimeInvisibleAnnotationsAttribute
  | RuntimeVisibleParameterAnnotationsAttribute
  | RuntimeInvisibleParameterAnnotationsAttribute
  | RuntimeVisibleTypeAnnotationsAttribute
  | RuntimeInvisibleTypeAnnotationsAttribute
  | AnnotationDefaultAttribute
  | BootstrapMethodsAttribute
  | MethodParametersAttribute
  | ModuleAttribute
  | ModulePackagesAttribute
  | ModuleMainClassAttribute
  | NestHostAttribute
  | NestMembersAttribute
  | RecordAttribute
  | PermittedSubclassesAttribute;
