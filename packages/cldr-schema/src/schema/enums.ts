export enum Plural {
  OTHER = 0,
  ZERO = 1,
  ONE = 2,
  TWO = 3,
  FEW = 4,
  MANY = 5,
}

export const PluralValues = 'other zero one two few many'.split(' ');

export enum Alt {
  NONE = 0,
  VARIANT = 1,
  SHORT = 2
}

export const AltValues = '|-variant|-short'.split('|');

export enum Yeartype {
  NONE = 0,
  LEAP = 1,
}

export const YeartypeValues = '|-leap'.split('|');
