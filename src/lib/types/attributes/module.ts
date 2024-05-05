import {
  ExportAccessFlags,
  ModuleAccessFlags,
  OpenAccessFlags,
  RequireAccessFlags,
} from "../access-flags";
import { UInt16 } from "../bytes";
import { AttributeStructBase } from "./attributes";

type ModuleRequire = {
  requiresIndex: UInt16;
  requiresFlags: RequireAccessFlags;
  requiresVersionIndex: UInt16;
};

type ModuleExport = {
  exportsIndex: UInt16;
  exportsFlags: ExportAccessFlags;
  exportsToCount: UInt16;
  exportsToIndex: UInt16[];
};

type ModuleOpen = {
  opensIndex: UInt16;
  opensFlags: OpenAccessFlags;
  opensToCount: UInt16;
  opensToIndex: UInt16[];
};

type ModuleProvide = {
  providesIndex: UInt16;
  providesWithCount: UInt16;
  providesWithIndex: UInt16[];
};

export type ModuleAttribute = {
  name: "Module";
  moduleName: string;
  moduleFlags: ModuleAccessFlags;
  moduleVersionIndex: UInt16;

  requiresCount: UInt16;
  requires: ModuleRequire[];

  exportsCount: UInt16;
  exports: ModuleExport[];

  opensCount: UInt16;
  opens: ModuleOpen[];

  usesCount: UInt16;
  usesIndex: UInt16[];

  providesCount: UInt16;
  provides: ModuleProvide[];
} & AttributeStructBase;
