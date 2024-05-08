import { ClassAccessFlags } from "./types/access-flags";
import { UInt16, UInt32, parseUtf8 } from "./types/bytes";
import { RawAttributeInfo } from "./types/raw/attributes";
import {
  ConstPoolInfoType,
  ConstPoolTag,
  ConstPoolTags,
  MethodHandleReferenceKind,
} from "./types/raw/const-pool";
import {
  VoidTypes,
  extractFieldType,
  extractMethodDescriptor,
} from "./types/raw/descriptors";
import { RawFieldInfo } from "./types/raw/field-infos";
import { RawMethodInfo } from "./types/raw/method";
import {
  AllClassAccessFlags,
  ClassAccessFlags as RawClassAccessFlags,
  FieldAccessFlags as RawFieldAccessFlags,
  MethodAccessFlags as RawMethodAccessFlags,
  hasAccessFlag,
  hasAccessFlags,
  hasAnyAccessFlagsOf,
  hasAtMostOneOfAccessFlags,
} from "./types/raw/raw-access-flags";
import {
  RawClassFile,
  RawConstantPool,
  RawConstantPoolInfo,
  RawMethodInfos,
} from "./types/raw/raw-class";

const MAGIC = 0xcafebabe & 0xffffffff;

const CONSTRUCTOR_NAME = "<init>";

const STATIC_INITIALIZER_NAME = "<clinit>";

export const validateRawClass = (rawClass: RawClassFile) => {
  validateMagic(rawClass.magic);
  validateVersion(rawClass.minorVersion, rawClass.majorVersion);
  validateConstantPool(
    rawClass.constantPool,
    rawClass.majorVersion,
    rawClass.accessFlags
  );
  validateAccessFlags(rawClass.accessFlags, rawClass.majorVersion);
  validateThisClass(
    rawClass.thisClass,
    rawClass.constantPool,
    rawClass.accessFlags
  );
  validateSuperClass(rawClass.superClass, rawClass.accessFlags);
  validateInterfacesCount(rawClass.interfacesCount, rawClass.accessFlags);

  validateFieldsCount(rawClass.fieldsCount, rawClass.accessFlags);
  validateFields(rawClass.fields, rawClass.constantPool);

  validateMethodsCount(rawClass.methodsCount, rawClass.accessFlags);
  validateMethods(rawClass.methods, rawClass.constantPool, rawClass);

  validateAttributes(rawClass.attributes, rawClass);
};

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
  majorVersion: number,
  accessFlags: number
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
      validateConstantPoolEntry(constPool, info, majorVersion, accessFlags);
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
  info: RawConstantPoolInfo,
  majorVersion: number,
  accessFlags: number
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
      validateMethodHandle(info, constPool, majorVersion);
      break;
    case ConstPoolTag.MethodType:
      validateIsConstPoolTag(
        constPool,
        info.descriptorIndex,
        ConstPoolTag.Utf8
      );
      break;
    case ConstPoolTag.InvokeDynamic:
    case ConstPoolTag.Dynamic:
      validateDynamicInfo(constPool, info);
      break;
    case ConstPoolTag.Package:
    case ConstPoolTag.Module:
      const classAccessFlags = new ClassAccessFlags(accessFlags);
      if (!classAccessFlags.isModule)
        throw new Error(
          "Package or Module constpool entries only allowed in Module"
        );
      validateIsConstPoolTag(constPool, info.nameIndex, ConstPoolTag.Utf8);
      break;
    case ConstPoolTag.Integer:
    case ConstPoolTag.Float:
    case ConstPoolTag.Long:
    case ConstPoolTag.Double:
    case ConstPoolTag.String:
      break; // No validation needed
    default:
      throw new Error(
        `Invalid constant pool entry with tag ${(info as any).tag}`
      );
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

const validateIsConstPoolTags = (
  constPool: RawConstantPool,
  index: UInt16,
  ...expectedTags: ConstPoolTag[]
) => {
  const info = constPool[index - 1];
  if (!expectedTags.includes(info.tag))
    throw new Error(
      `Invalid Constant ${
        ConstPoolTags[info.tag]
      } at index ${index} expected one of ${expectedTags
        .map((c) => ConstPoolTags[c])
        .join(", ")}`
    );
};

