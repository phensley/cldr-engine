// Date field types
export const enum Field {
  ERA = 0,
  YEAR = 1,
  QUARTER = 2,
  MONTH = 3,
  WEEK_OF_YEAR = 4,
  WEEK_OF_MONTH = 5,
  WEEKDAY = 6,
  DAY = 7,
  DAY_OF_YEAR = 8,
  DAY_OF_WEEK_IN_MONTH = 9,
  DAYPERIOD = 10,
  HOUR = 11,
  MINUTE = 12,
  SECOND = 13,
  FRACTIONAL_SECOND = 14,
  ZONE = 15,

  MAX_TYPE = 16
}

export const skeletonFields = (): number[] =>
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const enum C {
  DELTA = 0x10,
  NUMERIC = 0x100,
  NONE = 0,
  NARROW = -0x101,
  SHORTER = -0x102,
  SHORT = -0x103,
  LONG = -0x104,
  EXTRA_FIELD = 0x10000,
  MISSING_FIELD = 0x1000,
}

// Use single letter variables in FIELD_TYPES for compactness
const D = C.DELTA;
const N = C.NUMERIC;
// const E = C.NONE;
const R = C.NARROW;
const S = C.SHORTER;
const T = C.SHORT;
const L = C.LONG;

export const EXTRA_FIELD = C.EXTRA_FIELD;
export const MISSING_FIELD = C.MISSING_FIELD;

export type FieldType = [
  string, // 0 pattern character
  number, // 1 field
  number, // 2 sub field
  number, // 3 repeat
  number  // 4 width
];

