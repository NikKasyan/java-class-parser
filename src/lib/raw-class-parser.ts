import {
  validateAccessFlags,
  validateConstantPool,
  validateFieldsCount,
  validateInterfacesCount,
  validateMagic,
  validateMethodsCount,
  validateThisClass,
  validateVersion,
} from "./class-file-validation";
import { Reader, newReader } from "./reader";
import { ConstPoolInfo, ConstPoolTag } from "./types/raw/const-pool";
import { WithOffsets } from "./types/raw/debug";
import {
  RawAttributeInfos,
  RawClassFile,
  RawConstantPool,
  RawFieldInfos,
  RawMethodInfos,
} from "./types/raw/raw-class";

const createOffsetLogger = (reader: Reader, enabled: boolean) => {
  if (!enabled) {
    return () => {};
  }
  return (message: string) => {
    console.log(message, reader.offset());
  };
};

export const parseRawClassFile = (
  bytes: Uint8Array,
  logOffsets = false
): RawClassFile => {
  const reader = newReader(bytes);
  const logOffset = createOffsetLogger(reader, logOffsets);

  const magic = reader.readUint32();
  validateMagic(magic);
  logOffset("Magic");

  const minorVersion = reader.readUint16();
  const majorVersion = reader.readUint16();
  validateVersion(majorVersion, minorVersion);
  logOffset("Version");

  const constantPoolCount = reader.readUint16() - 1;
  logOffset("Constant pool count");

  const constantPool: RawConstantPool = parseConstantPool(
    reader,
    constantPoolCount
  );
  validateConstantPool(constantPool, majorVersion);
  logOffset("Constant pool");

  const accessFlags = reader.readUint16();
  validateAccessFlags(accessFlags, majorVersion);
  logOffset("Access flags");

  const thisClass = reader.readUint16();
  validateThisClass(thisClass, constantPool, accessFlags);
  logOffset("This class");

  const superClass = reader.readUint16();
  validateThisClass(superClass, constantPool, accessFlags);
  logOffset("Super class");

  const interfacesCount = reader.readUint16();
  validateInterfacesCount(interfacesCount, accessFlags);
  logOffset("Interfaces count");

  const interfaces = Array.from({ length: interfacesCount }).map(() =>
    reader.readUint16()
  );
  logOffset("Interfaces");

  const fieldsCount = reader.readUint16();
  validateFieldsCount(fieldsCount, accessFlags);
  logOffset("Fields count");

  const fields = parseFields(reader, fieldsCount);
  // validateFields(fields, constantPool, accessFlags);
  logOffset("Fields");
  const methodsCount = reader.readUint16();
  validateMethodsCount(methodsCount, accessFlags);
  logOffset("Methods count");

  const methods = parseMethods(reader, methodsCount);
  //validateMethods(methods, constantPool, accessFlags);
  logOffset("Methods");
  const attributesCount = reader.readUint16();
  logOffset("Attributes count");

  const attributes = parseAttributes(reader, attributesCount);
  logOffset("Attributes");

  return {
    magic,
    minorVersion,
    majorVersion,
    constantPoolCount,
    constantPool,
    accessFlags,
    thisClass,
    superClass,
    interfacesCount,
    interfaces,
    fieldsCount,
    fields,
    methodsCount,
    methods,
    attributesCount,
    attributes,
  };
};

const parseConstantPool = (reader: Reader, count: number) => {
  const pool: RawConstantPool = Array.from({ length: count });
  for (let i = 0; i < count; i++) {
    const tag: ConstPoolTag = reader.readUint8();
    try {
      const poolInfo = parseConstantPoolInfo(reader, tag);
      pool[i] = poolInfo;
      // Important Long and Double take up two slots in the constant pool
      // Chapter 4.4.5
      // Quote: In retrospect, making 8-byte constants take two constant pool entries was a poor choice.
      // https://docs.oracle.com/javase/specs/jvms/se22/jvms22.pdf
      if (tag === ConstPoolTag.Long || tag === ConstPoolTag.Double) {
        pool[++i] = pool[i - 1]; // Copy the same value to the next index
      }
    } catch (e) {
      console.error(
        e,
        "Error while parsing constant pool at index",
        i,
        " offset ",
        reader.offset()
      );
    }
  }
  return pool;
};

