
import { pluralDigit } from '../utils';

const plurals = ['other', 'zero', 'one', 'two', 'few', 'many'];
const alts = ['none', 'short', 'variant', 'narrow', 'stand-alone'];

/**
 * Map a plural key and transform it.
 */
export interface PluralSpec {
  readonly kind: 'plural';
  readonly keys: [string, string, string][];
}

/**
 * Map an alt key and transform it.
 */
export interface AltSpec {
  readonly kind: 'alt';
  readonly keys: [string, string, string][];
}

/**
 * Generate tuple of keys for plural and alt.
 */
export const categoryKeys =
  (sep: string, categories: string[], field: string, replace?: string): [string, string, string][] => {
  const keys: [string, string, string][] = [];
  for (const c of categories) {
    const key = c !== 'none' ? `${field}-${sep}-${c}` : field;
    const rkey = replace || field;
    keys.push([key, rkey, c]);
  }
  return keys;
};

export const pluralKeys = (field: string, replace?: string): [string, string, string][] =>
  categoryKeys('count', plurals, field, replace);

export const altKeys = (field: string, replace?: string): [string, string, string][] =>
  categoryKeys('alt', alts, field, replace);

export const stripPlural = (k: string) => {
  const i = k.indexOf('-count-');
  return i === -1 ? k : k.substring(0, i);
};

/**
 * Pluralized digits formats.
 */
export interface DigitsSpec {
  readonly kind: 'digits';
}

/**
 * Map all keys at the current level.
 */
export interface KeysSpec {
  readonly kind: 'keys';
}

/**
 * Map all keys at the current level, splitting off the alt category if any.
 */
export interface AltKeysSpec {
  readonly kind: 'altkeys';
}

/**
 * Map all keys at the current level, splitting off the plural category if any.
 */
export interface PluralKeysSpec {
  readonly kind: 'pluralkeys';
}

export interface PointSpec {
  readonly kind: 'point';
  name: string;
}

/**
 * Map a single field.
 */
export interface FieldSpec {
  kind: 'field';
  field: string;
  replace?: string;
}

/**
 * Map multiple fields with optional renaming.
 */
export interface FieldsSpec {
  kind: 'fields';
  fields: (string | [string, string])[];
}

export type Spec = DigitsSpec | PluralSpec | AltSpec | KeysSpec | AltKeysSpec |
  FieldSpec | FieldsSpec | PluralKeysSpec | PointSpec;

/**
 * Apply the field mapping specs to the object, converting hierarchy of keys
 * into tabular form.  For example, it can transform the following structure:
 *
 *   { USD: { displayName-count-one: { "US Dollar" }}}
 *
 * Into this:
 *
 *   [ 'USD', 'displayName', 'one', 'US Dollar' ]
 *
 */
const tabular = (specs: Spec[], obj: any): string[][] => {
  const res: string[][] = [];
  const spec = specs[0];
  if (spec === undefined || obj === undefined) {
    return res;
  }

  const rest = specs.slice(1);
  switch (spec.kind) {
    case 'digits':
    {
      for (let i = 1; i <= 15; i++) {
        const base = pluralDigit(i);
        for (const c of plurals) {
          const key = `${base}-count-${c}`;
          const pfx = [`${base.length}`, c];
          const v = obj[key];
          if (typeof v === undefined) {
            res.push(pfx);
          } else if (typeof v === 'string') {
            res.push(pfx.concat([v]));
          }
        }
      }
      break;
    }

    case 'plural':
    case 'alt':
    {
      for (const keys of spec.keys) {
        const [key, rkey, c] = keys;
        const v = obj[key];
        const pfx = [rkey, c];
        if (typeof v === undefined) {
          res.push(pfx);
        } else if (typeof v === 'string') {
          res.push(pfx.concat([v]));
        } else {
          for (const row of tabular(rest, v)) {
            res.push(pfx.concat(row));
          }
        }
      }
      break;
    }

    case 'field':
    {
      const rkey = spec.replace || spec.field;
      const key = spec.field;
      const v = obj[key];
      const pfx = [rkey];
      if (typeof v === undefined) {
        res.push(pfx);
      } else if (typeof v === 'string') {
        res.push(pfx.concat([v]));
      } else {
        for (const row of tabular(rest, v)) {
          res.push(pfx.concat(row));
        }
      }
      break;
    }

    case 'fields':
    {
      let key: string;
      let rkey: string;
      for (const field of spec.fields) {
        if (Array.isArray(field)) {
          [key, rkey] = field;
        } else {
          key = field;
          rkey = field;
        }
        const v = obj[key];
        const pfx = [rkey];
        if (typeof v === undefined) {
          res.push(pfx);
        } else if (typeof v === 'string') {
          res.push(pfx.concat([v]));
        } else {
          for (const row of tabular(rest, v)) {
            res.push(pfx.concat(row));
          }
        }
      }
      break;
    }

    case 'point':
    {
      const pfx = [spec.name];
      if (rest.length === 0) {
        res.push(pfx);
      } else {
        for (const row of tabular(rest, obj)) {
          res.push(pfx.concat(row));
        }
      }
      break;
    }

    case 'keys':
    {
      for (const key of Object.keys(obj)) {
        const pfx = [key];
        const v = obj[key];
        if (typeof v === undefined) {
          res.push(pfx);
        } else if (typeof v === 'string') {
          res.push(pfx.concat([v]));
        } else {
          for (const row of tabular(rest, v)) {
            res.push(pfx.concat(row));
          }
        }
      }
      break;
    }

    case 'altkeys':
    {
      const orig = Object.keys(obj).filter(k => k.indexOf('-alt-') === -1);
      for (const raw of orig) {
        for (const keys of altKeys(raw)) {
          const [key, rkey, c] = keys;
          const v = obj[key];
          const pfx = [rkey, c];
          if (typeof v === undefined) {
            res.push(pfx);
          } else if (typeof v === 'string') {
            res.push(pfx.concat([v]));
          } else {
            for (const row of tabular(rest, v)) {
              res.push(pfx.concat(row));
            }
          }
        }
      }
      break;
    }

    case 'pluralkeys':
    {
      const orig = Object.keys(obj);

      const normal = orig.filter(k => k.indexOf('-count-') === -1);
      for (const key of normal) {
        const v = obj[key];
        const pfx = [key, 'other'];
        if (typeof v === undefined) {
          res.push(pfx);
        } else if (typeof v === 'string') {
          res.push(pfx.concat([v]));
        } else {
          for (const row of tabular(rest, v)) {
            res.push(pfx.concat(row));
          }
        }
      }

      const plural = orig.filter(k => k.indexOf('-count-') !== -1).map(stripPlural);
      for (const raw of plural) {
        for (const keys of pluralKeys(raw)) {
          const [key, rkey, c] = keys;
          const v = obj[key];
          const pfx = [rkey, c];
          if (typeof v === undefined) {
            res.push(pfx);
          } else if (typeof v === 'string') {
            res.push(pfx.concat([v]));
          } else {
            for (const row of tabular(rest, v)) {
              res.push(pfx.concat(row));
            }
          }
        }
      }
      break;
    }
  }

  return res;
};

