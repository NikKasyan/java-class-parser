import { UInt16, UInt8 } from "../bytes";
import { ConstPoolTag } from "../raw/const-pool";

//Table 4.7.16.1-A. Element type
export enum ElementType {
  Byte = "B".charCodeAt(0),
  Char = "C".charCodeAt(0),
  Double = "D".charCodeAt(0),
  Float = "F".charCodeAt(0),
  Int = "I".charCodeAt(0),
  Long = "J".charCodeAt(0),
  Short = "S".charCodeAt(0),
  Boolean = "Z".charCodeAt(0),
  String = "s".charCodeAt(0),
  Enum = "e".charCodeAt(0),
  Class = "c".charCodeAt(0),
  Annotation = "@".charCodeAt(0),
  Array = "[".charCodeAt(0),
}

type ByteValue = {
  tag: ElementType.Byte;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Integer;
};

type CharValue = {
  tag: ElementType.Char;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Integer;
};

type DoubleValue = {
  tag: ElementType.Double;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Double;
};

type FloatValue = {
  tag: ElementType.Float;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Float;
};

type IntValue = {
  tag: ElementType.Int;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Integer;
};

type LongValue = {
  tag: ElementType.Long;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Long;
};

type ShortValue = {
  tag: ElementType.Short;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Integer;
};

type BooleanValue = {
  tag: ElementType.Boolean;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Integer;
};

type StringValue = {
  tag: ElementType.String;
  constValueIndex: UInt16;
  constType: ConstPoolTag.Utf8;
};

export type EnumValue = {
  tag: ElementType.Enum;
  typeNameIndex: UInt16;
  constNameIndex: UInt16;
};

type ClassValue = {
  tag: ElementType.Class;
  classInfoIndex: UInt16;
};

type AnnotationValue = {
  tag: ElementType.Annotation;
  annotationValue: Annotation;
};

type ArrayValue = {
  tag: ElementType.Array;
  numValues: UInt16;
  values: ElementValue[];
};

export type ElementValue =
  | ByteValue
  | CharValue
  | DoubleValue
  | FloatValue
  | IntValue
  | LongValue
  | ShortValue
  | BooleanValue
  | StringValue
  | EnumValue
  | ClassValue
  | AnnotationValue
  | ArrayValue;

export type ElementValuePair = {
  elementNameIndex: UInt16;
  elementName: string;
  value: ElementValue;
};

export type Annotation = {
  typeIndex: UInt16;
  numElementValuePairs: UInt16;
  elementValuePairs: ElementValuePair[];
};

export enum TargetType {
  TypeParameterClass = 0x00,
  TypeParameterMethod = 0x01,
  SuperType = 0x10,
  TypeParameterBoundClass = 0x11,
  TypeParameterBoundMethod = 0x12,
  TypeParameterEmptyFieldOrRecord = 0x13,
  TypeParameterEmptyReturnMethod = 0x14,
  TypeParameterEmptyReceiverMethod = 0x15,
  TypeParameterFormalParameter = 0x16,
  Throws = 0x17,
  LocalVar = 0x40,
  ResourceVar = 0x41,
  CatchExceptionTable = 0x42,
  InstanceOf = 0x43,
  New = 0x44,
  MethodRefNew = 0x45, // ::new
  MethodRefIdentifier = 0x46, // ::
  Cast = 0x47,
  Constructor = 0x48,
  TypeArgumentMethod = 0x49,
  TypeArgumentConstructor = 0x4a,
  TypeArgumentIdentifier = 0x4b,
}

export enum TypePathKind {
  Array = 0,
  Nested = 1,
  Bound = 2,
  TypeArgument = 3,
}

export type Path = {
  typePathKind: TypePathKind;
  typeArgumentIndex: UInt8;
};

export type TargetPath = {
  pathLength: UInt8;
  paths: Path[];
};

type BaseTypeAnnotation = {
  targetPath: TargetPath;
  typeIndex: UInt16;
  numElementValuePairs: UInt16;
  elementValuePairs: ElementValuePair[];
};

export type TypeParameterTargetInfo = {
  typeParameterIndex: UInt8;
};