const parseConstantPoolInfo = (
  reader: Reader,
  tag: ConstPoolTag
): ConstPoolInfo => {
  switch (tag) {
    case ConstPoolTag.Class:
      return { tag, nameIndex: reader.readUint16() };
    case ConstPoolTag.FieldRef:
    case ConstPoolTag.MethodRef:
    case ConstPoolTag.InterfaceMethodRef:
      return {
        tag,
        classIndex: reader.readUint16(),
        nameAndTypeIndex: reader.readUint16(),
      };
    case ConstPoolTag.String:
      return { tag, stringIndex: reader.readUint16() };
    case ConstPoolTag.Integer:
    case ConstPoolTag.Float:
      return { tag, bytes: reader.readUint32() };
    case ConstPoolTag.Long:
    case ConstPoolTag.Double:
      return {
        tag,
        highBytes: reader.readUint32(),
        lowBytes: reader.readUint32(),
      };
    case ConstPoolTag.NameAndType:
      return {
        tag,
        nameIndex: reader.readUint16(),
        descriptorIndex: reader.readUint16(),
      };
    case ConstPoolTag.Utf8:
      const length = reader.readUint16();
      const bytes = reader.readBytes(length);
      return {
        tag,
        length,
        bytes,
      };
    case ConstPoolTag.MethodHandle:
      const referenceKind = reader.readUint8();
      return {
        tag,
        referenceKind: referenceKind,
        referenceIndex: reader.readUint16(),
      };
    case ConstPoolTag.MethodType:
      return { tag, descriptorIndex: reader.readUint16() };
    case ConstPoolTag.Dynamic:
    case ConstPoolTag.InvokeDynamic:
      return {
        tag,
        bootstrapMethodAttrIndex: reader.readUint16(),
        nameAndTypeIndex: reader.readUint16(),
      };
    case ConstPoolTag.Module:
    case ConstPoolTag.Package:
      return { tag, nameIndex: reader.readUint16() };
    default:
      throw new Error(`Unknown constant pool tag: ${tag}`);
  }
};

const parseFields = (reader: Reader, count: number) => {
  const fields: RawFieldInfos = Array.from({ length: count });
  for (let i = 0; i < count; i++) {
    const accessFlags = reader.readUint16();
    const nameIndex = reader.readUint16();
    const descriptorIndex = reader.readUint16();
    const attributesCount = reader.readUint16();
    const attributes = parseAttributes(reader, attributesCount);
    fields[i] = {
      accessFlags,
      nameIndex,
      descriptorIndex,
      attributesCount,
      attributes,
    };
  }
  return fields;
};

const parseAttributes = (reader: Reader, count: number) => {
  const attributes: RawAttributeInfos = Array.from({ length: count });
  for (let i = 0; i < count; i++) {
    const attributeNameIndex = reader.readUint16();
    const attributeLength = reader.readUint32();
    attributes[i] = {
      attributeNameIndex,
      attributeLength,
      info: reader.readBytes(attributeLength),
    };
  }
  return attributes;
};

const parseMethods = (reader: Reader, count: number) => {
  const methods: RawMethodInfos = Array.from({ length: count });
  for (let i = 0; i < count; i++) {
    const accessFlags = reader.readUint16();
    const nameIndex = reader.readUint16();
    const descriptorIndex = reader.readUint16();
    const attributesCount = reader.readUint16();
    const attributes = parseAttributes(reader, attributesCount);
    methods[i] = {
      accessFlags,
      nameIndex,
      descriptorIndex,
      attributesCount,
      attributes,
    };
  }
  return methods;
};

type RawClassFileWithOffsets = WithOffsets<RawClassFile>;

export const parseRawClassFileWithOffsets = (
  bytes: Uint8Array
): RawClassFileWithOffsets => {
  const rawClassFile = parseRawClassFile(bytes, false);
  return parseRawClassFileWithOffsetsFromRawFile(rawClassFile, bytes);
};

