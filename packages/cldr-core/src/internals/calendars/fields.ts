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

// Inlined constants
export const enum C {
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

export type FieldType = [string, number, number, number, number];

export const FIELD_TYPES: FieldType[] = [
  ['G', Field.ERA, C.SHORT, 1, 3],
  ['G', Field.ERA, C.LONG, 4, 4],
  ['G', Field.ERA, C.NARROW, 5, 5],

  ['y', Field.YEAR, C.NUMERIC, 1, 20],
  ['Y', Field.YEAR, C.NUMERIC + C.DELTA, 1, 20],
  ['u', Field.YEAR, C.NUMERIC + 2 * C.DELTA, 1, 20],
  ['r', Field.YEAR, C.NUMERIC + 3 * C.DELTA, 1, 20],
  ['U', Field.YEAR, C.SHORT, 1, 3],
  ['U', Field.YEAR, C.LONG, 4, 4],
  ['U', Field.YEAR, C.NARROW, 5, 5],

  ['Q', Field.QUARTER, C.NUMERIC, 1, 2],
  ['Q', Field.QUARTER, C.SHORT, 3, 3],
  ['Q', Field.QUARTER, C.LONG, 4, 4],
  ['Q', Field.QUARTER, C.NARROW, 5, 5],
  ['q', Field.QUARTER, C.NUMERIC + C.DELTA, 1, 2],
  ['q', Field.QUARTER, C.SHORT - C.DELTA, 3, 3],
  ['q', Field.QUARTER, C.LONG - C.DELTA, 4, 4],
  ['q', Field.QUARTER, C.NARROW - C.DELTA, 5, 5],

  ['M', Field.MONTH, C.NUMERIC, 1, 2],
  ['M', Field.MONTH, C.SHORT, 3, 3],
  ['M', Field.MONTH, C.LONG, 4, 4],
  ['M', Field.MONTH, C.NARROW, 5, 5],
  ['L', Field.MONTH, C.NUMERIC + C.DELTA, 1, 2],
  ['L', Field.MONTH, C.SHORT - C.DELTA, 3, 3],
  ['L', Field.MONTH, C.LONG - C.DELTA, 4, 4],
  ['L', Field.MONTH, C.NARROW - C.DELTA, 5, 5],
  ['l', Field.MONTH, C.NUMERIC + C.DELTA, 1, 1],

  ['w', Field.WEEK_OF_YEAR, C.NUMERIC, 1, 2],

  ['W', Field.WEEK_OF_MONTH, C.NUMERIC, 1, 1],

  ['E', Field.WEEKDAY, C.SHORT, 1, 3],
  ['E', Field.WEEKDAY, C.LONG, 4, 4],
  ['E', Field.WEEKDAY, C.NARROW, 5, 5],
  ['E', Field.WEEKDAY, C.SHORTER, 6, 6],
  ['c', Field.WEEKDAY, C.NUMERIC + 2 * C.DELTA, 1, 2],
  ['c', Field.WEEKDAY, C.SHORT - 2 * C.DELTA, 3, 3],
  ['c', Field.WEEKDAY, C.LONG - 2 * C.DELTA, 4, 4],
  ['c', Field.WEEKDAY, C.NARROW - 2 * C.DELTA, 5, 5],
  ['c', Field.WEEKDAY, C.SHORTER - 2 * C.DELTA, 6, 6],
  ['e', Field.WEEKDAY, C.NUMERIC + C.DELTA, 1, 2],
  ['e', Field.WEEKDAY, C.SHORT - C.DELTA, 3, 3],
  ['e', Field.WEEKDAY, C.LONG - C.DELTA, 4, 4],
  ['e', Field.WEEKDAY, C.NARROW - C.DELTA, 5, 5],
  ['e', Field.WEEKDAY, C.SHORTER - C.DELTA, 6, 6],

  ['d', Field.DAY, C.NUMERIC, 1, 2],
  ['g', Field.DAY, C.NUMERIC + C.DELTA, 1, 20],

  ['D', Field.DAY_OF_YEAR, C.NUMERIC, 1, 3],

  ['F', Field.DAY_OF_WEEK_IN_MONTH, C.NUMERIC, 1, 1],

  ['a', Field.DAYPERIOD, C.SHORT, 1, 3],
  ['a', Field.DAYPERIOD, C.LONG, 4, 4],
  ['a', Field.DAYPERIOD, C.NARROW, 5, 5],
  ['b', Field.DAYPERIOD, C.SHORT - C.DELTA, 1, 3],
  ['b', Field.DAYPERIOD, C.LONG - C.DELTA, 4, 4],
  ['b', Field.DAYPERIOD, C.NARROW - C.DELTA, 5, 5],
  ['B', Field.DAYPERIOD, C.SHORT - 3 * C.DELTA, 1, 3],
  ['B', Field.DAYPERIOD, C.LONG - 3 * C.DELTA, 4, 4],
  ['B', Field.DAYPERIOD, C.NARROW - 3 * C.DELTA, 5, 5],

  ['H', Field.HOUR, C.NUMERIC + 10 * C.DELTA, 1, 2], // 24 hour
  ['k', Field.HOUR, C.NUMERIC + 11 * C.DELTA, 1, 2],
  ['h', Field.HOUR, C.NUMERIC, 1, 2], // 12 hour
  ['K', Field.HOUR, C.NUMERIC + C.DELTA, 1, 2],

  ['m', Field.MINUTE, C.NUMERIC, 1, 2],

  ['s', Field.SECOND, C.NUMERIC, 1, 2],
  ['A', Field.SECOND, C.NUMERIC + C.DELTA, 1, 1000],

  ['S', Field.FRACTIONAL_SECOND, C.NUMERIC, 1, 1000],

  ['v', Field.ZONE, C.SHORT - 2 * C.DELTA, 1, 1],
  ['v', Field.ZONE, C.LONG - 2 * C.DELTA, 4, 4],
  ['z', Field.ZONE, C.SHORT, 1, 3],
  ['z', Field.ZONE, C.LONG, 4, 4],
  ['Z', Field.ZONE, C.NARROW - C.DELTA, 1, 3],
  ['Z', Field.ZONE, C.LONG - C.DELTA, 4, 4],
  ['Z', Field.ZONE, C.SHORT - C.DELTA, 5, 5],
  ['O', Field.ZONE, C.SHORT - C.DELTA, 1, 1],
  ['O', Field.ZONE, C.LONG - C.DELTA, 4, 4],
  ['V', Field.ZONE, C.SHORT - C.DELTA, 1, 1],
  ['V', Field.ZONE, C.LONG - C.DELTA, 2, 2],
  ['V', Field.ZONE, C.LONG - 1 - C.DELTA, 3, 3],
  ['V', Field.ZONE, C.LONG - 2 - C.DELTA, 4, 4],
  ['X', Field.ZONE, C.NARROW - C.DELTA, 1, 1],
  ['X', Field.ZONE, C.SHORT - C.DELTA, 2, 2],
  ['X', Field.ZONE, C.LONG - C.DELTA, 4, 4],
  ['x', Field.ZONE, C.NARROW - C.DELTA, 1, 1],
  ['x', Field.ZONE, C.SHORT - C.DELTA, 2, 2],
  ['x', Field.ZONE, C.LONG - C.DELTA, 4, 4],
];

/**
 * Faster lookup for field canonical indices.
 */
export const buildFieldIndex = (): { [x: string]: number[] } => {
  const res: { [x: string]: number[] } = {};
  FIELD_TYPES.forEach((t, i) => {
    const ch = t[0];
    const entry = res[ch] || [];
    entry.push(i);
    res[ch] = entry;
  });
  return res;
};

export const FIELD_INDEX = buildFieldIndex();

export const getFieldType = (field: string, width: number): FieldType | undefined => {
  const indices = FIELD_INDEX[field];
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