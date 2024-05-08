import { parseRawClassFile } from "./raw-class-parser";
import { Reader, newReader } from "./reader";
import {
  ClassAccessFlags,
  ExportAccessFlags,
  FieldAccessFlags,
  MethodAccessFlags,
  ModuleAccessFlags,
  OpenAccessFlags,
  ParameterAccessFlags,
  RequireAccessFlags,
} from "./types/access-flags";
import {
  AppendFrame,
  AttributeInfo,
  CatchExceptionTableTargetInfo,
  ChopFrame,
  ElementType,
  ElementValue,
  ElementValuePair,
  EmptyTargetInfo,
  EnumValue,
  FormalParameterTargetInfo,
  FullFrame,
  LocalVarTargetInfo,
  OffsetTargetInfo,
  Path,
  SameFrame,
  SameFrameExtended,
  SameLocals1StackItemFrame,
  SameLocals1StackItemFrameExtended,
  StackMapFrame,
  SuperTypeTargetInfo,
  TargetInfo,
  TargetPath,
  TargetType,
  ThrowsTargetInfo,
  TypeAnnotation,
  TypeArgumentTargetInfo,
  TypeParameterBoundTargetInfo,
  TypeParameterTargetInfo,
  TypePathKind,
  VerificationTypeInfo,
  VerificationTypeInfoTag,
} from "./types/attributes";
import { ModuleAttribute } from "./types/attributes/module";
import { parseUtf8 } from "./types/bytes";
import {
  AttributeInfoWithRaw,
  ClassFile,
  ClassFileWithRaw,
  Constant,
  FieldInfo,
  Interface,
  MethodInfo,
  SuperClass,
  ThisClass,
} from "./types/class-file";
import { RawAttributeInfo } from "./types/raw/attributes";
import {
  ConstPoolInfo,
  ConstPoolTag,
  ConstPoolTags,
} from "./types/raw/const-pool";
import { RawAttributeInfos, RawClassFile } from "./types/raw/raw-class";
import { getJavaVersionByMajor } from "./version";

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

export function extractFromRawClassFile(
  rawClassFile: RawClassFile,
  includeRaw: true
): ClassFileWithRaw;
export function extractFromRawClassFile(
  rawClassFile: RawClassFile,
  includeRaw: false
): ClassFile;

export function extractFromRawClassFile(
  rawClassFile: RawClassFile,
  includeRaw: boolean
): ClassFile | ClassFileWithRaw;

export function extractFromRawClassFile(
  rawClassFile: RawClassFile,
  includeRaw: boolean
): ClassFile | ClassFileWithRaw {
  const version = getJavaVersionByMajor(rawClassFile.majorVersion);
  const minorVersion = rawClassFile.minorVersion;
  const constPool = extractConstantPool(rawClassFile, includeRaw);
  const accessFlags = new ClassAccessFlags(rawClassFile.accessFlags);
  const thisClass = extractThisClass(rawClassFile, constPool);
  const superClass = extractSuperClass(rawClassFile, constPool);
  const interfaces = extractInterfaces(rawClassFile, constPool);
  const fields = extractFields(rawClassFile, constPool, includeRaw);
  const methods = extractMethods(rawClassFile, constPool, includeRaw);
  const attributes = extractAttributes(
    rawClassFile.attributes,
    constPool,
    includeRaw
  );
  return {
    version,
    minorVersion,
    constantPool: constPool,
    accessFlags,
    thisClass,
    superClass,
    interfaces,
    fields,
    methods,
    attributes,
    raw: includeRaw ? rawClassFile : undefined,
  };
}

const extractConstantPool = (
  rawClassFile: RawClassFile,
  includeRaw: boolean
): Constant[] => {
  return rawClassFile.constantPool.map((constant) => ({
    tagInfo: ConstPoolTags[constant.tag],
    value: extractConstantValue(constant),
    raw: includeRaw ? constant : undefined,
  }));
};

