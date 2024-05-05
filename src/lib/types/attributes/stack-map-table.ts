import { UInt16, UInt8 } from "../bytes";
import { AttributeStructBase } from "./attributes";

export enum VerificationTypeInfoTag {
  Top = 0,
  Integer = 1,
  Float = 2,
  Double = 3,
  Long = 4,
  Null = 5,
  UninitializedThis = 6,
  Object = 7,
  Uninitialized = 8,
}

type TopVariableInfo = {
  tag: VerificationTypeInfoTag.Top;
};
type IntegerVariableInfo = {
  tag: VerificationTypeInfoTag.Integer;
};
type FloatVariableInfo = {
  tag: VerificationTypeInfoTag.Float;
};
type DoubleVariableInfo = {
  tag: VerificationTypeInfoTag.Double;
};
type LongVariableInfo = {
  tag: VerificationTypeInfoTag.Long;
};
type NullVariableInfo = {
  tag: VerificationTypeInfoTag.Null;
};
type UninitializedThisVariableInfo = {
  tag: VerificationTypeInfoTag.UninitializedThis;
};
type ObjectVariableInfo = {
  tag: VerificationTypeInfoTag.Object;
  cpoolIndex: UInt16;
};
type UninitializedVariableInfo = {
  tag: VerificationTypeInfoTag.Uninitialized;
  offset: UInt16;
};

export type VerificationTypeInfo =
  | TopVariableInfo
  | IntegerVariableInfo
  | FloatVariableInfo
  | DoubleVariableInfo
  | LongVariableInfo
  | NullVariableInfo
  | UninitializedThisVariableInfo
  | ObjectVariableInfo
  | UninitializedVariableInfo;

export type SameFrame = {
  frameType: UInt8; // 0-63
};
export type SameLocals1StackItemFrame = {
  frameType: UInt8; // 64-127
  stack: [VerificationTypeInfo];
};

export const getOffsetDelta = (frame: SameLocals1StackItemFrame) => {
  return frame.frameType - 64;
};

export type UnusedFrame = {
  frameType: UInt8; // 128 - 246
};
export type SameLocals1StackItemFrameExtended = {
  frameType: 247;
  offsetDelta: UInt16;
  stack: [VerificationTypeInfo];
};
export type ChopFrame = {
  frameType: 248 | 249 | 250;
  offsetDelta: UInt16;
};

export const getNumberOfAbsentLocals = (chompFrame: ChopFrame | number) => {
  if (typeof chompFrame === "number") {
    if (chompFrame < 248 || chompFrame > 250)
      throw new Error("Invalid frame type for chop frame");
    return 251 - chompFrame;
  }
  return 251 - chompFrame.frameType;
};

export type SameFrameExtended = {
  frameType: 251;
  offsetDelta: UInt16;
};

type AppendFrame1 = {
  frameType: 252;
  offsetDelta: UInt16;
  locals: [VerificationTypeInfo];
};
type AppendFrame2 = {
  frameType: 253;
  offsetDelta: UInt16;
  locals: [VerificationTypeInfo, VerificationTypeInfo];
};

type AppendFrame3 = {
  frameType: 254;
  offsetDelta: UInt16;
  locals: [VerificationTypeInfo, VerificationTypeInfo, VerificationTypeInfo];
};
export type AppendFrame = AppendFrame1 | AppendFrame2 | AppendFrame3;

export const getNumberOfAppendedLocals = (appendFrame: AppendFrame) => {
  return appendFrame.locals.length;
};

export type FullFrame = {
  frameType: 255;
  offsetDelta: UInt16;
  numberOfLocals: UInt16;
  locals: VerificationTypeInfo[];
  numberOfStackItems: UInt16;
  stack: VerificationTypeInfo[];
};

export type StackMapFrame =
  | SameFrame
  | SameLocals1StackItemFrame
  | UnusedFrame
  | SameLocals1StackItemFrameExtended
  | ChopFrame
  | SameFrameExtended
  | AppendFrame
  | FullFrame;

export type StackMapTable = {
  name: "StackMapTable";
  numberOfEntries: UInt16;
  entries: StackMapFrame[];
} & AttributeStructBase;
