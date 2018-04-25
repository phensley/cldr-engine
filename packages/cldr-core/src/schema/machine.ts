import {
  Digits,
  DigitsArrow,
  Field,
  FieldArrow,
  Instruction,
  Origin,
  Schema,
  Scope,
  ScopeArrow,
  ScopeMap,

  Vector1,
  Vector2,
  Vector1Arrow,
  Vector2Arrow,

  ORIGIN,
} from '@phensley/cldr-schema';

import { Decimal } from '../types';
import { leftPad } from '../utils/string';

/**
 * Generates field offsets for the schema builder.
 */
class Generator {

  private offset: number = 0;

  field(): number {
    return this.offset++;
  }

  vector1(dim: number): number {
    const off = this.offset;
    this.offset += dim;
    return off;
  }

  vector2(dim1: number, dim2: number): number {
    const off = this.offset;
    this.offset += (dim1 * dim2);
    return off;
  }
}

const time = (n: [number, number]) =>
  new Decimal(n[0]).add(new Decimal(n[1]).movePoint(-9));

const elapsed = (start: [number, number], end: [number, number]): string =>
  time(end).subtract(time(start)).movePoint(6).toString();

/**
 * Builds the schema accessor singleton.
 */
export class SchemaBuilder {

  private generator: Generator = new Generator();
  private captureTimes: boolean;
  private _times: [string, string][] = [];

  constructor(debug: boolean = false) {
    this.captureTimes = debug && process !== undefined && process.hrtime !== undefined;
  }

  construct(obj: any, inst: Instruction): void {
    switch (inst.type) {
      case 'digits':
        this.constructDigits(obj, inst);
        break;
      case 'field':
        this.constructField(obj, inst);
        break;
      case 'origin':
        this.constructOrigin(obj, inst);
        break;
      case 'scope':
        this.constructScope(obj, inst);
        break;
      case 'scopemap':
        this.constructScopeMap(obj, inst);
        break;
      case 'vector1':
        this.constructVector1(obj, inst);
        break;
      case 'vector2':
        this.constructVector2(obj, inst);
        break;
    }
  }

  private constructDigits<T extends string>(obj: any, inst: Digits<T>): void {
    const offset = this.generator.vector2(inst.dim0.size, inst.values.length * 2);
    obj[inst.name] = new DigitsArrow(offset, inst.dim0, inst.values);
  }

  private constructField(obj: any, inst: Field): void {
    const offset = this.generator.field();
    obj[inst.name] = new FieldArrow(offset);
  }

  private constructOrigin(obj: any, inst: Origin): void {
    const capture = this.captureTimes;
    for (const i of inst.block) {
      const start: [number, number] = capture ? process.hrtime() : [0, 0];
      this.construct(obj, i);
      const end: [number, number] = capture ? process.hrtime() : [0, 0];
      if (capture) {
        this._times.push([i.identifier, elapsed(start, end)]);
      }
    }
    if (capture) {
      console.log('Scope construct times (microseconds):');
      for (const t of this._times) {
        console.log(leftPad(t[0], 20), t[1]);
      }
    }
  }

  private constructScope(obj: any, inst: Scope): void {
    const curr: any = {};
    obj[inst.identifier] = curr;
    for (const i of inst.block) {
      this.construct(curr, i);
    }
  }

  private constructScopeMap(obj: any, inst: ScopeMap): void {
    const map: any = {};
    for (const field of inst.fields) {
      const child: any = {};
      for (const i of inst.block) {
        this.construct(child, i);
      }
      map[field] = child;
    }

    const undef: any = {};
    for (const i of inst.block) {
      this.construct(undef, i);
    }
    obj[inst.name] = new ScopeArrow(map, undef);
  }

  private constructVector1<T extends string>(obj: any, inst: Vector1<T>): void {
    const offset = this.generator.field(); // header
    this.generator.vector1(inst.dim0.size);
    obj[inst.name] = new Vector1Arrow(offset, inst.dim0);
  }

  private constructVector2<T extends string, S extends string>(obj: any, inst: Vector2<T, S>): void {
    const offset = this.generator.field(); // header
    this.generator.vector2(inst.dim0.size, inst.dim1.size);
    obj[inst.name] = new Vector2Arrow(offset, inst.dim0, inst.dim1);
  }
}

let SCHEMA: Schema;

export const buildSchema = (debug: boolean = false): Schema => {
  if (SCHEMA === undefined) {
    const builder = new SchemaBuilder(debug);
    SCHEMA = ({} as any) as Schema;
    builder.construct(SCHEMA, ORIGIN);
  }
  return SCHEMA;
};