const extractConstantValue = (constant: ConstPoolInfo): unknown => {
  switch (constant.tag) {
    case ConstPoolTag.Class:
      return constant.nameIndex;
    case ConstPoolTag.String:
      return constant.stringIndex;
    case ConstPoolTag.FieldRef:
    case ConstPoolTag.MethodRef:
    case ConstPoolTag.InterfaceMethodRef:
      return {
        classIndex: constant.classIndex,
        nameAndTypeIndex: constant.nameAndTypeIndex,
      };
    case ConstPoolTag.Integer:
    case ConstPoolTag.Float:
      return constant.bytes;
    case ConstPoolTag.Long:
    case ConstPoolTag.Double:
      return {
        highBytes: constant.highBytes,
        lowBytes: constant.lowBytes,
      };
    case ConstPoolTag.NameAndType:
      return {
        nameIndex: constant.nameIndex,
        descriptorIndex: constant.descriptorIndex,
      };
    case ConstPoolTag.Utf8:
      return parseUtf8(constant.bytes);
    case ConstPoolTag.MethodHandle:
      return {
        referenceKind: constant.referenceKind,
        referenceIndex: constant.referenceIndex,
      };
    case ConstPoolTag.MethodType:
      return constant.descriptorIndex;
    default:
      return undefined;
  }
};

const extractThisClass = (
  rawClassFile: RawClassFile,
  constPool: Constant[]
): ThisClass => {
  const thisClass = constPool[rawClassFile.thisClass - 1];
  return {
    index: rawClassFile.thisClass,
    name: thisClass.value as string,
  };
};

const extractSuperClass = (
  rawClassFile: RawClassFile,
  constPool: Constant[]
): SuperClass => {
  const superClass = constPool[rawClassFile.superClass - 1];
  return {
    index: rawClassFile.superClass,
    name: superClass.value as string,
  };
};

const extractInterfaces = (
  rawClassFile: RawClassFile,
  constPool: Constant[]
): Interface[] => {
  return rawClassFile.interfaces.map((index) => {
    const interFace = constPool[index - 1];
    return {
      index,
      name: interFace.value as string,
    };
  });
};

const extractFields = (
  rawClassFile: RawClassFile,
  constPool: Constant[],
  includeRaw: boolean
): FieldInfo[] => {
  return rawClassFile.fields.map((rawField) => {
    const name = constPool[rawField.nameIndex - 1].value as string;
    const descriptor = constPool[rawField.descriptorIndex - 1].value as string;
    const attributes = extractAttributes(
      rawField.attributes,
      constPool,
      includeRaw
    );
    return {
      accessFlags: new FieldAccessFlags(rawField.accessFlags),
      nameIndex: rawField.nameIndex,
      name,
      descriptorIndex: rawField.descriptorIndex,
      descriptor,
      attributes,
      raw: includeRaw ? rawField : undefined,
    };
  });
};

const extractMethods = (
  rawClassFile: RawClassFile,
  constPool: Constant[],
  includeRaw: boolean
): MethodInfo[] => {
  return rawClassFile.methods.map((rawMethod) => {
    const name = constPool[rawMethod.nameIndex - 1].value as string;
    const descriptor = constPool[rawMethod.descriptorIndex - 1].value as string;
    const attributes = extractAttributes(
      rawMethod.attributes,
      constPool,
      includeRaw
    );
    return {
      accessFlags: new MethodAccessFlags(rawMethod.accessFlags),
      nameIndex: rawMethod.nameIndex,
      name,
      descriptorIndex: rawMethod.descriptorIndex,
      descriptor,
      attributes,
      raw: includeRaw ? rawMethod : undefined,
    };
  });
};

const extractAttributes = (
  attributes: RawAttributeInfos,
  constPool: Constant[],
  includeRaw: boolean
): AttributeInfo[] => {
  return attributes.map((rawAttribute) => {
    return extractAttribute(rawAttribute, constPool, includeRaw);
  });
};

