import {
  digitsArrow,
  divisorArrow,
  fieldArrow,
  fieldIndexedArrow,
  fieldMapArrow,
  fieldMapIndexedArrow,
  objectMapArrow,
  scopeArrow,
  vector1Arrow,
  vector2Arrow,

  AltValues,
  PluralValues,
  YeartypeValues,

  Choice,
  Digits,
  Field,
  FieldArrow,
  FieldIndexedArrow,
  FieldMap,
  FieldMapArrow,
  FieldMapIndexedArrow,
  Instruction,
  KeyIndexMap,
  ObjectMap,
  OffsetMap,
  OffsetsMap,
  Origin,
  Schema,
  Scope,
  ScopeField,
  ScopeMap,

  Vector1,
  Vector2,
  Vector1Arrow,
  Vector2Arrow,

  ORIGIN,
} from '@phensley/cldr-schema';

import { Decimal } from '../types';

/**
 * Generates field offsets for the schema builder.
 */
class Generator {

  private offset: number = 0;

  field(): number {
    return this.offset++;
  }

  choiceField(choice: Choice): number[] {
    switch (choice) {
    case Choice.ALT:
      return this._field(AltValues);
    case Choice.PLURAL:
      return this._field(PluralValues);
    case Choice.YEARTYPE:
      return this._field(YeartypeValues);
    default:
      return [];
    }
  }

  pluralDigits(): number[][] {
    const res: number[][] = [];
    for (let i = 1; i <= 15; i++) {
      res.push(this._field(PluralValues));
    }
    return res;
  }

  divisorDigits(): number[] {
    const res: number[] = [];
    for (let i = 1; i <= 15; i++) {
      res.push(this.offset++);
    }
    return res;
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

  private _field(fields: any[]): number[] {
    const res: number[] = [];
    for (let i = 0; i < fields.length; i++) {
      res.push(this.offset++);
    }
    return res;
  }
}

// const time = (n: [number, number]) =>
//   new Decimal(n[0]).add(new Decimal(n[1]).movePoint(-9));

// const elapsed = (start: [number, number]): string => {
//   const end = process.hrtime();
//   return time(end).subtract(time(start)).movePoint(6).toString();
// };

// Capture construction times for top-level scopes.
// const times: [string, string][] = [];
// export const dumpTimes = () => {
//   for (const t of times) {
//     console.log(t[1], t[0]);
//   }
// };

/**
 * Builds the schema accessor singleton.
 */
export class SchemaBuilder {

  private generator: Generator = new Generator();

  construct(obj: any, inst: Instruction): void {
    switch (inst.type) {
      case 'digits':
        this.constructDigits(obj, inst);
        break;
      case 'field':
        this.constructField(obj, inst);
        break;
      case 'fieldmap':
        this.constructFieldMap(obj, inst);
        break;
      case 'objectmap':
        this.constructObjectMap(obj, inst);
        break;
      case 'origin':
        this.constructOrigin(obj, inst);
        break;
      case 'scope':
      {
        // const s = process.hrtime();
        this.constructScope(obj, inst);

        // const cp = inst.identifier.charCodeAt(0);
        // if (cp >= 0x41 && cp <= 0x5a) {
        //   const e = elapsed(s);
        //   times.push([inst.identifier, e]);
        // }

        break;
      }
      case 'scopefield':
        this.constructScopeField(obj, inst);
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

  private constructDigits(obj: any, inst: Digits): void {
    const offsets = this.generator.pluralDigits();
    obj[inst.name] = digitsArrow(offsets);
    const divisorName = `${inst.name}Divisor`;
    obj[divisorName] = divisorArrow(this.generator.divisorDigits());
  }

  private constructField(obj: any, inst: Field): void {
    const choice = inst.choice;
    if (choice === Choice.NONE) {
      const offset = this.generator.field();
      obj[inst.identifier] = fieldArrow(offset);
    } else {
      const offsets = this.generator.choiceField(choice);
      obj[inst.identifier] = fieldIndexedArrow(offsets);
    }
  }

  private constructFieldMap(obj: any, inst: FieldMap): void {
    const choice = inst.choice;
    if (choice === Choice.NONE) {
      const map: OffsetMap = {};
      for (const field of inst.fields) {
        map[field] = this.generator.field();
      }
      obj[inst.identifier] = fieldMapArrow(map);
    } else {
     const map: OffsetsMap = {};
      for (const field of inst.fields) {
        map[field] = this.generator.choiceField(choice);
      }
      obj[inst.identifier] = fieldMapIndexedArrow(map);
    }
  }

  private constructObjectMap(obj: any, inst: ObjectMap): void {
    const index: KeyIndexMap = [];
    for (const field of inst.fields) {
      index.push([field, this.generator.field()]);
    }
    obj[inst.name] = objectMapArrow(index);
  }

  private constructOrigin(obj: any, inst: Origin): void {
    for (const i of inst.block) {
      this.construct(obj, i);
    }
  }

  private constructScope(obj: any, inst: Scope): void {
    const curr: any = {};
    obj[inst.identifier] = curr;
    for (const i of inst.block) {
      this.construct(curr, i);
    }
  }

  private constructScopeField(obj: any, inst: ScopeField): void {
    const map: any = {};
    for (const field of inst.fields) {
      const offset = this.generator.field();
      map[field] = [offset];
    }
    obj[inst.name] = fieldMapArrow(map);
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
    obj[inst.name] = scopeArrow(map, undef);
  }

  private constructVector1<T extends string>(obj: any, inst: Vector1<T>): void {
    const offset = this.generator.vector1(inst.dim0.size);
    obj[inst.name] = new Vector1Arrow(offset, inst.dim0);
  }

  private constructVector2<T extends string, S extends string>(obj: any, inst: Vector2<T, S>): void {
    const offset = this.generator.vector2(inst.dim0.size, inst.dim1.size);
    obj[inst.name] = new Vector2Arrow(offset, inst.dim0, inst.dim1);
  }
}

let SCHEMA: Schema;

export const buildSchema = (): Schema => {
  if (SCHEMA === undefined) {
    const builder = new SchemaBuilder();
    SCHEMA = ({} as any) as Schema;
    builder.construct(SCHEMA, ORIGIN);
  }
  return SCHEMA;
};
