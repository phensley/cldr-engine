/*
 * Builders for runtime enumerated values. Main advantage is reduction
 * of source code size for creating enums with multiple views.
 */

export const makeEnum = <T extends string>(specs: Array<T>): [ {[K in T]: K}, T[], {[K in T]: number} ] => {
  /* tslint:disable-next-line */
  const _enum: {[K in T]: K} = Object.create(null);
  /* tslint:disable-next-line */
  const index: {[K in T]: number} = Object.create(null);
  const values: T[] = [];
  const len = specs.length;
  for (let i = 0; i < len; i++) {
    const k = specs[i];
    _enum[k] = k;
    index[k] = i;
    values.push(k);
  }
  Object.freeze(_enum);
  Object.freeze(values);
  Object.freeze(index);
  return [_enum, values, index];
};

type KeyedEnumSpec<T extends string, V extends string> = [T, V];

export const makeKeyedEnum = <T extends string, V extends string>(specs: Array<KeyedEnumSpec<T, V>>):
    [ {[K in T]: V}, V[] /*, {[K in T]: number} */] => {
  /* tslint:disable-next-line */
  const _enum: {[K in T]: V} = Object.create(null);
  /* tslint:disable-next-line */
  // const index: {[K in T]: number} = Object.create(null);
  const values: V[] = [];
  const len = specs.length;
  for (let i = 0; i < len; i++) {
    const [k, v] = specs[i];
    _enum[k] = v;
    // index[k] = i;
    values.push(v);
  }
  // return [_enum, values, index];
  Object.freeze(_enum);
  Object.freeze(values);
  return [_enum, values];
};

type UnitEnumSpec<A extends string, B extends string, C extends string> = [A, B, C];

export const makeUnitEnum =
  <C extends string, U extends string, R extends string>
  (specs: Array<UnitEnumSpec<C, U, R>>): [ {[K in U]: R}, R[], string[]] => {

  /* tslint:disable-next-line */
  const _enum: {[K in U]: R} = Object.create(null);
  const values: R[] = [];
  const fields: string[] = [];
  const len = specs.length;
  for (let i = 0; i < len; i++) {
    const [c, u, r] = specs[i];
    _enum[u] = r;
    values.push(r);
    fields.push(`${c}-${r}`);
  }
  Object.freeze(_enum);
  Object.freeze(values);
  Object.freeze(fields);
  return [_enum, values, fields];
};