const extractAttribute = (
  rawAttribute: RawAttributeInfo,
  constPool: Constant[],
  includeRaw: boolean
): AttributeInfo | AttributeInfoWithRaw => {
  return {
    ...extractAttributeByName(rawAttribute, constPool, includeRaw),
    raw: includeRaw ? rawAttribute : undefined,
  };
};

const extractAttributeByName = (
  rawAttribute: RawAttributeInfo,
  constPool: Constant[],
  includeRaw: boolean
): AttributeInfo => {
  const name = constPool[rawAttribute.attributeNameIndex - 1].value as string;
  const reader = newReader(rawAttribute.info);
  switch (name) {
    case "ConstantValue":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        constantValueIndex: reader.readUint16(),
      };
    case "Code":
      return extractCodeAttribute(rawAttribute, constPool, includeRaw);
    case "StackMapTable":
      return extractStackMapTableAttribute(rawAttribute);
    case "Exceptions":
      return extractExceptionsAttribute(rawAttribute);
    case "InnerClasses":
      return extractInnerClassesAttribute(rawAttribute);
    case "EnclosingMethod":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        classIndex: reader.readUint16(),
        methodIndex: reader.readUint16(),
      };

    case "Synthetic":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
      };
    case "Signature":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        signatureIndex: reader.readUint16(),
      };
    case "SourceFile":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        sourceFileIndex: reader.readUint16(),
      };
    case "SourceDebugExtension":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        debugExtension: reader.readBytes(rawAttribute.attributeLength),
      };
    case "LineNumberTable":
      const lineNumberTableLength = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        lineNumberTableLength,
        lineNumberTable: Array.from({
          length: lineNumberTableLength,
        }).map(() => ({
          startPc: reader.readUint16(),
          lineNumber: reader.readUint16(),
        })),
      };
    case "LocalVariableTable":
      const localVariableTableLength = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        localVariableTableLength,
        localVariableTable: Array.from({
          length: localVariableTableLength,
        }).map(() => ({
          startPc: reader.readUint16(),
          length: reader.readUint16(),
          nameIndex: reader.readUint16(),
          descriptorIndex: reader.readUint16(),
          index: reader.readUint16(),
        })),
      };
    case "LocalVariableTypeTable":
      const localVariableTypeTableLength = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        localVariableTypeTableLength,
        localVariableTypeTable: Array.from({
          length: localVariableTypeTableLength,
        }).map(() => ({
          startPc: reader.readUint16(),
          length: reader.readUint16(),
          nameIndex: reader.readUint16(),
          signatureIndex: reader.readUint16(),
          index: reader.readUint16(),
        })),
      };
    case "Deprecated":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
      };
    case "RuntimeVisibleAnnotations":
    case "RuntimeInvisibleAnnotations": {
      const numAnnotations = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        numAnnotations,
        annotations: extractAnnotations(reader, numAnnotations, constPool),
      };
    }
    case "RuntimeVisibleParameterAnnotations":
    case "RuntimeInvisibleParameterAnnotations":
      const numParameters = reader.readUint8();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        numParameters,
        parameterAnnotations: Array.from({ length: numParameters }).map(() => {
          const numAnnotations = reader.readUint16();
          return {
            numAnnotations,
            annotations: extractAnnotations(reader, numAnnotations, constPool),
          };
        }),
      };
    case "RuntimeVisibleTypeAnnotations":
    case "RuntimeInvisibleTypeAnnotations":
      const numAnnotations = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        numAnnotations,
        annotations: extractTypeAnnotations(reader, numAnnotations, constPool),
      };
    case "AnnotationDefault":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        defaultValue: extractElementValue(reader, constPool),
      };
    case "BootstrapMethods":
      const numBootstrapMethods = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        numBootstrapMethods,
        bootstrapMethods: Array.from({ length: numBootstrapMethods }).map(
          () => {
            const bootstrapMethodRef = reader.readUint16();
            const numBootstrapArguments = reader.readUint16();
            return {
              bootstrapMethodRef,
              numBootstrapArguments,
              bootstrapArguments: Array.from({
                length: numBootstrapArguments,
              }).map(() => reader.readUint16()),
            };
          }
        ),
      };
    case "MethodParameters":
      const parametersCount = reader.readUint8();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        parametersCount,
        parameters: Array.from({ length: parametersCount }).map(() => {
          return {
            nameIndex: reader.readUint16(),
            accessFlags: new ParameterAccessFlags(reader.readUint16()),
          };
        }),
      };
    case "Module":
      return extractModuleAttribute(reader, rawAttribute, constPool);
    case "ModulePackages":
      const numPackages = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        numPackages,
        packageIndexTable: Array.from({ length: numPackages }).map(() =>
          reader.readUint16()
        ),
      };
    case "ModuleMainClass":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        mainClassIndex: reader.readUint16(),
      };
    case "NestHost":
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        hostClassIndex: reader.readUint16(),
      };
    case "NestMembers":
      const numMembers = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        numberOfClasses: numMembers,
        classes: Array.from({ length: numMembers }).map(() =>
          reader.readUint16()
        ),
      };
    case "Record":
      const numComponents = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        componentCount: numComponents,
        components: Array.from({ length: numComponents }).map(() => {
          const nameIndex = reader.readUint16();
          const descriptorIndex = reader.readUint16();
          const attributesCount = reader.readUint16();

          return {
            nameIndex,
            descriptorIndex,
            attributesCount,
            attributes: extractAttributes(
              Array.from({ length: attributesCount }).map(() => {
                const attributeNameIndex = reader.readUint16();
                const attributeLength = reader.readUint32();
                return {
                  attributeNameIndex,
                  attributeLength,
                  info: reader.readBytes(attributeLength),
                };
              }),
              constPool,
              includeRaw
            ),
          };
        }),
      };
    case "PermittedSubclasses":
      const numberOfClasses = reader.readUint16();
      return {
        name,
        attributeLength: rawAttribute.attributeLength,
        numberOfClasses,
        classes: Array.from({ length: numberOfClasses }).map(() =>
          reader.readUint16()
        ),
      };
    default:
      //Todo: Should Ignore new attributes with unknown names
      throw new Error(`Unknown attribute: ${name}`);
  }
};

