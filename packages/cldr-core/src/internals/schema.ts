import { KeyIndex, Schema } from '@phensley/cldr-types';
import {
  Digits,
  DigitsArrowImpl,
  Field,
  FieldArrowImpl,
  Instruction,
  Origin,
  Scope,
  ScopeArrowImpl,
  ScopeMap,
  Vector,
  VectorArrowImpl,
} from '../schema';
import { Decimal } from '@phensley/decimal';
import { leftPad } from '../utils/string';

/**
 * Generates field offsets for the schema builder.
 */
class Generator {
  private offset: number = 0;

  field(): number {
    return this.offset++;
  }

  vector(dims: KeyIndex<string>[]): number {
    const off = this.offset;
    this.offset += dims.reduce((p, c) => c.size * p, 1);
    return off;
  }

  digits(dim1: number, dim2: number): number {
    const off = this.offset;
    this.offset += dim1 * dim2;
    return off;
  }
}

const time = (n: [number, number]): Decimal => new Decimal(n[0]).add(new Decimal(n[1]).movePoint(-9));

const elapsed = (start: [number, number], end: [number, number]): string =>
  time(end).subtract(time(start)).movePoint(6).toString();

/**
 * Builds the schema accessor singleton.
 *
 * @internal
 */
export class SchemaBuilder {
  private generator: Generator = new Generator();
  private captureTimes: boolean;
  private _times: [string, string][] = [];
  private origin!: Origin;

  constructor(debug: boolean) {
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
      case 'vector':
        this.constructVector(obj, inst);
        break;
    }
  }

  private constructDigits(obj: any, inst: Digits): void {
    const dim0 = this.origin.getIndex(inst.dim0);
    const offset = this.generator.digits(dim0.size, inst.values.length * 2);
    obj[inst.name] = new DigitsArrowImpl(offset, dim0, inst.values);
  }

  private constructField(obj: any, inst: Field): void {
    const offset = this.generator.field();
    obj[inst.name] = new FieldArrowImpl(offset);
  }

  private constructOrigin(obj: any, inst: Origin): void {
    this.origin = inst;

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
    const fields = this.origin.getValues(inst.fields);
    const map: any = {};
    for (const field of fields) {
      const child: any = {};
      for (const i of inst.block) {
        this.construct(child, i);
      }
      map[field] = child;
    }
    obj[inst.name] = new ScopeArrowImpl(map);
  }

  private constructVector(obj: any, inst: Vector): void {
    const dims = inst.dims.map((k) => this.origin.getIndex(k));
    const offset = this.generator.field(); // header
    this.generator.vector(dims);
    obj[inst.name] = new VectorArrowImpl(offset, dims);
  }
}

/**
 * @internal
 */
export const buildSchema = (origin: Origin, debug: boolean): Schema => {
  const builder = new SchemaBuilder(debug);
  const schema = ({} as any) as Schema;
  builder.construct(schema, origin);
  return schema;
};
