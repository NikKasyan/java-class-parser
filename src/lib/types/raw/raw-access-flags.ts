import { UInt16 } from "../bytes";

export type AccessFlag = UInt16;

export type AccessFlags = AccessFlag;

export const ClassAccessFlags = {
  ACC_PUBLIC: 0x0001 as AccessFlag,
  ACC_FINAL: 0x0010 as AccessFlag,
  ACC_SUPER: 0x0020 as AccessFlag,
  ACC_INTERFACE: 0x0200 as AccessFlag,
  ACC_ABSTRACT: 0x0400 as AccessFlag,
  ACC_SYNTHETIC: 0x1000 as AccessFlag,
  ACC_ANNOTATION: 0x2000 as AccessFlag,
  ACC_ENUM: 0x4000 as AccessFlag,
  ACC_MODULE: 0x8000 as AccessFlag,
} as const;

export const AllClassAccessFlags =
  Object.values(ClassAccessFlags).reduce((acc, flag) => acc | flag, 0) & 0xffff;

export const ClassAccessFlagNames = {
  [ClassAccessFlags.ACC_PUBLIC]: "ACC_PUBLIC",
  [ClassAccessFlags.ACC_FINAL]: "ACC_FINAL",
  [ClassAccessFlags.ACC_SUPER]: "ACC_SUPER",
  [ClassAccessFlags.ACC_INTERFACE]: "ACC_INTERFACE",
  [ClassAccessFlags.ACC_ABSTRACT]: "ACC_ABSTRACT",
  [ClassAccessFlags.ACC_SYNTHETIC]: "ACC_SYNTHETIC",
  [ClassAccessFlags.ACC_ANNOTATION]: "ACC_ANNOTATION",
  [ClassAccessFlags.ACC_ENUM]: "ACC_ENUM",
} as const;

export const FieldAccessFlags = {
  ACC_PUBLIC: 0x0001 as AccessFlag,
  ACC_PRIVATE: 0x0002 as AccessFlag,
  ACC_PROTECTED: 0x0004 as AccessFlag,
  ACC_STATIC: 0x0008 as AccessFlag,
  ACC_FINAL: 0x0010 as AccessFlag,
  ACC_VOLATILE: 0x0040 as AccessFlag,
  ACC_TRANSIENT: 0x0080 as AccessFlag,
  ACC_SYNTHETIC: 0x1000 as AccessFlag,
  ACC_ENUM: 0x4000 as AccessFlag,
} as const;

export const FieldAccessFlagNames = {
  [FieldAccessFlags.ACC_PUBLIC]: "ACC_PUBLIC",
  [FieldAccessFlags.ACC_PRIVATE]: "ACC_PRIVATE",
  [FieldAccessFlags.ACC_PROTECTED]: "ACC_PROTECTED",
  [FieldAccessFlags.ACC_STATIC]: "ACC_STATIC",
  [FieldAccessFlags.ACC_FINAL]: "ACC_FINAL",
  [FieldAccessFlags.ACC_VOLATILE]: "ACC_VOLATILE",
  [FieldAccessFlags.ACC_TRANSIENT]: "ACC_TRANSIENT",
  [FieldAccessFlags.ACC_SYNTHETIC]: "ACC_SYNTHETIC",
  [FieldAccessFlags.ACC_ENUM]: "ACC_ENUM",
} as const;

export const AllFieldAccessFlags =
  Object.values(FieldAccessFlags).reduce((acc, flag) => acc | flag, 0) & 0xffff;

export const MethodAccessFlags = {
  ACC_PUBLIC: 0x0001 as AccessFlag,
  ACC_PRIVATE: 0x0002 as AccessFlag,
  ACC_PROTECTED: 0x0004 as AccessFlag,
  ACC_STATIC: 0x0008 as AccessFlag,
  ACC_FINAL: 0x0010 as AccessFlag,
  ACC_SYNCHRONIZED: 0x0020 as AccessFlag,
  ACC_BRIDGE: 0x0040 as AccessFlag,
  ACC_VARARGS: 0x0080 as AccessFlag,
  ACC_NATIVE: 0x0100 as AccessFlag,
  ACC_ABSTRACT: 0x0400 as AccessFlag,
  ACC_STRICT: 0x0800 as AccessFlag,
  ACC_SYNTHETIC: 0x1000 as AccessFlag,
} as const;