export const parseRawClassFileWithOffsetsFromRawFile = (
  rawClassFile: RawClassFile,
  bytes: Uint8Array
): RawClassFileWithOffsets => {
  let offset = 10; // 4 bytes for magic, 2 bytes for minor version, 2 bytes for major version, 2 bytes for constant pool count
  const constantPoolWithOffsets = createConstantPoolWithOffsets(
    rawClassFile.constantPool,
    offset
  );
  offset += constantPoolWithOffsets.numberOfBytes;
  const accessFlags = {
    value: rawClassFile.accessFlags,
    numberOfBytes: 2,
    offset,
  };
  offset += accessFlags.numberOfBytes;

  const thisClass = {
    value: rawClassFile.thisClass,
    numberOfBytes: 2,
    offset,
  };
  offset += thisClass.numberOfBytes;

  const superClass = {
    value: rawClassFile.superClass,
    numberOfBytes: 2,
    offset,
  };
  offset += superClass.numberOfBytes;

  const interfacesCount = {
    value: rawClassFile.interfacesCount,
    numberOfBytes: 2,
    offset,
  };
  offset += interfacesCount.numberOfBytes;

  let startOffsetInterfaces = offset;
  const interfacesWithOffset = rawClassFile.interfaces.map((interfaceValue) => {
    const interfaceIndex = {
      value: interfaceValue,
      numberOfBytes: 2,
      offset,
    };
    offset += interfaceIndex.numberOfBytes;
    return interfaceIndex;
  });

  const interfaces = {
    value: interfacesWithOffset,
    offset: startOffsetInterfaces,
    numberOfBytes: offset - startOffsetInterfaces,
  };

  const fieldsCount = {
    value: rawClassFile.fieldsCount,
    numberOfBytes: 2,
    offset,
  };
  offset += fieldsCount.numberOfBytes;

  const fields = createFieldsWithOffsets(rawClassFile.fields, offset);

  offset += fields.numberOfBytes;

  const methodsCount = {
    value: rawClassFile.methodsCount,
    numberOfBytes: 2,
    offset,
  };
  offset += methodsCount.numberOfBytes;

  const methods = createMethodsWithOffsets(rawClassFile.methods, offset);
  offset += methods.numberOfBytes;

  const attributesCount = {
    value: rawClassFile.attributesCount,
    numberOfBytes: 2,
    offset,
  };
  offset += attributesCount.numberOfBytes;

  const attributes = createAttributesWithOffsets(
    rawClassFile.attributes,
    offset
  );
  offset += attributes.numberOfBytes;

  const rawClasswithOffsets: RawClassFileWithOffsets = {
    offset: 0,
    numberOfBytes: bytes.length,
    value: {
      magic: {
        value: rawClassFile.magic,
        numberOfBytes: 4,
        offset: 0,
      },
      minorVersion: {
        value: rawClassFile.minorVersion,
        numberOfBytes: 2,
        offset: 4,
      },
      majorVersion: {
        value: rawClassFile.majorVersion,
        numberOfBytes: 2,
        offset: 6,
      },
      constantPoolCount: {
        value: rawClassFile.constantPoolCount,
        numberOfBytes: 2,
        offset: 8,
      },
      constantPool: constantPoolWithOffsets,
      accessFlags,
      thisClass,
      superClass,
      interfacesCount,
      interfaces,
      fieldsCount,
      fields,
      methodsCount,
      methods,
      attributesCount,
      attributes,
    },
  };

  if (offset !== bytes.length) {
    console.error(rawClassFile, rawClasswithOffsets);
    throw new Error(
      `Offset mismatch. Expected ${bytes.length} but got ${offset}`
    );
  }
  return rawClasswithOffsets;
};

const createConstantPoolWithOffsets = (
  rawConstantPool: RawConstantPool,
  offset: number
): WithOffsets<ConstPoolInfo[]> => {
  let startOffset = offset;
  const constantPoolWithOffsets: WithOffsets<ConstPoolInfo[]>["value"] =
    Array.from({ length: rawConstantPool.length });
  for (let i = 0; i < rawConstantPool.length; i++) {
    const poolInfo = rawConstantPool[i];
    const constantPoolInfo = createConstantPoolInfoWithOffsets(
      poolInfo,
      offset
    );
    offset += constantPoolInfo.numberOfBytes;
    constantPoolWithOffsets[i] = constantPoolInfo;
    if (
      poolInfo.tag === ConstPoolTag.Long ||
      poolInfo.tag === ConstPoolTag.Double
    ) {
      constantPoolWithOffsets[++i] = constantPoolInfo;
    }
  }
  let endOffset = offset;
  return {
    offset: startOffset,
    numberOfBytes: endOffset - startOffset,
    value: constantPoolWithOffsets,
  };
};

