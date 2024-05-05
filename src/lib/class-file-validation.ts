import { ClassAccessFlags } from "./types/access-flags";
import { UInt16, UInt32, parseUtf8 } from "./types/bytes";
import {
  ConstPoolInfoType,
  ConstPoolTag,
  ConstPoolTags,
} from "./types/raw/const-pool";
import {
  VoidTypes,
  extractFieldType,
  extractMethodDescriptor,
} from "./types/raw/descriptors";
import {
  AllClassAccessFlags,
  ClassAccessFlags as RawClassAccessFlags,
  hasAccessFlag,
} from "./types/raw/raw-access-flags";
import { RawConstantPool, RawConstantPoolInfo } from "./types/raw/raw-class";

const MAGIC = 0xcafebabe & 0xffffffff;

const CONSTRUCTOR_NAME = "<init>";

const STATIC_INITIALIZER_NAME = "<clinit>";

export const validateMagic = (magic: UInt32): never | void => {
  if (magic !== MAGIC) {
    throw new Error(
      `Invalid magic number: ${magic.toString(16)} expected ${MAGIC.toString(
        16
      )}`
    );
  }
};

// Page 73 of the JVM specification
export const validateVersion = (minor: UInt16, major: UInt16): never | void => {
  if (major >= 56)
    if (minor !== 0 && minor !== 65535)
      throw new Error(
        `Invalid minor version: ${minor} expected 0 or 65535 with major version ${major}`
      );
};

export const validateConstantPool = (
  constPool: RawConstantPool,
  majorVersion: number
): never | void => {
  constPool.forEach((info, index) => {
    const additionalTagInfo = ConstPoolTags[info.tag];
    if (additionalTagInfo.sinceVersion.major > majorVersion) {
      throw new Error(
        `Invalid constant pool entry ${index + 1} with tag ${
          info.tag
        } for major version ${majorVersion}`
      );
    }
    try {
      validateConstantPoolEntry(constPool, info);
    } catch (e) {
      if (e instanceof Error)
        throw new Error(
          `Invalid constant pool entry ${index + 1} with tag ${info.tag}: ${
            e.message
          }`
        );
      else throw e;
    }
  });
};

const validateConstantPoolEntry = (
  constPool: RawConstantPool,
  info: RawConstantPoolInfo
) => {
  switch (info.tag) {
    case ConstPoolTag.Class:
      validateIsConstPoolTag(constPool, info.nameIndex, ConstPoolTag.Utf8);
      break;
    case ConstPoolTag.FieldRef:
    case ConstPoolTag.MethodRef:
    case ConstPoolTag.InterfaceMethodRef:
      validateIsConstPoolTag(constPool, info.classIndex, ConstPoolTag.Class); // Page 87
      validateIsConstPoolTag(
        constPool,
        info.nameAndTypeIndex,
        ConstPoolTag.NameAndType
      ); // Page 88
      const nameAndTypeInfo = constPool[
        info.nameAndTypeIndex - 1
      ] as ConstPoolInfoType<ConstPoolTag.NameAndType>;

      validateIsConstPoolTag(
        constPool,
        nameAndTypeInfo.nameIndex,
        ConstPoolTag.Utf8
      );
      validateIsConstPoolTag(
        constPool,
        nameAndTypeInfo.descriptorIndex,
        ConstPoolTag.Utf8
      );
      if (info.tag === ConstPoolTag.FieldRef) {
        const descriptor = constPool[
          nameAndTypeInfo.descriptorIndex - 1
        ] as ConstPoolInfoType<ConstPoolTag.Utf8>;
        extractFieldType(parseUtf8(descriptor));
      }
      if (info.tag === ConstPoolTag.MethodRef) {
        const descriptor = constPool[
          nameAndTypeInfo.descriptorIndex - 1
        ] as ConstPoolInfoType<ConstPoolTag.Utf8>;
        const name = parseUtf8(
          constPool[
            nameAndTypeInfo.nameIndex - 1
          ] as ConstPoolInfoType<ConstPoolTag.Utf8>
        );
        if (name.startsWith("<") && name !== CONSTRUCTOR_NAME)
          throw new Error(
            `Invalid method name: ${name} expected ${CONSTRUCTOR_NAME}`
          );

        const { returnType } = extractMethodDescriptor(parseUtf8(descriptor));
        if (name === CONSTRUCTOR_NAME && returnType !== VoidTypes.V) {
          throw new Error(
            `Invalid method descriptor: ${parseUtf8(descriptor)} expected ${
              VoidTypes.V
            }`
          );
        }
      }

      break;
    case ConstPoolTag.NameAndType:
      validateIsConstPoolTag(constPool, info.nameIndex, ConstPoolTag.Utf8);
      validateIsConstPoolTag(
        constPool,
        info.descriptorIndex,
        ConstPoolTag.Utf8
      );
      break;
    case ConstPoolTag.Utf8:
      // validateUtf8Info(constPool, info, index);
      break;
    case ConstPoolTag.MethodHandle:
      //validateMethodHandleInfo(constPool, info, index);
      break;
    case ConstPoolTag.MethodType:
      //validateMethodTypeInfo(constPool, info, index);
      break;
    case ConstPoolTag.InvokeDynamic:
      //validateInvokeDynamicInfo(constPool, info, index);
      break;
    case ConstPoolTag.Module:
    case ConstPoolTag.Package:
    case ConstPoolTag.Integer:
    case ConstPoolTag.Float:
    case ConstPoolTag.Long:
    case ConstPoolTag.Double:
    case ConstPoolTag.String:
      break; // No validation needed
    default:
      throw new Error(`Invalid constant pool entry with tag ${info.tag}`);
  }
};