const extractCodeAttribute = (
  rawAttribute: RawAttributeInfo,
  constPool: Constant[],
  includeRaw: boolean
): AttributeInfo => {
  const reader = newReader(rawAttribute.info);
  const maxStack = reader.readUint16();
  const maxLocals = reader.readUint16();
  const codeLength = reader.readUint32();
  const code = reader.readBytes(codeLength);
  const exceptionTableLength = reader.readUint16();
  const exceptionTable = Array.from({ length: exceptionTableLength }).map(
    () => ({
      startPc: reader.readUint16(),
      endPc: reader.readUint16(),
      handlerPc: reader.readUint16(),
      catchType: reader.readUint16(),
    })
  );
  const attributesCount = reader.readUint16();
  const attributes = extractAttributes(
    Array.from({ length: attributesCount }).map(() => {
      const attributeNameIndex = reader.readUint16();
      const attributeLength = reader.readUint32();
      return {
        attributeNameIndex,
        attributeLength,
        info: reader.readBytes(attributeLength),
      };
    }),
    constPool,
    includeRaw
  );
  return {
    name: "Code",
    attributeLength: rawAttribute.attributeLength,
    maxStack,
    maxLocals,
    codeLength,
    code,
    exceptionTableLength,
    exceptionTable,
    attributesCount,
    attributes,
  };
};

