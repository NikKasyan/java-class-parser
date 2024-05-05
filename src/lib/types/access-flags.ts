import {
  ClassAccessFlags as RawClassAccessFlags,
  FieldAccessFlags as RawFieldAccessFlags,
  MethodAccessFlags as RawMethodAccessFlags,
  ParameterAccessFlags as RawParameterAccessFlags,
  ExportsAccessFlags as RawExportsAccessFlags,
  OpensAccessFlags as RawOpensAccessFlags,
  RequireAccessFlags as RawRequireAccessFlags,
  ModuleAccessFlags as RawModuleAccessFlags,
  extractClassAccessFlagNames,
  extractFieldAccessFlagNames,
  extractMethodAccessFlagNames,
  extractParameterAccessFlagNames,
  extractModuleAccessFlagNames,
  extractExportsAccessFlagNames,
  extractOpensAccessFlagNames,
  extractRequireAccessFlagNames,
  hasAccessFlag,
} from "./raw/raw-access-flags";
export class ClassAccessFlags {
  constructor(private readonly flags: number) {}

  get isPublic(): boolean {
    return hasAccessFlag(this.flags, RawClassAccessFlags.ACC_PUBLIC);
  }

  get isFinal(): boolean {
    return hasAccessFlag(this.flags, RawClassAccessFlags.ACC_FINAL);
  }

  get isSuper(): boolean {
    return hasAccessFlag(this.flags, RawClassAccessFlags.ACC_SUPER);
  }

  get isInterface(): boolean {
    return hasAccessFlag(this.flags, RawClassAccessFlags.ACC_INTERFACE);
  }

  get isAbstract(): boolean {
    return hasAccessFlag(this.flags, RawClassAccessFlags.ACC_ABSTRACT);
  }

  get isSynthetic(): boolean {
    return hasAccessFlag(this.flags, RawClassAccessFlags.ACC_SYNTHETIC);
  }

  get isAnnotation(): boolean {
    return hasAccessFlag(this.flags, RawClassAccessFlags.ACC_ANNOTATION);
  }

  get isEnum(): boolean {
    return hasAccessFlag(this.flags, RawClassAccessFlags.ACC_ENUM);
  }

  get flagNames(): string[] {
    return extractClassAccessFlagNames(this.flags);
  }
}

export class MethodAccessFlags {
  constructor(private readonly flags: number) {}

  get isPublic(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_PUBLIC);
  }

  get isPrivate(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_PRIVATE);
  }

  get isProtected(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_PROTECTED);
  }

  get isStatic(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_STATIC);
  }

  get isFinal(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_FINAL);
  }

  get isSynchronized(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_SYNCHRONIZED);
  }

  get isBridge(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_BRIDGE);
  }

  get isVarargs(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_VARARGS);
  }

  get isNative(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_NATIVE);
  }

  get isAbstract(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_ABSTRACT);
  }

  get isStrict(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_STRICT);
  }

  get isSynthetic(): boolean {
    return hasAccessFlag(this.flags, RawMethodAccessFlags.ACC_SYNTHETIC);
  }

  get flagNames(): string[] {
    return extractMethodAccessFlagNames(this.flags);
  }
}

export class FieldAccessFlags {
  constructor(private readonly flags: number) {}

  get isPublic(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_PUBLIC);
  }

  get isPrivate(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_PRIVATE);
  }

  get isProtected(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_PROTECTED);
  }

  get isStatic(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_STATIC);
  }

  get isFinal(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_FINAL);
  }

  get isVolatile(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_VOLATILE);
  }

  get isTransient(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_TRANSIENT);
  }

  get isSynthetic(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_SYNTHETIC);
  }

  get isEnum(): boolean {
    return hasAccessFlag(this.flags, RawFieldAccessFlags.ACC_ENUM);
  }

  get flagNames(): string[] {
    return extractFieldAccessFlagNames(this.flags);
  }
}

export class ParameterAccessFlags {
  constructor(private readonly flags: number) {}

  get isFinal(): boolean {
    return hasAccessFlag(this.flags, RawParameterAccessFlags.ACC_FINAL);
  }

  get isSynthetic(): boolean {
    return hasAccessFlag(this.flags, RawParameterAccessFlags.ACC_SYNTHETIC);
  }

  get isMandated(): boolean {
    return hasAccessFlag(this.flags, RawParameterAccessFlags.ACC_MANDATED);
  }

  get flagNames(): string[] {
    return extractParameterAccessFlagNames(this.flags);
  }
}

export class ModuleAccessFlags {
  constructor(private readonly flags: number) {}

  get isOpen(): boolean {
    return hasAccessFlag(this.flags, RawModuleAccessFlags.ACC_OPEN);
  }

  get isSynthetic(): boolean {
    return hasAccessFlag(this.flags, RawModuleAccessFlags.ACC_SYNTHETIC);
  }

  get isMandated(): boolean {
    return hasAccessFlag(this.flags, RawModuleAccessFlags.ACC_MANDATED);
  }

  get flagNames(): string[] {
    return extractModuleAccessFlagNames(this.flags);
  }
}

export class ExportAccessFlags {
  constructor(private readonly flags: number) {}

  get isSynthetic(): boolean {
    return hasAccessFlag(this.flags, RawExportsAccessFlags.ACC_SYNTHETIC);
  }

  get isMandated(): boolean {
    return hasAccessFlag(this.flags, RawExportsAccessFlags.ACC_MANDATED);
  }

  get flagNames(): string[] {
    return extractExportsAccessFlagNames(this.flags);
  }
}

export class OpenAccessFlags {
  constructor(private readonly flags: number) {}

  get isSynthetic(): boolean {
    return hasAccessFlag(this.flags, RawOpensAccessFlags.ACC_SYNTHETIC);
  }

  get isMandated(): boolean {
    return hasAccessFlag(this.flags, RawOpensAccessFlags.ACC_MANDATED);
  }

  get flagNames(): string[] {
    return extractOpensAccessFlagNames(this.flags);
  }
}

export class RequireAccessFlags {
  constructor(private readonly flags: number) {}

  get isTransitive(): boolean {
    return hasAccessFlag(this.flags, RawRequireAccessFlags.ACC_TRANSITIVE);
  }

  get isStaticPhase(): boolean {
    return hasAccessFlag(this.flags, RawRequireAccessFlags.ACC_STATIC_PHASE);
  }

  get isSynthetic(): boolean {
    return hasAccessFlag(this.flags, RawRequireAccessFlags.ACC_SYNTHETIC);
  }

  get isMandated(): boolean {
    return hasAccessFlag(this.flags, RawRequireAccessFlags.ACC_MANDATED);
  }

  get flagNames(): string[] {
    return extractRequireAccessFlagNames(this.flags);
  }
}