//Page 95 of the JVM specification
const validateMethodHandle = (
  info: ConstPoolInfoType<ConstPoolTag.MethodHandle>,
  constPool: RawConstantPool,
  majorVersion: number
) => {
  switch (info.referenceKind) {
    case MethodHandleReferenceKind.GetField:
    case MethodHandleReferenceKind.GetStatic:
    case MethodHandleReferenceKind.PutField:
    case MethodHandleReferenceKind.PutStatic:
      validateIsConstPoolTag(
        constPool,
        info.referenceIndex,
        ConstPoolTag.FieldRef
      );
      break;
    case MethodHandleReferenceKind.InvokeVirtual:
    case MethodHandleReferenceKind.NewInvokeSpecial:
      validateIsConstPoolTag(
        constPool,
        info.referenceIndex,
        ConstPoolTag.MethodRef
      );
      break;
    case MethodHandleReferenceKind.InvokeStatic:
    case MethodHandleReferenceKind.InvokeSpecial:
      if (majorVersion < 52) {
        validateIsConstPoolTag(
          constPool,
          info.referenceIndex,
          ConstPoolTag.MethodRef
        );
      } else {
        validateIsConstPoolTags(
          constPool,
          info.referenceIndex,
          ConstPoolTag.MethodRef,
          ConstPoolTag.InterfaceMethodRef
        );
      }
      break;
    case MethodHandleReferenceKind.InvokeInterface:
      validateIsConstPoolTag(
        constPool,
        info.referenceIndex,
        ConstPoolTag.InterfaceMethodRef
      );
      break;
    default:
      throw new Error(
        `Invalid method handle reference kind: ${info.referenceKind}`
      );
  }
  switch (info.referenceKind) {
    case MethodHandleReferenceKind.InvokeInterface:
    case MethodHandleReferenceKind.InvokeSpecial:
    case MethodHandleReferenceKind.InvokeVirtual:
    case MethodHandleReferenceKind.InvokeStatic: {
      const methodName = getMethodName(info, constPool);
      if (
        methodName === CONSTRUCTOR_NAME ||
        methodName === STATIC_INITIALIZER_NAME
      )
        throw new Error(
          "Constructor or Static initializer may not be invoked."
        );
      break;
    }
    case MethodHandleReferenceKind.NewInvokeSpecial:
      const methodName = getMethodName(info, constPool);
      if (methodName !== CONSTRUCTOR_NAME) {
        throw new Error("May only invoke constructor.");
      }
      break;
  }
};

const getMethodName = (
  info: ConstPoolInfoType<ConstPoolTag.MethodHandle>,
  constPool: RawConstantPool
): string => {
  const methodInfo = constPool[info.referenceIndex - 1];
  if (methodInfo.tag === ConstPoolTag.MethodRef) {
    const nameAndInfo = constPool[methodInfo.nameAndTypeIndex - 1];
    if (nameAndInfo.tag === ConstPoolTag.NameAndType) {
      const nameInfo = constPool[nameAndInfo.nameIndex - 1];
      if (nameInfo.tag == ConstPoolTag.Utf8) {
        const name = parseUtf8(nameInfo);
        return name;
      }
    }
  }
  throw new Error("Invalid MethodHandle");
};
const getMethodNameByInfo = (
  method: RawMethodInfo,
  constPool: RawConstantPool
) => {
  const nameInfo = constPool[method.nameIndex - 1];
  if (nameInfo.tag === ConstPoolTag.Utf8) {
    const name = parseUtf8(nameInfo);
    return name;
  }
  throw new Error("Method has invalid nameinfo");
};

const validateDynamicInfo = (
  constPool: RawConstantPool,
  info: ConstPoolInfoType<ConstPoolTag.InvokeDynamic | ConstPoolTag.Dynamic>
) => {
  validateIsConstPoolTag(
    constPool,
    info.nameAndTypeIndex,
    ConstPoolTag.NameAndType
  );
  // Todo: Validate is Bootstrap Method
  // Page 97 of the JVM spec
};
// Page 75 of the JVM specification