export const MethodAccessFlagNames = {
  [MethodAccessFlags.ACC_PUBLIC]: "ACC_PUBLIC",
  [MethodAccessFlags.ACC_PRIVATE]: "ACC_PRIVATE",
  [MethodAccessFlags.ACC_PROTECTED]: "ACC_PROTECTED",
  [MethodAccessFlags.ACC_STATIC]: "ACC_STATIC",
  [MethodAccessFlags.ACC_FINAL]: "ACC_FINAL",
  [MethodAccessFlags.ACC_SYNCHRONIZED]: "ACC_SYNCHRONIZED",
  [MethodAccessFlags.ACC_BRIDGE]: "ACC_BRIDGE",
  [MethodAccessFlags.ACC_VARARGS]: "ACC_VARARGS",
  [MethodAccessFlags.ACC_NATIVE]: "ACC_NATIVE",
  [MethodAccessFlags.ACC_ABSTRACT]: "ACC_ABSTRACT",
  [MethodAccessFlags.ACC_STRICT]: "ACC_STRICT",
  [MethodAccessFlags.ACC_SYNTHETIC]: "ACC_SYNTHETIC",
} as const;

export const ParameterAccessFlags = {
  ACC_FINAL: 0x0010 as AccessFlag,
  ACC_SYNTHETIC: 0x1000 as AccessFlag,
  ACC_MANDATED: 0x8000 as AccessFlag,
} as const;

export const ParameterAccessFlagNames = {
  [ParameterAccessFlags.ACC_FINAL]: "ACC_FINAL",
  [ParameterAccessFlags.ACC_SYNTHETIC]: "ACC_SYNTHETIC",
  [ParameterAccessFlags.ACC_MANDATED]: "ACC_MANDATED",
} as const;

export const ModuleAccessFlags = {
  ACC_OPEN: 0x0020 as AccessFlag,
  ACC_SYNTHETIC: 0x1000 as AccessFlag,
  ACC_MANDATED: 0x8000 as AccessFlag,
} as const;

export const ModuleAccessFlagNames = {
  [ModuleAccessFlags.ACC_OPEN]: "ACC_OPEN",
  [ModuleAccessFlags.ACC_SYNTHETIC]: "ACC_SYNTHETIC",
  [ModuleAccessFlags.ACC_MANDATED]: "ACC_MANDATED",
} as const;

export const RequireAccessFlags = {
  ACC_TRANSITIVE: 0x0020 as AccessFlag,
  ACC_STATIC_PHASE: 0x0040 as AccessFlag,
  ACC_SYNTHETIC: 0x1000 as AccessFlag,
  ACC_MANDATED: 0x8000 as AccessFlag,
} as const;

export const RequireAccessFlagNames = {
  [RequireAccessFlags.ACC_TRANSITIVE]: "ACC_TRANSITIVE",
  [RequireAccessFlags.ACC_STATIC_PHASE]: "ACC_STATIC_PHASE",
  [RequireAccessFlags.ACC_SYNTHETIC]: "ACC_SYNTHETIC",
  [RequireAccessFlags.ACC_MANDATED]: "ACC_MANDATED",
} as const;

export const ExportsAccessFlags = {
  ACC_SYNTHETIC: 0x1000 as AccessFlag,
  ACC_MANDATED: 0x8000 as AccessFlag,
} as const;

export const ExportsAccessFlagNames = {
  [ExportsAccessFlags.ACC_SYNTHETIC]: "ACC_SYNTHETIC",
  [ExportsAccessFlags.ACC_MANDATED]: "ACC_MANDATED",
} as const;

export const OpensAccessFlags = {
  ACC_SYNTHETIC: 0x1000 as AccessFlag,
  ACC_MANDATED: 0x8000 as AccessFlag,
} as const;

export const OpensAccessFlagNames = {
  [OpensAccessFlags.ACC_SYNTHETIC]: "ACC_SYNTHETIC",
  [OpensAccessFlags.ACC_MANDATED]: "ACC_MANDATED",
} as const;

export const hasAccessFlag = (
  flagsToCheck: number,
  flag: AccessFlag
): boolean => {
  return (flagsToCheck & flag) === flag;
};

export const hasAccessFlags = (
  flagsToCheck: number,
  ...flags: AccessFlag[]
): boolean => {
  return flags.every((flag) => hasAccessFlag(flagsToCheck, flag));
};

export const hasExactlyOneOfAccessFlags = (
  flagsToCheck: number,
  ...flags: AccessFlag[]
) => {
  return flags
    .map((f) => hasAccessFlag(flagsToCheck, f))
    .reduce((acc, c) => acc !== c, false);
};
export const hasAtMostOneOfAccessFlags = (
  flagsToCheck: number,
  ...flags: AccessFlag[]
) => {
  const setFlags = flags.map((f) => hasAccessFlag(flagsToCheck, f));
  const hasOneSet = setFlags.reduce((a, c) => a !== c, false);
  const hasNoneSet = setFlags.every((f) => f === false);

  return hasOneSet || hasNoneSet;
};

