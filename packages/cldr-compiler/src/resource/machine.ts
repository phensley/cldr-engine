import { Digits, Field, Instruction, Origin, Scope, ScopeMap, Vector } from '@phensley/cldr-core';

const leftPad = (s: number | string, w: number): string => {
  s = typeof s === 'number' ? String(s) : s;
  let d = w - s.length;
  let r = '';
  while (d-- > 0) {
    r += ' ';
  }
  return r + s;
};

export interface Encoder {
  encode(name: string): number;
  count(): number;
  size(): number;
  distinct(): number;
}

const countChars = (s: string, ch: string): number => {
  let res = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === ch) {
      res++;
    }
  }
  return res;
};

const PADDING = 8;

/**
 * Executes the instructions to encode strings.
 */
export class EncoderMachine {
  private origin!: Origin;

  constructor(
    private encoder: Encoder,
    private verbose: boolean,
  ) {}

  encode(obj: any, inst: Instruction): void {
    switch (inst.type) {
      case 'digits':
        this.encodeDigits(obj, inst);
        break;
      case 'field':
        this.encodeField(obj, inst);
        break;
      case 'origin':
        this.encodeOrigin(obj, inst);
        break;
      case 'scope':
        this.encodeScope(obj, inst);
        break;
      case 'scopemap':
        this.encodeScopeMap(obj, inst);
        break;
      case 'vector':
        this.encodeVector(obj, inst);
        break;
    }
  }

  private encodeDigits(obj: any, inst: Digits): void {
    const dim0 = this.origin.getIndex(inst.dim0);

    const o0 = obj[inst.name] || {};
    for (const k1 of dim0.keys) {
      const o1 = o0[k1] || {};
      for (const n of inst.values) {
        const field = o1[n];
        let divisor = 0;
        if (field !== undefined && field !== '0') {
          const count = countChars(field, '0');
          divisor = n - count;
        }
        this.encoder.encode(field);
        this.encoder.encode(String(divisor));
      }
    }
  }

  private encodeField(obj: any, inst: Field): void {
    this.encoder.encode(obj[inst.name]);
  }

  private encodeOrigin(obj: any, inst: Origin): void {
    this.origin = inst;

    let totalCount = 0;
    let totalSize = 0;
    for (const i of inst.block) {
      const saveCount = this.encoder.count();
      const saveSize = this.encoder.size();
      this.encode(obj, i);
      const count = this.encoder.count() - saveCount;
      const size = this.encoder.size() - saveSize;
      totalCount += count;
      totalSize += size;
      if (this.verbose) {
        console.log(
          `      ${leftPad(i.identifier, 20)}  ` +
            `${leftPad(count, PADDING)} fields   ${leftPad(size, PADDING)} chars`,
        );
      }
    }
    if (this.verbose) {
      console.log('      --------------------   --------------   --------------');
      console.log(
        `      ${leftPad('Total', 20)}  ` +
          `${leftPad(totalCount, PADDING)} fields   ${leftPad(totalSize, PADDING)} chars`,
      );
      console.log(`      ${leftPad('', 20)}  ${leftPad(this.encoder.distinct(), PADDING)} distinct strings`);
    }
  }

  private encodeScope(obj: any, inst: Scope): void {
    const curr = obj[inst.name] || {};
    for (const i of inst.block) {
      this.encode(curr, i);
    }
  }

  private encodeScopeMap(obj: any, inst: ScopeMap): void {
    const fields = this.origin.getValues(inst.fields);
    const curr = obj[inst.name] || {};
    for (const field of fields) {
      const child = curr[field] || {};
      for (const i of inst.block) {
        this.encode(child, i);
      }
    }
  }

  private encodeVector(obj: any, inst: Vector): any {
    const o = obj[inst.name] || {};
    const values: string[] = [];
    const exists = this._encodeVector(o, inst, values, 0);
    this.encoder.encode(exists ? 'E' : 'N');
    for (const v of values) {
      this.encoder.encode(v);
    }
  }

  private _encodeVector(obj: any, inst: Vector, values: string[], k: number): boolean {
    const dims = inst.dims;
    const dim = this.origin.getIndex(dims[k]);
    const last = k === dims.length - 1;
    let exists = false;
    for (const key of dim.keys) {
      if (!last) {
        // Drill one level deeper
        const res = this._encodeVector(obj[key] || {}, inst, values, k + 1);
        exists = exists || res;
      } else {
        // Encode the value
        const v = obj[key];
        exists = exists || !!v;
        values.push(v || '');
      }
    }
    return exists;
  }
}
