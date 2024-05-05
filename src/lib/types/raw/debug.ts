export type WithOffsets<T> = T extends
  | number
  | string
  | boolean
  | null
  | Uint8Array
  ? { value: T; offset: number; numberOfBytes: number }
  : T extends Array<infer U>
  ? {
      numberOfBytes: number;
      offset: number;
      value: WithOffsets<U>[];
    }
  : {
      numberOfBytes: number;
      offset: number;
      value: { [K in keyof T]: WithOffsets<T[K]> };
    };