const createConstantPoolInfoWithOffsets = (
  poolInfo: ConstPoolInfo,
  offset: number
): WithOffsets<ConstPoolInfo> => {
  let startOffset = offset;
  const tag = poolInfo.tag;
  const tagWithOffset = {
    value: poolInfo.tag,
    numberOfBytes: 1,
    offset,
  };
  offset += 1;
  let value;

  switch (tag) {
    case ConstPoolTag.Class:
      offset += 2;
      value = {
        nameIndex: {
          value: poolInfo.nameIndex,
          numberOfBytes: 2,
          offset: startOffset + 1,
        },
      };
      break;
    case ConstPoolTag.FieldRef:
    case ConstPoolTag.MethodRef:
    case ConstPoolTag.InterfaceMethodRef:
      offset += 2 + 2;
      value = {
        classIndex: {
          value: poolInfo.classIndex,
          numberOfBytes: 2,
          offset: startOffset + 1,
        },
        nameAndTypeIndex: {
          value: poolInfo.nameAndTypeIndex,
          numberOfBytes: 2,
          offset: startOffset + 3,
        },
      };
      break;
    case ConstPoolTag.String:
      offset += 2;
      value = {
        stringIndex: {
          value: poolInfo.stringIndex,
          numberOfBytes: 2,
          offset: startOffset + 1,
        },
      };
      break;
    case ConstPoolTag.Integer:
    case ConstPoolTag.Float:
      offset += 4;
      value = {
        bytes: {
          value: poolInfo.bytes,
          numberOfBytes: 4,
          offset: startOffset + 1,
        },
      };
      break;
    case ConstPoolTag.Long:
    case ConstPoolTag.Double:
      offset += 4 + 4;
      value = {
        highBytes: {
          value: poolInfo.highBytes,
          numberOfBytes: 4,
          offset: startOffset + 1,
        },
        lowBytes: {
          value: poolInfo.lowBytes,
          numberOfBytes: 4,
          offset: startOffset + 5,
        },
      };
      break;
    case ConstPoolTag.NameAndType:
      offset += 2 + 2;
      value = {
        nameIndex: {
          value: poolInfo.nameIndex,
          numberOfBytes: 2,
          offset: startOffset + 1,
        },
        descriptorIndex: {
          value: poolInfo.descriptorIndex,
          numberOfBytes: 2,
          offset: startOffset + 3,
        },
      };
      break;
    case ConstPoolTag.Utf8:
      const length = poolInfo.length;
      offset += 2 + length;
      value = {
        length: {
          value: length,
          numberOfBytes: 2,
          offset: startOffset + 1,
        },
        bytes: {
          value: poolInfo.bytes,
          numberOfBytes: length,
          offset: startOffset + 3,
        },
      };
      break;
    case ConstPoolTag.MethodHandle:
      offset += 1 + 2;
      value = {
        referenceKind: {
          value: poolInfo.referenceKind,
          numberOfBytes: 1,
          offset: startOffset + 1,
        },
        referenceIndex: {
          value: poolInfo.referenceIndex,
          numberOfBytes: 2,
          offset: startOffset + 2,
        },
      };
      break;
    case ConstPoolTag.MethodType:
      offset += 2;
      value = {
        descriptorIndex: {
          value: poolInfo.descriptorIndex,
          numberOfBytes: 2,
          offset: startOffset + 1,
        },
      };
      break;
    case ConstPoolTag.Dynamic:
    case ConstPoolTag.InvokeDynamic:
      offset += 2 + 2;
      value = {
        bootstrapMethodAttrIndex: {
          value: poolInfo.bootstrapMethodAttrIndex,
          numberOfBytes: 2,
          offset: startOffset + 1,
        },
        nameAndTypeIndex: {
          value: poolInfo.nameAndTypeIndex,
          numberOfBytes: 2,
          offset: startOffset + 3,
        },
      };
      break;
    case ConstPoolTag.Module:
    case ConstPoolTag.Package:
      offset += 2;
      value = {
        nameIndex: {
          value: poolInfo.nameIndex,
          numberOfBytes: 2,
          offset: startOffset + 1,
        },
      };
      break;
    default:
      throw new Error(`Unknown constant pool tag: ${tag}`);
  }

  let endOffset = offset;

  return {
    offset: startOffset,
    numberOfBytes: endOffset - startOffset,
    value: {
      tag: tagWithOffset,
      ...value,
    },
  } as WithOffsets<ConstPoolInfo>;
};

