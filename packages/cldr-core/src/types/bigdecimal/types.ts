export enum RoundingMode {
  UP,
  DOWN,
  CEILING,
  FLOOR,
  HALF_UP,
  HALF_DOWN,
  HALF_EVEN,
  ZERO_FIVE_UP,
  TRUNCATE
}

export class MathContext {
  constructor(
    readonly precision: number,
    readonly roundingMode: RoundingMode
  ) {}
}

// 10^7 < sqrt(Number.MAX_SAFE_INTEGER)
export const RADIX = 1e7;
export const RDIGITS = 7;

export const enum Power10 {
  E0 = 1,
  E1 = 10,
  E2 = 100,
  E3 = 1000,
  E4 = 10000,
  E5 = 100000,
  E6 = 1000000,
  E7 = 10000000,
  E8 = 100000000
}

export const POWERS10 = [
  Power10.E0,
  Power10.E1,
  Power10.E2,
  Power10.E3,
  Power10.E4,
  Power10.E5,
  Power10.E6,
  Power10.E7,
  Power10.E8
];

export const enum ParseState {
  INITIAL = 0,
  INTEGER = 1,
  FRACTION = 2,
  EXPONENT = 3,
}

export const enum ParseFlags {
  SIGN = 1,
  POINT = 2,
  EXP = 4
}

export const enum Chars {
  PLUS = 0x2b,
  MINUS = 0x2d,
  DOT = 0x2e,
  DIGIT0 = 0x30,
  DIGIT1 = 0x31,
  DIGIT2 = 0x32,
  DIGIT3 = 0x33,
  DIGIT4 = 0x34,
  DIGIT5 = 0x35,
  DIGIT6 = 0x36,
  DIGIT7 = 0x37,
  DIGIT8 = 0x38,
  DIGIT9 = 0x39,
  ELOWER = 0x45,
  EUPPER = 0x65,
}