const extractStackMapTableAttribute = (
  rawAttribute: RawAttributeInfo
): AttributeInfo => {
  const reader = newReader(rawAttribute.info);
  const numberOfEntries = reader.readUint16();
  const entries = extractStackFrames(reader, numberOfEntries);
  return {
    name: "StackMapTable",
    attributeLength: rawAttribute.attributeLength,
    numberOfEntries,
    entries,
  };
};

function extractVerificationTypeInfo(
  reader: Reader,
  numberOfVerificationTypeInfos: 1
): [VerificationTypeInfo];

function extractVerificationTypeInfo(
  reader: Reader,
  numberOfVerificationTypeInfos: 2
): [VerificationTypeInfo, VerificationTypeInfo];

function extractVerificationTypeInfo(
  reader: Reader,
  numberOfVerificationTypeInfos: 3
): [VerificationTypeInfo, VerificationTypeInfo, VerificationTypeInfo];

function extractVerificationTypeInfo(
  reader: Reader,
  numberOfVerificationTypeInfos: number
): VerificationTypeInfo[];
function extractVerificationTypeInfo(
  reader: Reader,
  numberOfVerificationTypeInfos: number
): VerificationTypeInfo[] {
  return Array.from<VerificationTypeInfo>({
    length: numberOfVerificationTypeInfos,
  }).map(() => {
    const tag = reader.readUint8();
    switch (tag) {
      case VerificationTypeInfoTag.Top:
      case VerificationTypeInfoTag.Integer:
      case VerificationTypeInfoTag.Float:
      case VerificationTypeInfoTag.Double:
      case VerificationTypeInfoTag.Long:
      case VerificationTypeInfoTag.Null:
      case VerificationTypeInfoTag.UninitializedThis:
        return { tag };
      case VerificationTypeInfoTag.Object:
        return { tag, cpoolIndex: reader.readUint16() };
      case VerificationTypeInfoTag.Uninitialized:
        return { tag, offset: reader.readUint16() };
      default:
        throw new Error(`Unknown verification type info tag: ${tag}`);
    }
  });
}

const extractStackFrames = (
  reader: Reader,
  numberOfEntries: number
): StackMapFrame[] => {
  return Array.from<StackMapFrame>({ length: numberOfEntries }).map(() => {
    const frameType = reader.readUint8();
    if (frameType < 64) {
      const sameFrame: SameFrame = { frameType };
      return sameFrame;
    } else if (frameType < 128) {
      const sameLocals1StackItemFrame: SameLocals1StackItemFrame = {
        frameType,
        stack: extractVerificationTypeInfo(reader, 1),
      };
      return sameLocals1StackItemFrame;
    } else if (frameType === 247) {
      const sameLocals1StackItemFrameExtended: SameLocals1StackItemFrameExtended =
        {
          frameType,
          offsetDelta: reader.readUint16(),
          stack: extractVerificationTypeInfo(reader, 1),
        };
      return sameLocals1StackItemFrameExtended;
    } else if (frameType == 248 || frameType == 249 || frameType == 250) {
      const chopFrame: ChopFrame = {
        frameType,
        offsetDelta: reader.readUint16(),
      };
      return chopFrame;
    } else if (frameType == 251) {
      const sameFrameExtended: SameFrameExtended = {
        frameType,
        offsetDelta: reader.readUint16(),
      };
      return sameFrameExtended;
    } else if (frameType == 252 || frameType == 253 || frameType == 254) {
      const offsetDelta = reader.readUint16();
      let locals;
      if (frameType == 252) {
        locals = extractVerificationTypeInfo(reader, 1);
      } else if (frameType == 253) {
        locals = extractVerificationTypeInfo(reader, 2);
      } else {
        locals = extractVerificationTypeInfo(reader, 3);
      }
      return {
        frameType,
        offsetDelta,
        locals,
      } as AppendFrame;
    } else if (frameType == 255) {
      const fullFrame: Partial<FullFrame> = {};
      fullFrame.frameType = frameType;
      fullFrame.offsetDelta = reader.readUint16();
      fullFrame.numberOfLocals = reader.readUint16();
      fullFrame.locals = extractVerificationTypeInfo(
        reader,
        fullFrame.numberOfLocals
      );
      fullFrame.numberOfStackItems = reader.readUint16();
      fullFrame.stack = extractVerificationTypeInfo(
        reader,
        fullFrame.numberOfStackItems
      );

      return fullFrame as FullFrame;
    }
    throw new Error(`Unknown frame type: ${frameType}`);
  });
};

