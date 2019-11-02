export interface KeyIndexMap {
  [name: string]: KeyIndex<string>;
}

export interface KeyIndex<T extends string> {
  readonly index: { [P in T]: number };
  readonly keys: T[];
  readonly size: number;
  get(key: T): number;
}
