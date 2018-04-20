import {
  Choice,
  Digits,
  Field,
  // FieldMap,
  Instruction,
  ObjectMap,
  Origin,
  Scope,
  // ScopeField,
  ScopeMap,
  Vector1,
  Vector2
} from '@phensley/cldr-schema';

export interface Encoder {
  encode(name: string): number;
}

const pluralValues = ['other', 'zero', 'one', 'two', 'few', 'many'];
const altValues = ['', '-alt-variant', '-alt-short', '-alt-narrow'];
const yeartypeValues = ['', '-yeartype-leap'];

export const pluralFields = (key: string) => pluralValues.map(v => `${key}-count-${v}`);
export const altField = (key: string) => altValues.map(v => `${key}${v}`);
export const yeartypeField = (key: string) => yeartypeValues.map(v => `${key}-yeartype-${v}`);

const pluralDigit = (n: number): string => {
  let r = '1';
  for (let i = 0; i < n - 1; i++) {
    r += '0';
  }
  return r;
};

// Produces a list of pluralized digits to for long/short formats.
// e.g. 1000-count-zero, 1000-count-one, ..., etc.
export const pluralDigitFields = (() => {
  const res = [];
  for (let i = 1; i <= 15; i++) {
    const base = pluralDigit(i);
    for (const key of pluralFields(base)) {
      res.push(key);
    }
  }
  return res;
})();

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

/**
 * Executes the instructions to encode strings.
 */
export class EncoderMachine {

  constructor(private encoder: Encoder) {}

  encode(obj: any, inst: Instruction): void {
    switch (inst.type) {
    case 'digits':
      this.encodeDigits(obj, inst);
      break;
    case 'field':
      this.encodeField(obj, inst);
      break;
    // case 'fieldmap':
    //   this.encodeFieldMap(obj, inst);
    //   break;
    case 'objectmap':
      this.encodeObjectMap(obj, inst);
      break;
    case 'origin':
      this.encodeOrigin(obj, inst);
      break;
    case 'scope':
      this.encodeScope(obj, inst);
      break;
    // case 'scopefield':
    //   this.encodeScopeField(obj, inst);
    //   break;
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

  private _encodeField(obj: any, name: string, choice: Choice = Choice.NONE): void {
    switch (choice) {
    case Choice.PLURAL:
      for (const f1 of pluralFields(name)) {
        this.encoder.encode(obj[f1]);
      }
      break;

    case Choice.ALT:
      for (const f2 of altField(name)) {
        this.encoder.encode(obj[f2]);
      }
      break;

    case Choice.YEARTYPE:
      for (const f3 of yeartypeField(name)) {
        this.encoder.encode(obj[f3]);
      }
      break;

    case Choice.NONE:
    default:
      this.encoder.encode(obj[name]);
      break;
    }
  }

  private encodeDigits(obj: any, inst: Digits): void {
    const curr = obj[inst.name] || {};
    for (const field of pluralDigitFields) {
      this.encoder.encode(curr[field]);
    }

    // Compute divisors for pluralized digit formats
    for (const entry of pluralDivisorFields) {
      const [digits, field] = entry;
      const value = curr[field];
      if (value === undefined || value === '0') {
        this.encoder.encode('0');
      } else {
        const count = countChars(value, '0');
        const divisor = digits - count;
        this.encoder.encode(String(divisor));
      }
    }
  }

  private encodeField(obj: any, inst: Field): void {
    this._encodeField(obj, inst.name, inst.choice);
  }

  // private encodeFieldMap(obj: any, inst: FieldMap): void {
  //   const curr = obj[inst.name] || {};
  //   const choice = inst.choice;
  //   for (const field of inst.fields) {
  //     this._encodeField(curr, field, choice);
  //   }
  // }

  private encodeObjectMap(obj: any, inst: ObjectMap): void {
    const curr = obj[inst.name] || {};
    for (const field of inst.fields) {
      this._encodeField(curr, field);
    }
  }

  private encodeOrigin(obj: any, inst: Origin): void {
    for (const i of inst.block) {
      this.encode(obj, i);
    }
  }

  private encodeScope(obj: any, inst: Scope): void {
    const curr = obj[inst.name] || {};
    for (const i of inst.block) {
      this.encode(curr, i);
    }
  }

  // private encodeScopeField(obj: any, inst: ScopeField): void {
  //   for (const field of inst.fields) {
  //     this.encoder.encode(obj[field]);
  //   }
  // }

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
    const o0 = obj[inst.name] || {};
    for (const k of inst.dim0.keys) {
      this.encoder.encode(o0[k]);
    }
  }

  private encodeVector2<T extends string, S extends string>(obj: any, inst: Vector2<T, S>): void {
    const o0 = obj[inst.name] || {};
    for (const k1 of inst.dim0.keys) {
      const o1 = o0[k1] || {};
      for (const k2 of inst.dim1.keys) {
        this.encoder.encode(o1[k2]);
      }
    }
  }
}