const extractExceptionsAttribute = (
  rawAttribute: RawAttributeInfo
): AttributeInfo => {
  const reader = newReader(rawAttribute.info);
  const numberOfExceptions = reader.readUint16();
  const exceptionIndexTable = Array.from({ length: numberOfExceptions }).map(
    () => reader.readUint16()
  );
  return {
    name: "Exceptions",
    attributeLength: rawAttribute.attributeLength,
    numberOfExceptions,
    exceptionIndexTable,
  };
};

const extractInnerClassesAttribute = (
  rawAttribute: RawAttributeInfo
): AttributeInfo => {
  const reader = newReader(rawAttribute.info);
  const numberOfClasses = reader.readUint16();
  const classes = Array.from({ length: numberOfClasses }).map(() => {
    return {
      innerClassInfoIndex: reader.readUint16(),
      outerClassInfoIndex: reader.readUint16(),
      innerNameIndex: reader.readUint16(),
      innerClassAccessFlags: new ClassAccessFlags(reader.readUint16()),
    };
  });
  return {
    name: "InnerClasses",
    attributeLength: rawAttribute.attributeLength,
    numberOfClasses,
    classes,
  };
};

const extractAnnotations = (
  reader: Reader,
  numAnnotations: number,
  constPool: Constant[]
) => {
  return Array.from({ length: numAnnotations }).map(() => {
    const typeIndex = reader.readUint16();
    const numElementValuePairs = reader.readUint16();
    return {
      typeIndex,
      numElementValuePairs,
      elementValuePairs: extractElementValuePairs(
        reader,
        numElementValuePairs,
        constPool
      ),
    };
  });
};

const extractElementValuePairs = (
  reader: Reader,
  numElementValuePairs: number,
  constPool: Constant[]
) => {
  return Array.from<ElementValuePair>({ length: numElementValuePairs }).map(
    () => {
      const elementNameIndex = reader.readUint16();
      const name = constPool[elementNameIndex - 1].value as string;
      return {
        elementNameIndex,
        elementName: name,
        value: extractElementValue(reader, constPool),
      };
    }
  );
};

const extractElementValue = (
  reader: Reader,
  constPool: Constant[]
): ElementValue => {
  const tag = reader.readUint8();
  switch (tag) {
    case ElementType.Byte:
    case ElementType.Char:
    case ElementType.Int:
    case ElementType.Short:
    case ElementType.Boolean:
      return {
        tag,
        constValueIndex: reader.readUint16(),
        constType: ConstPoolTag.Integer,
      };

    case ElementType.Float:
      return {
        tag,
        constValueIndex: reader.readUint16(),
        constType: ConstPoolTag.Float,
      };

    case ElementType.Double:
      return {
        tag,
        constValueIndex: reader.readUint16(),
        constType: ConstPoolTag.Double,
      };
    case ElementType.Long:
      return {
        tag,
        constValueIndex: reader.readUint16(),
        constType: ConstPoolTag.Long,
      };
    case ElementType.String:
      return {
        tag,
        constValueIndex: reader.readUint16(),
        constType: ConstPoolTag.Utf8,
      };
    case ElementType.Enum:
      const enumValue: EnumValue = {
        tag,
        typeNameIndex: reader.readUint16(),
        constNameIndex: reader.readUint16(),
      };
      return enumValue;
    case ElementType.Class:
      return {
        tag,
        classInfoIndex: reader.readUint16(),
      };
    case ElementType.Annotation:
      return {
        tag,
        annotationValue: extractAnnotation(reader, constPool),
      };
    case ElementType.Array:
      const numValues = reader.readUint16();
      return {
        tag,
        numValues,
        values: Array.from({ length: numValues }).map(() =>
          extractElementValue(reader, constPool)
        ),
      };
    default:
      throw new Error(`Unknown element value tag: ${tag}`);
  }
};

