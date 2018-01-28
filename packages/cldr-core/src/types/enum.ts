export const makeEnum = <T extends string>(o: Array<T>): [ {[K in T]: K}, T[] ] => {
  /* tslint:disable-next-line */
  const _enum: {[K in T]: K} = Object.create(null);
  const values: T[] = [];
  o.reduce((res, key) => {
    res[key] = key;
    values.push(key);
    return res;
  }, _enum);
  return [_enum, values];
};

type KeyedEnumSpec<T extends string, Q extends string> = [T, Q];

export const makeKeyedEnum = <T extends string, V extends string>(o: Array<KeyedEnumSpec<T, V>>):
    [ {[K in T]: V}, V[]] => {
  /* tslint:disable-next-line */
  const _enum: {[K in T]: V} = Object.create(null);
  const values: V[] = [];
  o.reduce((res, spec) => {
    const [ k, v ] = spec;
    res[k] = v;
    values.push(v);
    return res;
  }, _enum);
  return [_enum, values];
};
