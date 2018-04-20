import {
  Digits,
  Field,
  Instruction,
  Origin,
  Scope,
  ScopeMap,
  Vector1,
  Vector2
} from '@phensley/cldr-schema';

import {
  pluralDigit,
  pluralDigitFields,
  pluralFields
} from '../utils';

export interface Encoder {
  encode(name: string): number;
  count(): number;
  size(): number;
}

const leftPad = (s: string | number, w: number): string => {
  s = typeof s === 'number' ? String(s) : s;
  let d = w - s.length;
  let r = '';
  while (d-- > 0) {
    r += ' ';
  }
  return r + s;
};

const altValues = ['', '-alt-variant', '-alt-short', '-alt-narrow'];
const yeartypeValues = ['', '-yeartype-leap'];

export const altField = (key: string) => altValues.map(v => `${key}${v}`);
export const yeartypeField = (key: string) => yeartypeValues.map(v => `${key}-yeartype-${v}`);

export const pluralDivisorFields = (() => {
  const res: [number, string][] = [];
  for (let i = 1; i <= 15; i++) {
    const base = pluralDigit(i);
    const field = `${base}-count-other`;
    res.push([i, field]);
  }
  return res;
})();

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

  constructor(private encoder: Encoder, private verbose: boolean) {}

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
    case 'vector1':
      this.encodeVector1(obj, inst);
      break;
    case 'vector2':
      this.encodeVector2(obj, inst);
      break;
    }
  }

  private encodeDigits<T extends string>(obj: any, inst: Digits<T>): void {
    const o0 = obj[inst.name] || {};
    for (const k1 of inst.dim0.keys) {
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
        console.warn(`      ${leftPad(i.identifier, 20)}  ` +
          `${leftPad(count, PADDING)} fields   ${leftPad(size, PADDING)} chars`);
      }
    }
    if (this.verbose) {
      console.warn('      --------------------   --------------   --------------');
      console.warn(`      ${leftPad('Total', 20)}  ` +
        `${leftPad(totalCount, PADDING)} fields   ${leftPad(totalSize, PADDING)} chars`);
    }
  }

  private encodeScope(obj: any, inst: Scope): void {
    const curr = obj[inst.name] || {};
    for (const i of inst.block) {
      this.encode(curr, i);
    }
  }

  private encodeScopeMap(obj: any, inst: ScopeMap): void {
    const curr = obj[inst.name] || {};
    for (const field of inst.fields) {
      const child = curr[field] || {};
      for (const i of inst.block) {
        this.encode(child, i);
      }
    }

    const undef: any = {};
    for (const i of inst.block) {
      this.encode(undef, i);
    }
  }

  private encodeVector1<T extends string>(obj: any, inst: Vector1<T>): void {
    const values: string[] = [];
    let exists = false;
    const o0 = obj[inst.name] || {};
    for (const k of inst.dim0.keys) {
      const v = o0[k];
      exists = exists || v !== undefined && v !== '';
      values.push(v);
    }
    // header
    this.encoder.encode(exists ? 'E' : 'N');
    for (const v of values) {
      this.encoder.encode(v);
    }
  }

  private encodeVector2<T extends string, S extends string>(obj: any, inst: Vector2<T, S>): void {
    const values: string[] = [];
    let exists = false;
    const o0 = obj[inst.name] || {};
    for (const k1 of inst.dim0.keys) {
      const o1 = o0[k1] || {};
      for (const k2 of inst.dim1.keys) {
        const v = o1[k2];
        exists = exists || v !== undefined && v !== '';
        values.push(v);
      }
    }
    // header
    this.encoder.encode(exists ? 'E' : 'N');
    for (const v of values) {
      this.encoder.encode(v);
    }
  }
}
