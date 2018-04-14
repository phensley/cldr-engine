const plurals = ['other', 'zero', 'one', 'two', 'few', 'many'];
const alts = ['none', 'short', 'variant', 'narrow'];

/**
 * Map a plural key and transform it.
 */
export interface PluralSpec {
  readonly kind: 'plural';
  readonly keys: [string, string, string][];
}

/**
 * Plural spec constructor.
 */
export const pluralSpec = (keys: [string, string, string][]): PluralSpec =>
  ({ kind: 'plural', keys });

/**
 * Map an alt key and transform it.
 */
export interface AltSpec {
  readonly kind: 'alt';
  readonly keys: [string, string, string][];
}

/**
 * Alt spec constructor
 */
export const altSpec = (keys: [string, string, string][]): AltSpec =>
  ({ kind: 'alt', keys });

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

/**
 * Map all keys at the current level.
 */
export interface KeysSpec {
  readonly kind: 'keys';
}

/**
 * Map a single field.
 */
export interface FieldSpec {
  kind: 'field';
  field: string;
  replace?: string;
}

export type Spec = PluralSpec | AltSpec | KeysSpec | FieldSpec;

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
  if (spec === undefined) {
    return res;
  }

  const rest = specs.slice(1);
  switch (spec.kind) {
    case 'plural':
    case 'alt':
    {
      for (const keys of spec.keys) {
        const [key, rkey, c] = keys;
        const v = obj[key];
        const pfx = [rkey, c];
        if (typeof v === 'string') {
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
      if (typeof v === 'string') {
        res.push(pfx.concat([v]));
      } else {
        for (const row of tabular(rest, v)) {
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
        if (typeof v === 'string') {
          res.push(pfx.concat([v]));
        } else {
          for (const row of tabular(rest, v)) {
            res.push(pfx.concat(row));
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

  keys(): this {
    this.specs.push({ kind: 'keys' });
    return this;
  }

  field(field: string, replace?: string): this {
    this.specs.push({ kind: 'field', field, replace });
    return this;
  }

  plural(field: string, replace?: string): this {
    this.specs.push({ kind: 'plural', keys: pluralKeys(field, replace) });
    return this;
  }

  alt(field: string, replace?: string): this {
    this.specs.push({ kind: 'alt', keys: altKeys(field, replace) });
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

  static keys(): MappingBuilder {
    return new MappingBuilder().keys();
  }

  static field(field: string, replace?: string): MappingBuilder {
    return new MappingBuilder().field(field, replace);
  }

  static plural(field: string, replace?: string): MappingBuilder {
    return new MappingBuilder().plural(field, replace);
  }

  static alt(field: string, replace?: string): MappingBuilder {
    return new MappingBuilder().alt(field, replace);
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
export const applyMappings = (root: any, mappings: Mapping[]): any => {
  const result: any = {};
  for (const m of mappings) {
    for (let row of tabular(m.specs, root)) {
      row = m.remap.map(i => row[i]);
      // console.log('>', JSON.stringify(row));
      rewire(result, row);
    }
  }
  return result;
};
