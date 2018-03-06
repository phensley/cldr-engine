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

export const getRoundingMode = (mode: string | undefined, alt: string): RoundingMode => {
  switch (mode === undefined ? alt : mode) {
  case 'up':
    return RoundingMode.UP;
  case 'down':
    return RoundingMode.DOWN;
  case 'ceiling':
    return RoundingMode.CEILING;
  case 'floor':
    return RoundingMode.FLOOR;
  case 'half-up':
    return RoundingMode.HALF_UP;
  case 'half-down':
    return RoundingMode.HALF_DOWN;
  case '05up':
    return RoundingMode.ZERO_FIVE_UP;
  case 'truncate':
    return RoundingMode.TRUNCATE;
  case 'half-even':
  default:
    return RoundingMode.HALF_EVEN;
  }
};

export interface MathContext {
  precision: number;
  rounding?: string | RoundingMode;
}

export const enum Constants {
  // 10^7 < sqrt(Number.MAX_SAFE_INTEGER)
  RADIX = 1e7,
  RDIGITS = 7,

  P0 = 1,
  P1 = 10,
  P2 = 100,
  P3 = 1000,
  P4 = 10000,
  P5 = 100000,
  P6 = 1000000,
  P7 = 10000000,
  P8 = 100000000
}

export const POWERS10 = [
  Constants.P0,
  Constants.P1,
  Constants.P2,
  Constants.P3,
  Constants.P4,
  Constants.P5,
  Constants.P6,
  Constants.P7,
  Constants.P8
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