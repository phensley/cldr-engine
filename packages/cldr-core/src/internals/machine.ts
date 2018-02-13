import {
  digitsArrow,
  fieldArrow,
  fieldIndexedArrow,
  fieldMapArrow,
  fieldMapIndexedArrow,
  scopeArrow,

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
  OffsetMap,
  OffsetsMap,
  Origin,
  Scope,
  ScopeField,
  ScopeMap,
} from '@phensley/cldr-schema';

const IDENTIFIER_UNSAFE = /[^a-z-]+/ig;
const IDENTIFIER_SEGMENT = /(-[a-z]+)/g;

/**
 * Convert a field / scope name into a call-safe identifier.
 */
export const identifier = (name: string) => {
  const raw = name.replace(IDENTIFIER_UNSAFE, '');
  return raw.replace(IDENTIFIER_SEGMENT, (x: string): string => {
    return x[1].toUpperCase() + x.substring(2).toLowerCase();
  });
};

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
    for (let i = 4; i <= 15; i++) {
      res.push(this._field(PluralValues));
    }
    return res;
  }

  private _field(fields: any[]): number[] {
    const res: number[] = [];
    for (let i = 0; i < fields.length; i++) {
      res.push(this.offset++);
    }
    return res;
  }
}

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
    case 'origin':
      this.constructOrigin(obj, inst);
      break;
    case 'scope':
      this.constructScope(obj, inst);
      break;
    case 'scopefield':
      this.constructScopeField(obj, inst);
      break;
    case 'scopemap':
      this.constructScopeMap(obj, inst);
    }
  }

  private constructDigits(obj: any, inst: Digits): void {
    const ident = identifier(inst.name);
    const offsets = this.generator.pluralDigits();
    obj[ident] = digitsArrow(offsets);
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
    const name = identifier(inst.name);
    const choice = inst.choice;
    if (choice === Choice.NONE) {
      const map: OffsetMap = {};
      for (const field of inst.fields) {
        map[field] = this.generator.field();
      }
      obj[name] = fieldMapArrow(map);
    } else {
     const map: OffsetsMap = {};
      for (const field of inst.fields) {
        map[field] = this.generator.choiceField(choice);
      }
      obj[name] = fieldMapIndexedArrow(map);
    }
  }

  private constructOrigin(obj: any, inst: Origin): void {
    for (const i of inst.block) {
      this.construct(obj, i);
    }
  }

  private constructScope(obj: any, inst: Scope): void {
    const name = identifier(inst.name);
    const curr: any = {};
    obj[name] = curr;
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

}