const validateIsConstPoolTag = (
  constPool: RawConstantPool,
  index: UInt16,
  expectedTag: ConstPoolTag
) => {
  const info = constPool[index - 1];
  if (info.tag !== expectedTag)
    throw new Error(
      `Invalid Constant ${ConstPoolTags[info.tag]} at index ${index} expected ${
        ConstPoolTags[expectedTag].kind
      }`
    );
};

// Page 75 of the JVM specification

export const validateAccessFlags = (
  accessFlags: UInt16,
  majorVersion: number
): never | void => {
  const invalidFlags = ~AllClassAccessFlags;
  const hex = accessFlags.toString(16);
  if ((accessFlags & invalidFlags) !== 0) {
    throw new Error(`Invalid access flags: ${hex}`);
  }
  const classAccessFlags = new ClassAccessFlags(accessFlags);
  if (classAccessFlags.isModule) {
    if (majorVersion < 53)
      throw new Error(
        `Invalid access flags: ${hex}, module flag requires major version 53 or greater`
      );
    const allExceptModule =
      AllClassAccessFlags & ~RawClassAccessFlags.ACC_MODULE;
    if ((accessFlags & allExceptModule) !== 0) {
      throw new Error(
        `Invalid access flags: ${hex} module must be the only flag`
      );
    }
  } else {
    if (classAccessFlags.isInterface) {
      if (classAccessFlags.isFinal)
        throw new Error(
          `Invalid access flags: ${hex}, interface cannot be final`
        );
      else if (classAccessFlags.isSuper)
        throw new Error(
          `Invalid access flags: ${hex}, interface cannot be super`
        );
      else if (classAccessFlags.isEnum)
        throw new Error(
          `Invalid access flags: ${hex}, interface cannot be enum`
        );
      else if (classAccessFlags.isModule)
        throw new Error(
          `Invalid access flags: ${hex}, interface cannot be module`
        );
      else if (!classAccessFlags.isAbstract) {
        throw new Error(
          `Invalid access flags: ${hex}, both abstract and interface flags must be set or unset`
        );
      }
    } else {
      if (classAccessFlags.isAnnotation)
        throw new Error(`
          Invalid access flags: ${hex}, annotation must be interface`);
      else if (classAccessFlags.isFinal && classAccessFlags.isAbstract)
        throw new Error(
          `Invalid access flags: ${hex}, either final or abstract or none must be set`
        );
    }
  }
};

export const validateThisClass = (
  thisClass: UInt16,
  constPool: RawConstantPool,
  accessFlags: UInt16
): never | void => {
  if (hasAccessFlag(accessFlags, RawClassAccessFlags.ACC_MODULE)) {
    const constPoolInfo = constPool[thisClass - 1];
    if (
      constPoolInfo.tag !== ConstPoolTag.Utf8 ||
      parseUtf8(constPoolInfo.bytes, 0, constPoolInfo.bytes.length) !==
        "module-info"
    ) {
      throw new Error(`Invalid this class: ${thisClass} expected module-info`);
    }
  }
};

export const validateSuperClass = (
  superClass: UInt16,
  accessFlags: UInt16
): never | void => {
  if (superClass !== 0) {
    if (hasAccessFlag(accessFlags, RawClassAccessFlags.ACC_MODULE)) {
      throw new Error(`Invalid super class: ${superClass} expected 0`);
    }
  }
};

export const validateInterfacesCount = (
  interfacesCount: UInt16,
  accessFlags: UInt16
): never | void => {
  if (hasAccessFlag(accessFlags, RawClassAccessFlags.ACC_MODULE)) {
    if (interfacesCount !== 0) {
      throw new Error(
        `Invalid interfaces count: ${interfacesCount} expected 0`
      );
    }
  }
};

export const validateFieldsCount = (
  fieldsCount: UInt16,
  accessFlags: UInt16
): never | void => {
  if (hasAccessFlag(accessFlags, RawClassAccessFlags.ACC_MODULE)) {
    if (fieldsCount !== 0) {
      throw new Error(`Invalid fields count: ${fieldsCount} expected 0`);
    }
  }
};

export const validateMethodsCount = (
  methodsCount: UInt16,
  accessFlags: UInt16
): never | void => {
  if (hasAccessFlag(accessFlags, RawClassAccessFlags.ACC_MODULE)) {
    if (methodsCount !== 0) {
      throw new Error(`Invalid methods count: ${methodsCount} expected 0`);
    }
  }
};
