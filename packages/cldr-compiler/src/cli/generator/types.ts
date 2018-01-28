
const DISABLE_LINT_MAX_LINE = '// tslint:disable-next-line:max-line-length\n';

export interface ValueType {
  render(): string;
}

export class Entry {
  constructor(
    readonly path: string[],
    readonly values: ValueType[]) {}
}

export class TypedValue implements ValueType {
  constructor(
    readonly name: string,
    readonly type: string,
    readonly obj: any,
    readonly overlong: boolean = false) {}

  render(): string {
    const data = JSON.stringify(this.obj, undefined, 2);
    const header = this.overlong ? '/* tslint:disable */\n' : '';
    return header + `export const ${this.name}: ${this.type} = ${data};`;
  }
}

const ENUM_UNSAFE = /[^a-z-]+/ig;
const DASH = /-/g;
const PLURAL_FIELD = /^.+-count-(\w+)$/;

/**
 * Generates enum definitions for large sets of field values.
 */
export class FieldEnumValue implements ValueType {
  constructor(
    readonly name: string,
    readonly fields: string[]) { }

  render(): string {
    // Detect and unify plurals.
    const fields = this.fields.filter(f => {
      const m = f.match(PLURAL_FIELD);
      return m === null ? true : m[1] === 'zero';
    });

    // Strip the plural category for values used by the enum and type.
    const typeValues = fields.map(f => {
      const i = f.indexOf('-count-');
      return i === -1 ? f : f.substring(0, i);
    });

    // Create the enum definition
    let enumBody = '';
    typeValues.forEach(f => {
      const name = f.replace(ENUM_UNSAFE, '')
        .replace('-alt-variant', '-ALT')
        .replace(DASH, '_');
      enumBody += `\n  ${name} = '${f}',`;
    });

    let result = `export enum ${this.name} { ${enumBody} }\n\n`;
    result += DISABLE_LINT_MAX_LINE;
    result += `export const ${this.name}Values = '${fields.join(' ')}'.split(' ');\n`;
    return result;
  }
}

const ID_ENUM_UNSAFE = /[^a-z\d\/_-]+/ig;
const ID_DASH = /[\/-]+/g;

/**
 * Generates enum definitions for identifiers.
 */
export class IdEnumValue implements ValueType {
  constructor(
    readonly name: string,
    readonly fields: string[],
    readonly transform?: (v: string) => string) { }

  render(): string {
    // Values for identifiers are not modified.
    let enumBody = '';
    this.fields.forEach(f => {
      const tmp = f.replace(ID_ENUM_UNSAFE, '').replace(ID_DASH, '_');
      const name = this.transform === undefined ? tmp : this.transform(tmp);
      enumBody += `\n  ${name} = '${f}',`;
    });

    let result = `export enum ${this.name} { ${enumBody} }\n\n`;
    result += DISABLE_LINT_MAX_LINE;
    result += `export const ${this.name}Values = '${this.fields.join(' ')}'.split(' ');\n`;
    return result;
  }
}