export const validateAccessFlags = (
  accessFlags: UInt16,
  majorVersion: number
): never | void => {
  const hex = accessFlags.toString(16);
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

export const validateFields = (
  fields: RawFieldInfo[],
  constPool: RawConstantPool
) => {
  fields.forEach((field) => validateField(field, constPool));
};

const validateField = (field: RawFieldInfo, constPool: RawConstantPool) => {
  const accessFlags = field.accessFlags;
  const hex = accessFlags.toString(16);

  validateIsConstPoolTag(constPool, field.nameIndex, ConstPoolTag.Utf8);
  validateIsConstPoolTag(constPool, field.descriptorIndex, ConstPoolTag.Utf8);
  if (
    !hasAtMostOneOfAccessFlags(
      accessFlags,
      RawFieldAccessFlags.ACC_PUBLIC,
      RawFieldAccessFlags.ACC_PRIVATE,
      RawFieldAccessFlags.ACC_PROTECTED
    )
  ) {
    throw new Error(
      `Invalid field access flags: ${hex},  at most one of public, private and protected may be set`
    );
  }
  if (
    !hasAtMostOneOfAccessFlags(
      accessFlags,
      RawFieldAccessFlags.ACC_FINAL,
      RawFieldAccessFlags.ACC_VOLATILE
    )
  ) {
    throw new Error(
      `Invalid field access flags: ${hex}, at most one of final and volatile may be set`
    );
  }
};

const validateMethods = (
  methods: RawMethodInfos,
  constPool: RawConstantPool,
  rawClass: RawClassFile
) => {
  methods.forEach((m) => validateMethod(m, constPool, rawClass));
};

const validateMethod = (
  method: RawMethodInfo,
  constPool: RawConstantPool,
  rawClass: RawClassFile
) => {
  validateIsConstPoolTag(constPool, method.descriptorIndex, ConstPoolTag.Utf8);
  validateIsConstPoolTag(constPool, method.nameIndex, ConstPoolTag.Utf8);
  const accessFlags = method.accessFlags;
  const hex = accessFlags.toString(16);
  if (
    !hasAtMostOneOfAccessFlags(
      accessFlags,
      RawMethodAccessFlags.ACC_PUBLIC,
      RawMethodAccessFlags.ACC_PRIVATE,
      RawMethodAccessFlags.ACC_PROTECTED
    )
  ) {
    throw new Error(
      `Invalid method access flags: ${hex},  at most one of public, private and protected may be set.`
    );
  }
  const classAccessFlags = new ClassAccessFlags(rawClass.accessFlags);
  if (classAccessFlags.isInterface) {
    validateInterfaceMethods(method, rawClass);
  }
  if (hasAccessFlag(accessFlags, RawMethodAccessFlags.ACC_ABSTRACT)) {
    if (
      hasAnyAccessFlagsOf(
        accessFlags,
        RawMethodAccessFlags.ACC_PRIVATE,
        RawMethodAccessFlags.ACC_FINAL,
        RawMethodAccessFlags.ACC_STATIC,
        RawMethodAccessFlags.ACC_NATIVE,
        RawMethodAccessFlags.ACC_SYNCHRONIZED
      )
    ) {
      throw new Error(
        `Invalid method access flag: ${hex}, abstract methods may not be private, final, static, native or synchronized.`
      );
    }
    if (rawClass.majorVersion > 46 && rawClass.majorVersion <= 60) {
      if (hasAccessFlag(accessFlags, RawMethodAccessFlags.ACC_STRICT)) {
        throw new Error(
          `Invalid method access flag: ${hex}, abstract methods may not be strict.`
        );
      }
    }
  }

  const methodName = getMethodNameByInfo(method, rawClass.constantPool);
  if (methodName === CONSTRUCTOR_NAME) {
    let allowedConstructorFlags =
      RawMethodAccessFlags.ACC_PRIVATE |
      RawMethodAccessFlags.ACC_PUBLIC |
      RawMethodAccessFlags.ACC_PROTECTED |
      RawMethodAccessFlags.ACC_VARARGS |
      RawMethodAccessFlags.ACC_SYNTHETIC;
    if (rawClass.majorVersion > 46 && rawClass.majorVersion <= 60)
      allowedConstructorFlags =
        allowedConstructorFlags | RawMethodAccessFlags.ACC_STRICT;
    const notAllowedFlags = ~allowedConstructorFlags;
    if ((notAllowedFlags & accessFlags) !== 0) {
      throw new Error(
        `Invalid method access flags: ${hex} Constructor may only be private, public, protected, varargs, synthetic or strict`
      );
    }
  }
  if (rawClass.majorVersion >= 51 && methodName === STATIC_INITIALIZER_NAME) {
    if (!hasAccessFlag(accessFlags, RawMethodAccessFlags.ACC_STATIC))
      throw new Error(
        `Invalid method access flags: ${hex} static initializer must be static`
      );
  }
};

const validateInterfaceMethods = (
  method: RawMethodInfo,
  rawClass: RawClassFile
) => {
  const accessFlags = method.accessFlags;
  const hex = accessFlags.toString(16);
  if (
    hasAnyAccessFlagsOf(
      accessFlags,
      RawMethodAccessFlags.ACC_PROTECTED,
      RawMethodAccessFlags.ACC_FINAL,
      RawMethodAccessFlags.ACC_NATIVE,
      RawMethodAccessFlags.ACC_SYNCHRONIZED
    )
  ) {
    throw new Error(
      `Invalid method access flags: ${hex}, interface methods may not be protected, final, native or synchronized`
    );
  }
  if (rawClass.majorVersion < 52) {
    if (
      !hasAccessFlags(
        accessFlags,
        RawMethodAccessFlags.ACC_PUBLIC,
        RawMethodAccessFlags.ACC_ABSTRACT
      )
    )
      throw new Error(
        `Invalid method access flags: ${hex}, interface methods must be public and abstract`
      );
  } else {
    if (
      hasAnyAccessFlagsOf(
        accessFlags,
        RawMethodAccessFlags.ACC_PUBLIC,
        RawMethodAccessFlags.ACC_PRIVATE
      )
    ) {
      throw new Error(
        `Invalid method access flags: ${hex}, interface methods must be public or private`
      );
    }
  }
};

const validateAttributes = (
  attributes: RawAttributeInfo[],
  rawClass: RawClassFile
) => {
  attributes.forEach((a) => validateAttribute(a, rawClass));
};
const validateAttribute = (
  attribute: RawAttributeInfo,
  rawClass: RawClassFile
) => {
  validateIsConstPoolTag(
    rawClass.constantPool,
    attribute.attributeNameIndex,
    ConstPoolTag.Utf8
  );
};