type TypeParameterTargetAnnotation = {
  targetType: TargetType.TypeParameterClass | TargetType.TypeParameterMethod;
  targetInfo: TypeParameterTargetInfo;
} & BaseTypeAnnotation;

export type SuperTypeTargetInfo = {
  superTypeIndex: UInt16;
};

type SuperTypeTargetAnnotation = {
  targetType: TargetType.SuperType;
  targetInfo: SuperTypeTargetInfo;
} & BaseTypeAnnotation;

export type TypeParameterBoundTargetInfo = {
  typeParameterIndex: UInt8;
  boundIndex: UInt8;
};

type TypeParameterBoundTargetAnnotation = {
  targetType:
    | TargetType.TypeParameterBoundClass
    | TargetType.TypeParameterBoundMethod;
  targetInfo: TypeParameterBoundTargetInfo;
} & BaseTypeAnnotation;

export type EmptyTargetInfo = {};

type EmptyTargetAnnotation = {
  targetType:
    | TargetType.TypeParameterEmptyFieldOrRecord
    | TargetType.TypeParameterEmptyReturnMethod
    | TargetType.TypeParameterEmptyReceiverMethod;
  targetInfo: EmptyTargetInfo;
} & BaseTypeAnnotation;

export type FormalParameterTargetInfo = {
  formalParameterIndex: UInt8;
};

type FormalParameterTargetAnnotation = {
  targetType: TargetType.TypeParameterFormalParameter;
  targetInfo: FormalParameterTargetInfo;
} & BaseTypeAnnotation;

export type ThrowsTargetInfo = {
  throwsTypeIndex: UInt16;
};

type ThrowsTargetAnnotation = {
  targetType: TargetType.Throws;
  targetInfo: ThrowsTargetInfo;
} & BaseTypeAnnotation;

type TableEntry = {
  startPc: UInt16;
  length: UInt16;
  index: UInt16;
};

export type LocalVarTargetInfo = {
  tableLength: UInt16;
  table: TableEntry[];
};

type LocalVarTargetAnnotation = {
  targetType: TargetType.LocalVar | TargetType.ResourceVar;
  targetInfo: LocalVarTargetInfo;
} & BaseTypeAnnotation;

export type CatchExceptionTableTargetInfo = {
  exceptionIndex: UInt16;
};

type CatchExceptionTableTargetAnnotation = {
  targetType: TargetType.CatchExceptionTable;
  targetInfo: CatchExceptionTableTargetInfo;
} & BaseTypeAnnotation;

export type OffsetTargetInfo = {
  offset: UInt16;
};

type OffsetTargetAnnotation = {
  targetType:
    | TargetType.InstanceOf
    | TargetType.New
    | TargetType.MethodRefNew
    | TargetType.MethodRefIdentifier;
  targetInfo: OffsetTargetInfo;
} & BaseTypeAnnotation;

export type TypeArgumentTargetInfo = {
  offset: UInt16;
  typeArgumentIndex: UInt8;
};

type TypeArgumentTargetAnnotation = {
  targetType:
    | TargetType.Cast
    | TargetType.Constructor
    | TargetType.TypeArgumentMethod
    | TargetType.TypeArgumentConstructor
    | TargetType.TypeArgumentIdentifier;
  targetInfo: TypeArgumentTargetInfo;
} & BaseTypeAnnotation;

export type TargetInfo =
  | TypeParameterTargetInfo
  | SuperTypeTargetInfo
  | TypeParameterBoundTargetInfo
  | EmptyTargetInfo
  | FormalParameterTargetInfo
  | ThrowsTargetInfo
  | LocalVarTargetInfo
  | CatchExceptionTableTargetInfo
  | OffsetTargetInfo
  | TypeArgumentTargetInfo;

export type TypeAnnotation =
  | TypeParameterTargetAnnotation
  | SuperTypeTargetAnnotation
  | TypeParameterBoundTargetAnnotation
  | EmptyTargetAnnotation
  | FormalParameterTargetAnnotation
  | ThrowsTargetAnnotation
  | LocalVarTargetAnnotation
  | CatchExceptionTableTargetAnnotation
  | OffsetTargetAnnotation
  | TypeArgumentTargetAnnotation;