const createFieldsWithOffsets = (
  fields: RawFieldInfos,
  offset: number
): WithOffsets<RawFieldInfos> => {
  let startOffset = offset;
  const fieldsWithOffsets: WithOffsets<RawFieldInfos>["value"] = fields.map(
    (fieldInfo) => {
      const field = createFieldWithOffsets(fieldInfo, offset);
      offset += field.numberOfBytes;
      return field;
    }
  );
  let endOffset = offset;
  return {
    offset: startOffset,
    numberOfBytes: endOffset - startOffset,
    value: fieldsWithOffsets,
  };
};

const createFieldWithOffsets = (
  fieldInfo: RawFieldInfos[number],
  offset: number
): WithOffsets<RawFieldInfos[number]> => {
  let startOffset = offset;
  const accessFlags = {
    value: fieldInfo.accessFlags,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;
  const nameIndex = {
    value: fieldInfo.nameIndex,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;
  const descriptorIndex = {
    value: fieldInfo.descriptorIndex,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;
  const attributesCount = {
    value: fieldInfo.attributesCount,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;

  const attributes = createAttributesWithOffsets(fieldInfo.attributes, offset);
  offset += attributes.numberOfBytes;

  let endOffset = offset;
  return {
    offset: startOffset,
    numberOfBytes: endOffset - startOffset,
    value: {
      accessFlags,
      nameIndex,
      descriptorIndex,
      attributesCount,
      attributes,
    },
  };
};

const createAttributesWithOffsets = (
  attributes: RawAttributeInfos,
  offset: number
): WithOffsets<RawAttributeInfos> => {
  let startOffset = offset;
  const attributesWithOffsets: WithOffsets<RawAttributeInfos>["value"] =
    attributes.map((attributeInfo) => {
      const attribute = createAttributeWithOffsets(attributeInfo, offset);
      offset += attribute.numberOfBytes;
      return attribute;
    });
  return {
    offset,
    numberOfBytes: offset - startOffset,
    value: attributesWithOffsets,
  };
};

const createAttributeWithOffsets = (
  attributeInfo: RawAttributeInfos[number],
  offset: number
): WithOffsets<RawAttributeInfos[number]> => {
  let startOffset = offset;
  const attributeNameIndex = {
    value: attributeInfo.attributeNameIndex,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;
  const attributeLength = {
    value: attributeInfo.attributeLength,
    numberOfBytes: 4,
    offset,
  };
  offset += 4;
  const info = {
    value: attributeInfo.info,
    numberOfBytes: attributeInfo.attributeLength,
    offset,
  };
  offset += attributeInfo.attributeLength;
  let endOffset = offset;
  return {
    offset: startOffset,
    numberOfBytes: endOffset - startOffset,
    value: {
      attributeNameIndex,
      attributeLength,
      info,
    },
  };
};

const createMethodsWithOffsets = (
  methods: RawMethodInfos,
  offset: number
): WithOffsets<RawMethodInfos> => {
  let startOffset = offset;
  const methodsWithOffsets: WithOffsets<RawMethodInfos>["value"] = methods.map(
    (methodInfo) => {
      const method = createMethodWithOffsets(methodInfo, offset);
      offset += method.numberOfBytes;
      return method;
    }
  );
  let endOffset = offset;
  return {
    offset: startOffset,
    numberOfBytes: endOffset - startOffset,
    value: methodsWithOffsets,
  };
};

const createMethodWithOffsets = (
  methodInfo: RawMethodInfos[number],
  offset: number
): WithOffsets<RawMethodInfos[number]> => {
  let startOffset = offset;
  const accessFlags = {
    value: methodInfo.accessFlags,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;
  const nameIndex = {
    value: methodInfo.nameIndex,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;
  const descriptorIndex = {
    value: methodInfo.descriptorIndex,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;
  const attributesCount = {
    value: methodInfo.attributesCount,
    numberOfBytes: 2,
    offset,
  };
  offset += 2;

  const attributes = createAttributesWithOffsets(methodInfo.attributes, offset);
  offset += attributes.numberOfBytes;

  let endOffset = offset;
  return {
    offset: startOffset,
    numberOfBytes: endOffset - startOffset,
    value: {
      accessFlags,
      nameIndex,
      descriptorIndex,
      attributesCount,
      attributes,
    },
  };
};