export const extractAnnotation = (reader: Reader, constPool: Constant[]) => {
  const typeIndex = reader.readUint16();
  const numElementValuePairs = reader.readUint16();
  return {
    typeIndex,
    numElementValuePairs,
    elementValuePairs: extractElementValuePairs(
      reader,
      numElementValuePairs,
      constPool
    ),
  };
};

const extractTypeAnnotations = (
  reader: Reader,
  numAnnotations: number,
  constPool: Constant[]
): TypeAnnotation[] => {
  return Array.from<TypeAnnotation>({ length: numAnnotations }).map(() => {
    const targetType = reader.readUint8() as TargetType;
    //Todo: Fix types
    const targetInfo = extractTargetInfo(reader, targetType as any) as any;

    const targetPath = extractTargetPath(reader);
    const typeIndex = reader.readUint16();
    const numElementValuePairs = reader.readUint16();
    const elementValuePairs = extractElementValuePairs(
      reader,
      numElementValuePairs,
      constPool
    );
    return {
      targetType,
      targetInfo,
      targetPath,
      typeIndex,
      numElementValuePairs,
      elementValuePairs,
    };
  });
};

function extractTargetInfo(
  reader: Reader,
  targetType: TargetType.TypeParameterClass | TargetType.TypeParameterMethod
): TypeParameterTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType: TargetType.SuperType
): SuperTypeTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType:
    | TargetType.TypeParameterBoundClass
    | TargetType.TypeParameterBoundMethod
): TypeParameterBoundTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType:
    | TargetType.TypeParameterEmptyFieldOrRecord
    | TargetType.TypeParameterEmptyReturnMethod
    | TargetType.TypeParameterEmptyReceiverMethod
): EmptyTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType: TargetType.TypeParameterFormalParameter
): FormalParameterTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType: TargetType.Throws
): ThrowsTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType: TargetType.LocalVar | TargetType.ResourceVar
): LocalVarTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType: TargetType.CatchExceptionTable
): CatchExceptionTableTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType:
    | TargetType.InstanceOf
    | TargetType.New
    | TargetType.MethodRefNew
    | TargetType.MethodRefIdentifier
): OffsetTargetInfo;

function extractTargetInfo(
  reader: Reader,
  targetType:
    | TargetType.Cast
    | TargetType.Constructor
    | TargetType.TypeArgumentMethod
    | TargetType.TypeArgumentConstructor
    | TargetType.TypeArgumentIdentifier
): TypeArgumentTargetInfo;