/**
 * Specifies a mapping of keys into tabular form, along with a remapping
 * index which changes the ordering of keys.
 */
export interface Mapping {
  specs: Spec[];
  remap: number[];
}

/**
 * Constructs a mapping in a fluent style.
 */
export class MappingBuilder {
  readonly specs: Spec[] = [];

  digits(): this {
    this.specs.push({ kind: 'digits' });
    return this;
  }

  keys(): this {
    this.specs.push({ kind: 'keys' });
    return this;
  }

  field(field: string, replace?: string): this {
    this.specs.push({ kind: 'field', field, replace });
    return this;
  }

  fields(fields: (string | [string, string])[]): this {
    this.specs.push({ kind: 'fields', fields });
    return this;
  }

  plural(field: string, replace?: string): this {
    this.specs.push({ kind: 'plural', keys: pluralKeys(field, replace) });
    return this;
  }

  pluralKeys(): this {
    this.specs.push({ kind: 'pluralkeys' });
    return this;
  }

  point(name: string): this {
    this.specs.push({ kind: 'point', name });
    return this;
  }

  alt(field: string, replace?: string): this {
    this.specs.push({ kind: 'alt', keys: altKeys(field, replace) });
    return this;
  }

  altKeys(): this {
    this.specs.push({ kind: 'altkeys' });
    return this;
  }

  remap(...indices: number[]): Mapping {
    return { specs: this.specs, remap: indices };
  }
}

/**
 * Entry points to Mapping builder.
 */
export class Mappings {

  static digits(): MappingBuilder {
    return new MappingBuilder().digits();
  }

  static keys(): MappingBuilder {
    return new MappingBuilder().keys();
  }

  static field(field: string, replace?: string): MappingBuilder {
    return new MappingBuilder().field(field, replace);
  }

  static fields(fields: (string | [string, string])[]): MappingBuilder {
    return new MappingBuilder().fields(fields);
  }

  static plural(field: string, replace?: string): MappingBuilder {
    return new MappingBuilder().plural(field, replace);
  }

  static pluralKeys(): MappingBuilder {
    return new MappingBuilder().pluralKeys();
  }

  static point(name: string): MappingBuilder {
    return new MappingBuilder().point(name);
  }

  static alt(field: string, replace?: string): MappingBuilder {
    return new MappingBuilder().alt(field, replace);
  }

  static altKeys(): MappingBuilder {
    return new MappingBuilder().altKeys();
  }
}

/**
 * Converts tabular form back into a tree.
 *
 * For example:
 *
 *  [key0, key1, key2, value]
 *
 * Becomes:
 *
 *  { key0: { key1: { key2: value } } }
 */
export const rewire = (res: any, path: string[]): void => {
  let curr: any = res;
  let i = 0;
  const len = path.length;

  // Last 2 components of path are ["key", "value"]
  while (i < len - 2) {
    const p = path[i];
    const o = curr[p] || {};
    curr[p] = o;
    curr = o;
    i++;
  }

  const key = path[i];
  curr[key] = path[i + 1];
};

/**
 * Apply a series of mappings to an object and return the transformed object.
 * Each mapping will convert an object into tabular form, reposition the
 * keys, then convert back to a tree.
 */
export const applyMappings = (root: any, mappings: Mapping[], debug = false): any => {
  const result: any = {};
  for (const m of mappings) {
    for (let row of tabular(m.specs, root)) {
      if (debug) {
        console.log('I>', JSON.stringify(row));
      }
      row = m.remap.map(i => row[i]);
      if (debug) {
        console.log('O>', JSON.stringify(row));
      }
      rewire(result, row);
    }
  }
  return result;
};