export const hasAnyAccessFlagsOf = (
  flagsToCheck: number,
  ...flags: AccessFlag[]
) => {
  for (const flag of flags) {
    if (hasAccessFlag(flagsToCheck, flag)) return true;
  }
  return false;
};

export const extractClassAccessFlags = (flags: number): AccessFlag[] => {
  return Object.keys(ClassAccessFlags)
    .map((key) => ClassAccessFlags[key as keyof typeof ClassAccessFlags])
    .filter((flag) => hasAccessFlag(flags, flag));
};

export const extractClassAccessFlagNames = (
  flags: number
): (typeof ClassAccessFlagNames)[number][] => {
  return extractClassAccessFlags(flags).map(
    (flag) => ClassAccessFlagNames[flag]
  );
};

export const extractFieldAccessFlags = (flags: number): AccessFlag[] => {
  return Object.keys(FieldAccessFlags)
    .map((key) => FieldAccessFlags[key as keyof typeof FieldAccessFlags])
    .filter((flag) => hasAccessFlag(flags, flag));
};

export const extractFieldAccessFlagNames = (
  flags: number
): (typeof FieldAccessFlagNames)[number][] => {
  return extractFieldAccessFlags(flags).map(
    (flag) => FieldAccessFlagNames[flag]
  );
};

export const extractMethodAccessFlags = (flags: number): AccessFlag[] => {
  return Object.keys(MethodAccessFlags)
    .map((key) => MethodAccessFlags[key as keyof typeof MethodAccessFlags])
    .filter((flag) => hasAccessFlag(flags, flag));
};

export const extractMethodAccessFlagNames = (
  flags: number
): (typeof MethodAccessFlagNames)[number][] => {
  return extractMethodAccessFlags(flags).map(
    (flag) => MethodAccessFlagNames[flag]
  );
};

export const extractParameterAccessFlags = (flags: number): AccessFlag[] => {
  return Object.keys(ParameterAccessFlags)
    .map(
      (key) => ParameterAccessFlags[key as keyof typeof ParameterAccessFlags]
    )
    .filter((flag) => hasAccessFlag(flags, flag));
};

export const extractParameterAccessFlagNames = (
  flags: number
): (typeof ParameterAccessFlagNames)[number][] => {
  return extractParameterAccessFlags(flags).map(
    (flag) => ParameterAccessFlagNames[flag]
  );
};

export const extractModuleAccessFlags = (flags: number): AccessFlag[] => {
  return Object.keys(ModuleAccessFlags)
    .map((key) => ModuleAccessFlags[key as keyof typeof ModuleAccessFlags])
    .filter((flag) => hasAccessFlag(flags, flag));
};

export const extractModuleAccessFlagNames = (
  flags: number
): (typeof ModuleAccessFlagNames)[number][] => {
  return extractModuleAccessFlags(flags).map(
    (flag) => ModuleAccessFlagNames[flag]
  );
};

export const extractRequireAccessFlags = (flags: number): AccessFlag[] => {
  return Object.keys(RequireAccessFlags)
    .map((key) => RequireAccessFlags[key as keyof typeof RequireAccessFlags])
    .filter((flag) => hasAccessFlag(flags, flag));
};

export const extractRequireAccessFlagNames = (
  flags: number
): (typeof RequireAccessFlagNames)[number][] => {
  return extractRequireAccessFlags(flags).map(
    (flag) => RequireAccessFlagNames[flag]
  );
};

export const extractExportsAccessFlags = (flags: number): AccessFlag[] => {
  return Object.keys(ExportsAccessFlags)
    .map((key) => ExportsAccessFlags[key as keyof typeof ExportsAccessFlags])
    .filter((flag) => hasAccessFlag(flags, flag));
};

export const extractExportsAccessFlagNames = (
  flags: number
): (typeof ExportsAccessFlagNames)[number][] => {
  return extractExportsAccessFlags(flags).map(
    (flag) => ExportsAccessFlagNames[flag]
  );
};

export const extractOpensAccessFlags = (flags: number): AccessFlag[] => {
  return Object.keys(OpensAccessFlags)
    .map((key) => OpensAccessFlags[key as keyof typeof OpensAccessFlags])
    .filter((flag) => hasAccessFlag(flags, flag));
};

export const extractOpensAccessFlagNames = (
  flags: number
): (typeof OpensAccessFlagNames)[number][] => {
  return extractOpensAccessFlags(flags).map(
    (flag) => OpensAccessFlagNames[flag]
  );
};