export const FIELD_TYPES: FieldType[] = [
  ['G', Field.ERA, /* SHORT */ T, 1, 3],
  ['G', Field.ERA, /* LONG */ L, 4, 4],
  ['G', Field.ERA, /* NARROW */ R, 5, 5],

  ['y', Field.YEAR, /* NUMERIC */ N, 1, 20],
  ['Y', Field.YEAR, /* NUMERIC */ N + /* DELTA */ D, 1, 20],
  ['u', Field.YEAR, /* NUMERIC */ N + 2 * /* DELTA */ D, 1, 20],
  ['r', Field.YEAR, /* NUMERIC */ N + 3 * /* DELTA */ D, 1, 20],
  ['U', Field.YEAR, /* SHORT */ T, 1, 3],
  ['U', Field.YEAR, /* LONG */ L, 4, 4],
  ['U', Field.YEAR, /* NARROW */ R, 5, 5],

  ['Q', Field.QUARTER, /* NUMERIC */ N, 1, 2],
  ['Q', Field.QUARTER, /* SHORT */ T, 3, 3],
  ['Q', Field.QUARTER, /* LONG */ L, 4, 4],
  ['Q', Field.QUARTER, /* NARROW */ R, 5, 5],
  ['q', Field.QUARTER, /* NUMERIC */ N + /* DELTA */ D, 1, 2],
  ['q', Field.QUARTER, /* SHORT */ T - /* DELTA */ D, 3, 3],
  ['q', Field.QUARTER, /* LONG */ L - /* DELTA */ D, 4, 4],
  ['q', Field.QUARTER, /* NARROW */ R - /* DELTA */ D, 5, 5],

  ['M', Field.MONTH, /* NUMERIC */ N, 1, 2],
  ['M', Field.MONTH, /* SHORT */ T, 3, 3],
  ['M', Field.MONTH, /* LONG */ L, 4, 4],
  ['M', Field.MONTH, /* NARROW */ R, 5, 5],
  ['L', Field.MONTH, /* NUMERIC */ N + /* DELTA */ D, 1, 2],
  ['L', Field.MONTH, /* SHORT */ T - /* DELTA */ D, 3, 3],
  ['L', Field.MONTH, /* LONG */ L - /* DELTA */ D, 4, 4],
  ['L', Field.MONTH, /* NARROW */ R - /* DELTA */ D, 5, 5],
  ['l', Field.MONTH, /* NUMERIC */ N + /* DELTA */ D, 1, 1],

  ['w', Field.WEEK_OF_YEAR, /* NUMERIC */ N, 1, 2],

  ['W', Field.WEEK_OF_MONTH, /* NUMERIC */ N, 1, 1],

  ['E', Field.WEEKDAY, /* SHORT */ T, 1, 3],
  ['E', Field.WEEKDAY, /* LONG */ L, 4, 4],
  ['E', Field.WEEKDAY, /* NARROW */ R, 5, 5],
  ['E', Field.WEEKDAY, /* SHORTER */ S, 6, 6],
  ['c', Field.WEEKDAY, /* NUMERIC */ N + 2 * /* DELTA */ D, 1, 2],
  ['c', Field.WEEKDAY, /* SHORT */ T - 2 * /* DELTA */ D, 3, 3],
  ['c', Field.WEEKDAY, /* LONG */ L - 2 * /* DELTA */ D, 4, 4],
  ['c', Field.WEEKDAY, /* NARROW */ R - 2 * /* DELTA */ D, 5, 5],
  ['c', Field.WEEKDAY, /* SHORTER */ S - 2 * /* DELTA */ D, 6, 6],
  ['e', Field.WEEKDAY, /* NUMERIC */ N + /* DELTA */ D, 1, 2],
  ['e', Field.WEEKDAY, /* SHORT */ T - /* DELTA */ D, 3, 3],
  ['e', Field.WEEKDAY, /* LONG */ L - /* DELTA */ D, 4, 4],
  ['e', Field.WEEKDAY, /* NARROW */ R - /* DELTA */ D, 5, 5],
  ['e', Field.WEEKDAY, /* SHORTER */ S - /* DELTA */ D, 6, 6],

  ['d', Field.DAY, /* NUMERIC */ N, 1, 2],
  ['g', Field.DAY, /* NUMERIC */ N + /* DELTA */ D, 1, 20],

  ['D', Field.DAY_OF_YEAR, /* NUMERIC */ N, 1, 3],

  ['F', Field.DAY_OF_WEEK_IN_MONTH, /* NUMERIC */ N, 1, 1],

  ['a', Field.DAYPERIOD, /* SHORT */ T, 1, 3],
  ['a', Field.DAYPERIOD, /* LONG */ L, 4, 4],
  ['a', Field.DAYPERIOD, /* NARROW */ R, 5, 5],
  ['b', Field.DAYPERIOD, /* SHORT */ T - /* DELTA */ D, 1, 3],
  ['b', Field.DAYPERIOD, /* LONG */ L - /* DELTA */ D, 4, 4],
  ['b', Field.DAYPERIOD, /* NARROW */ R - /* DELTA */ D, 5, 5],
  ['B', Field.DAYPERIOD, /* SHORT */ T - 3 * /* DELTA */ D, 1, 3],
  ['B', Field.DAYPERIOD, /* LONG */ L - 3 * /* DELTA */ D, 4, 4],
  ['B', Field.DAYPERIOD, /* NARROW */ R - 3 * /* DELTA */ D, 5, 5],

  ['H', Field.HOUR, /* NUMERIC */ N + 10 * /* DELTA */ D, 1, 2], // 24 hour
  ['k', Field.HOUR, /* NUMERIC */ N + 11 * /* DELTA */ D, 1, 2],
  ['h', Field.HOUR, /* NUMERIC */ N, 1, 2], // 12 hour
  ['K', Field.HOUR, /* NUMERIC */ N + /* DELTA */ D, 1, 2],

  ['m', Field.MINUTE, /* NUMERIC */ N, 1, 2],

  ['s', Field.SECOND, /* NUMERIC */ N, 1, 2],
  ['A', Field.SECOND, /* NUMERIC */ N + /* DELTA */ D, 1, 1000],

  ['S', Field.FRACTIONAL_SECOND, /* NUMERIC */ N, 1, 1000],

  ['v', Field.ZONE, /* SHORT */ T - 2 * /* DELTA */ D, 1, 1],
  ['v', Field.ZONE, /* LONG */ L - 2 * /* DELTA */ D, 4, 4],
  ['z', Field.ZONE, /* SHORT */ T, 1, 3],
  ['z', Field.ZONE, /* LONG */ L, 4, 4],
  ['Z', Field.ZONE, /* NARROW */ R - /* DELTA */ D, 1, 3],
  ['Z', Field.ZONE, /* LONG */ L - /* DELTA */ D, 4, 4],
  ['Z', Field.ZONE, /* SHORT */ T - /* DELTA */ D, 5, 5],
  ['O', Field.ZONE, /* SHORT */ T - /* DELTA */ D, 1, 1],
  ['O', Field.ZONE, /* LONG */ L - /* DELTA */ D, 4, 4],
  ['V', Field.ZONE, /* SHORT */ T - /* DELTA */ D, 1, 1],
  ['V', Field.ZONE, /* LONG */ L - /* DELTA */ D, 2, 2],
  ['V', Field.ZONE, /* LONG */ L - 1 - /* DELTA */ D, 3, 3],
  ['V', Field.ZONE, /* LONG */ L - 2 - /* DELTA */ D, 4, 4],
  ['X', Field.ZONE, /* NARROW */ R - /* DELTA */ D, 1, 1],
  ['X', Field.ZONE, /* SHORT */ T - /* DELTA */ D, 2, 2],
  ['X', Field.ZONE, /* LONG */ L - /* DELTA */ D, 4, 4],
  ['x', Field.ZONE, /* NARROW */ R - /* DELTA */ D, 1, 1],
  ['x', Field.ZONE, /* SHORT */ T - /* DELTA */ D, 2, 2],
  ['x', Field.ZONE, /* LONG */ L - /* DELTA */ D, 4, 4],
];

/**
 * Faster lookup for field canonical indices.
 */
export const buildFieldIndex = (): Map<string, number[]> => {
  const res = new Map<string, number[]>();
  FIELD_TYPES.forEach((t, i) => {
    const entry = res.get(t[0]) || [];
    entry.push(i);
    res.set(t[0], entry);
  });
  return res;
};

export const FIELD_INDEX = buildFieldIndex();

export const getFieldType = (field: string, width: number): FieldType | undefined => {
  const indices = FIELD_INDEX.get(field);
  if (indices === undefined) {
    return;
  }

  let row: FieldType;
  let best = -1;
  for (const i of indices) {
    best = i;
    row = FIELD_TYPES[i];
    if (row[3] > width || row[4] < width) {
      continue;
    }
    return row;
  }

  return FIELD_TYPES[best];
};