function extractTargetInfo(reader: Reader, targetType: TargetType): TargetInfo {
  switch (targetType) {
    case TargetType.TypeParameterClass:
    case TargetType.TypeParameterMethod:
      return {
        typeParameterIndex: reader.readUint8(),
      };
    case TargetType.SuperType:
      return {
        supertypeIndex: reader.readUint16(),
      };
    case TargetType.TypeParameterBoundClass:
    case TargetType.TypeParameterBoundMethod:
      return {
        typeParameterIndex: reader.readUint8(),
        boundIndex: reader.readUint8(),
      };
    case TargetType.TypeParameterEmptyFieldOrRecord:
    case TargetType.TypeParameterEmptyReturnMethod:
    case TargetType.TypeParameterEmptyReceiverMethod:
      return {};
    case TargetType.TypeParameterFormalParameter:
      return {
        formalParameterIndex: reader.readUint8(),
      };
    case TargetType.Throws:
      return {
        throwsTypeIndex: reader.readUint16(),
      };
    case TargetType.LocalVar:
    case TargetType.ResourceVar:
      return {
        tableLength: reader.readUint16(),
        table: Array.from({ length: reader.readUint16() }).map(() => {
          const startPc = reader.readUint16();
          const length = reader.readUint16();
          const index = reader.readUint16();
          return { startPc, length, index };
        }),
      };
    case TargetType.CatchExceptionTable:
      return {
        exceptionIndex: reader.readUint16(),
      };
    case TargetType.InstanceOf:
    case TargetType.New:
    case TargetType.MethodRefNew:
    case TargetType.MethodRefIdentifier:
      return {
        offset: reader.readUint16(),
      };
    case TargetType.Cast:
    case TargetType.Constructor:
    case TargetType.TypeArgumentMethod:
    case TargetType.TypeArgumentConstructor:
    case TargetType.TypeArgumentIdentifier:
      return {
        offset: reader.readUint16(),
        typeArgumentIndex: reader.readUint8(),
      };
    default:
      throw new Error(`Unknown target type: ${targetType}`);
  }
}

const extractTargetPath = (reader: Reader): TargetPath => {
  const pathLength = reader.readUint8();
  const paths = Array.from<Path>({ length: pathLength }).map(() => {
    const typePathKind = reader.readUint8() as TypePathKind;
    const typeArgumentIndex = reader.readUint8();
    return { typePathKind, typeArgumentIndex };
  });
  return { pathLength, paths };
};

const extractModuleAttribute = (
  reader: Reader,
  rawAttribute: RawAttributeInfo,
  constPool: Constant[]
): ModuleAttribute => {
  const moduleName = constPool[reader.readUint16() - 1].value as string;
  const moduleFlags = new ModuleAccessFlags(reader.readUint16());
  const moduleVersionIndex = reader.readUint16();

  const requiresCount = reader.readUint16();
  const requires = Array.from({ length: requiresCount }).map(() => {
    return {
      requiresIndex: reader.readUint16(),
      requiresFlags: new RequireAccessFlags(reader.readUint16()),
      requiresVersionIndex: reader.readUint16(),
    };
  });

  const exportsCount = reader.readUint16();
  const exports = Array.from({ length: exportsCount }).map(() => {
    return {
      exportsIndex: reader.readUint16(),
      exportsFlags: new ExportAccessFlags(reader.readUint16()),
      exportsToCount: reader.readUint16(),
      exportsToIndex: Array.from({ length: reader.readUint16() }).map(() =>
        reader.readUint16()
      ),
    };
  });

  const opensCount = reader.readUint16();
  const opens = Array.from({ length: opensCount }).map(() => {
    return {
      opensIndex: reader.readUint16(),
      opensFlags: new OpenAccessFlags(reader.readUint16()),
      opensToCount: reader.readUint16(),
      opensToIndex: Array.from({ length: reader.readUint16() }).map(() =>
        reader.readUint16()
      ),
    };
  });

  const usesCount = reader.readUint16();
  const usesIndex = Array.from({ length: usesCount }).map(() =>
    reader.readUint16()
  );

  const providesCount = reader.readUint16();
  const provides = Array.from({ length: providesCount }).map(() => {
    return {
      providesIndex: reader.readUint16(),
      providesWithCount: reader.readUint16(),
      providesWithIndex: Array.from({ length: reader.readUint16() }).map(() =>
        reader.readUint16()
      ),
    };
  });

  return {
    name: "Module",
    attributeLength: rawAttribute.attributeLength,
    moduleName,
    moduleFlags,
    moduleVersionIndex,
    requiresCount,
    requires,
    exportsCount,
    exports,
    opensCount,
    opens,
    usesCount,
    usesIndex,
    providesCount,
    provides,
  };
};
