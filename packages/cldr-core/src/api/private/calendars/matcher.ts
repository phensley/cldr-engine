// ICU-compatible distance-based skeleton matching

import {
  DateTimeField,
  DateTimeNode,
  DATE_PATTERN_CHARS,
  datePatternToString,
  parseDatePattern
} from '../../../parsing/patterns/date';

// Date field types
const enum F {
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

// Inlined constants
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

type FieldType = [string, number, number, number, number];

const FIELD_TYPES: FieldType[] = [
  ['G', F.ERA, C.SHORT, 1, 3],
  ['G', F.ERA, C.LONG, 4, 4],
  ['G', F.ERA, C.NARROW, 5, 5],

  ['y', F.YEAR, C.NUMERIC, 1, 20],
  ['Y', F.YEAR, C.NUMERIC + C.DELTA, 1, 20],
  ['u', F.YEAR, C.NUMERIC + 2 * C.DELTA, 1, 20],
  ['r', F.YEAR, C.NUMERIC + 3 * C.DELTA, 1, 20],
  ['U', F.YEAR, C.SHORT, 1, 3],
  ['U', F.YEAR, C.LONG, 4, 4],
  ['U', F.YEAR, C.NARROW, 5, 5],

  ['Q', F.QUARTER, C.NUMERIC, 1, 2],
  ['Q', F.QUARTER, C.SHORT, 3, 3],
  ['Q', F.QUARTER, C.LONG, 4, 4],
  ['Q', F.QUARTER, C.NARROW, 5, 5],
  ['q', F.QUARTER, C.NUMERIC + C.DELTA, 1, 2],
  ['q', F.QUARTER, C.SHORT - C.DELTA, 3, 3],
  ['q', F.QUARTER, C.LONG - C.DELTA, 4, 4],
  ['q', F.QUARTER, C.NARROW - C.DELTA, 5, 5],

  ['M', F.MONTH, C.NUMERIC, 1, 2],
  ['M', F.MONTH, C.SHORT, 3, 3],
  ['M', F.MONTH, C.LONG, 4, 4],
  ['M', F.MONTH, C.NARROW, 5, 5],
  ['L', F.MONTH, C.NUMERIC + C.DELTA, 1, 2],
  ['L', F.MONTH, C.SHORT - C.DELTA, 3, 3],
  ['L', F.MONTH, C.LONG - C.DELTA, 4, 4],
  ['L', F.MONTH, C.NARROW - C.DELTA, 5, 5],
  ['l', F.MONTH, C.NUMERIC + C.DELTA, 1, 1],

  ['w', F.WEEK_OF_YEAR, C.NUMERIC, 1, 2],

  ['W', F.WEEK_OF_MONTH, C.NUMERIC, 1, 1],

  ['E', F.WEEKDAY, C.SHORT, 1, 3],
  ['E', F.WEEKDAY, C.LONG, 4, 4],
  ['E', F.WEEKDAY, C.NARROW, 5, 5],
  ['E', F.WEEKDAY, C.SHORTER, 6, 6],
  ['c', F.WEEKDAY, C.NUMERIC + 2 * C.DELTA, 1, 2],
  ['c', F.WEEKDAY, C.SHORT - 2 * C.DELTA, 3, 3],
  ['c', F.WEEKDAY, C.LONG - 2 * C.DELTA, 4, 4],
  ['c', F.WEEKDAY, C.NARROW - 2 * C.DELTA, 5, 5],
  ['c', F.WEEKDAY, C.SHORTER - 2 * C.DELTA, 6, 6],
  ['e', F.WEEKDAY, C.NUMERIC + C.DELTA, 1, 2],
  ['e', F.WEEKDAY, C.SHORT - C.DELTA, 3, 3],
  ['e', F.WEEKDAY, C.LONG - C.DELTA, 4, 4],
  ['e', F.WEEKDAY, C.NARROW - C.DELTA, 5, 5],
  ['e', F.WEEKDAY, C.SHORTER - C.DELTA, 6, 6],

  ['d', F.DAY, C.NUMERIC, 1, 2],
  ['g', F.DAY, C.NUMERIC + C.DELTA, 1, 20],

  ['D', F.DAY_OF_YEAR, C.NUMERIC, 1, 3],

  ['F', F.DAY_OF_WEEK_IN_MONTH, C.NUMERIC, 1, 1],

  ['a', F.DAYPERIOD, C.SHORT, 1, 3],
  ['a', F.DAYPERIOD, C.LONG, 4, 4],
  ['a', F.DAYPERIOD, C.NARROW, 5, 5],
  ['b', F.DAYPERIOD, C.SHORT - C.DELTA, 1, 3],
  ['b', F.DAYPERIOD, C.LONG - C.DELTA, 4, 4],
  ['b', F.DAYPERIOD, C.NARROW - C.DELTA, 5, 5],
  ['B', F.DAYPERIOD, C.SHORT - 3 * C.DELTA, 1, 3],
  ['B', F.DAYPERIOD, C.LONG - 3 * C.DELTA, 4, 4],
  ['B', F.DAYPERIOD, C.NARROW - 3 * C.DELTA, 5, 5],

  ['H', F.HOUR, C.NUMERIC + 10 * C.DELTA, 1, 2], // 24 hour
  ['k', F.HOUR, C.NUMERIC + 11 * C.DELTA, 1, 2],
  ['h', F.HOUR, C.NUMERIC, 1, 2], // 12 hour
  ['K', F.HOUR, C.NUMERIC + C.DELTA, 1, 2],

  ['m', F.MINUTE, C.NUMERIC, 1, 2],

  ['s', F.SECOND, C.NUMERIC, 1, 2],
  ['A', F.SECOND, C.NUMERIC + C.DELTA, 1, 1000],

  ['S', F.FRACTIONAL_SECOND, C.NUMERIC, 1, 1000],

  ['v', F.ZONE, C.SHORT - 2 * C.DELTA, 1, 1],
  ['v', F.ZONE, C.LONG - 2 * C.DELTA, 4, 4],
  ['z', F.ZONE, C.SHORT, 1, 3],
  ['z', F.ZONE, C.LONG, 4, 4],
  ['Z', F.ZONE, C.NARROW - C.DELTA, 1, 3],
  ['Z', F.ZONE, C.LONG - C.DELTA, 4, 4],
  ['Z', F.ZONE, C.SHORT - C.DELTA, 5, 5],
  ['O', F.ZONE, C.SHORT - C.DELTA, 1, 1],
  ['O', F.ZONE, C.LONG - C.DELTA, 4, 4],
  ['V', F.ZONE, C.SHORT - C.DELTA, 1, 1],
  ['V', F.ZONE, C.LONG - C.DELTA, 2, 2],
  ['V', F.ZONE, C.LONG - 1 - C.DELTA, 3, 3],
  ['V', F.ZONE, C.LONG - 2 - C.DELTA, 4, 4],
  ['X', F.ZONE, C.NARROW - C.DELTA, 1, 1],
  ['X', F.ZONE, C.SHORT - C.DELTA, 2, 2],
  ['X', F.ZONE, C.LONG - C.DELTA, 4, 4],
  ['x', F.ZONE, C.NARROW - C.DELTA, 1, 1],
  ['x', F.ZONE, C.SHORT - C.DELTA, 2, 2],
  ['x', F.ZONE, C.LONG - C.DELTA, 4, 4],
];

/**
 * Faster lookup for field canonical indices.
 */
const buildFieldIndex = (): { [x: string]: number[] } => {
  const res: { [x: string]: number[] } = {};
  FIELD_TYPES.forEach((t, i) => {
    const ch = t[0];
    const entry = res[ch] || [];
    entry.push(i);
    res[ch] = entry;
  });
  return res;
};

const FIELD_INDEX = buildFieldIndex();

const getFieldType = (field: string, width: number): FieldType | undefined => {
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

export interface SkeletonField {
  input: string;
  field: string;
  width: number;
  repeat: number;
}

/**
 * Represents an abstract date pattern, denoting the fields that appear in
 * the actual pattern.
 */
export class DateSkeleton {

  type: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  info: (SkeletonField | undefined)[] = [];

  skeleton: string = '';
  pattern: DateTimeNode[] | undefined;

  private _isDate: boolean = false;
  private _isTime: boolean = false;

  /**
   * Includes both date and time fields, will need to be split prior to matching.
   */
  compound(): boolean {
    return this._isDate && this._isTime;
  }

  isDate(): boolean {
    return this._isDate;
  }

  isTime(): boolean {
    return this._isTime;
  }

  monthWidth(): number {
    const m = this.info[F.MONTH];
    return m ? m.width : 0;
  }

  hasWeekday(): boolean {
    const m = this.info[F.WEEKDAY];
    return m !== undefined;
  }

  toString(): string {
    return this.skeleton;
  }

  /**
   * Split this compound skeleton, removing all time fields and copying
   * them to another skeleton.
   */
  split(): DateSkeleton {
    const r = new DateSkeleton();
    // Copy time fields to other skeleton and clear them.
    for (let i = F.DAYPERIOD; i < F.MAX_TYPE; i++) {
      if (this.type[i] !== 0) {
        r.type[i] = this.type[i];
        const _info = this.info[i];
        if (_info !== undefined) {
          // ensure we copy the properties
          const { input, field, width, repeat } = _info;
          r.info[i] = { input, field, width, repeat };
        }
        this.type[i] = 0;
        this.info[i] = undefined;
      }
    }
    this._isTime = false;
    this.skeleton = this._canonical();
    r._isTime = true;
    r.skeleton = r._canonical();
    return r;
  }

  static parse(skeleton: string, preferred: DateTimeNode[] = [], allowed: DateTimeNode[] = []): DateSkeleton {
    const s = new DateSkeleton();
    s._parse(skeleton, false, preferred, allowed);
    return s;
  }

  /**
   * Special case where a date pattern is used as a skeleton. Additionally
   * we attache the parsed pattern to the skeleton for convenience.
   */
  static parsePattern(pattern: string): DateSkeleton {
    const s = new DateSkeleton();
    s._parse(pattern, true, [], []);
    s.pattern = parseDatePattern(pattern);
    return s;
  }

  private _parse(raw: string, isPattern: boolean, preferred: DateTimeNode[], allowed: DateTimeNode[]): void {
    const len = raw.length;

    let noDayPeriod = false;
    let field = '';
    let width = 0;
    let inquote = false;
    let i = 0;
    while (i < len) {
      const ch = raw[i];
      if (inquote) {
        if (ch === '\'') {
          inquote = false;
        }
        i++;
        continue;
      }
      if (ch === "'") {
        inquote = true;

      } else if (DATE_PATTERN_CHARS[ch] > 0) {
        if (ch !== field) {
          if (field !== '') {
            if ('jJC'.indexOf(field) !== -1) {
              noDayPeriod = field === 'J';
              this.setMeta(field, field === 'C' ? allowed : preferred);
            } else {
              this.set(field, field, width);
            }
          }
          field = ch;
          width = 1;
        } else {
          width++;
        }
      }

      // Lenient parse.. skip all non-field charaters.
      i++;
    }

    // Push the last field
    if (width > 0 && field !== '') {
      if ('jJC'.indexOf(field) !== -1) {
        noDayPeriod = field === 'J';
        this.setMeta(field, field === 'C' ? allowed : preferred);
      } else {
        this.set(field, field, width);
      }
    }

    // Handle some special hour cycle / day period behaviors
    const hour = this.info[F.HOUR];
    const dayPeriod = this.info[F.DAYPERIOD];
    if (noDayPeriod) {
      this.type[F.DAYPERIOD] = 0;
      this.info[F.DAYPERIOD] = undefined;
    }  else if (hour !== undefined && hour.field !== '') {
      // If we have a 12-hour-cycle but no dayperiod, add the default.
      if (hour.field === 'h' || hour.field === 'K') {
        if (dayPeriod === undefined) {
          // Add the default day period
          const idx = FIELD_INDEX['a'][0];
          const row = FIELD_TYPES[idx];
          this.type[F.DAYPERIOD] = row[2];
          this.info[F.DAYPERIOD] = { input: 'a', field: 'a', width: row[3], repeat: row[3] };
        }
      } else if (dayPeriod !== undefined && dayPeriod.field !== '') {
        this.type[F.DAYPERIOD] = 0;
        this.info[F.DAYPERIOD] = undefined;
      }
    }

    this.skeleton = isPattern ? this._canonical() : raw;
  }

  /**
   * Build a canonical representation of the skeleton.
   */
  private _canonical(): string {
    let r = '';
    for (let i = 0; i < F.MAX_TYPE; i++) {
      const info = this.info[i];
      if (info !== undefined) {
        const { field } = info;
        // Skip day period for backwards-compatibility
        if (field !== '' && field !== 'a') {
          let repeat = info.repeat;
          // Override skeleton repeat for these fields.
          if ('GEzvQ'.indexOf(field) !== -1) {
            repeat = 1;
          }
          for (let j = 0; j < repeat; j++) {
            r += field;
          }
        }
      }
    }
    return r;
  }

  private setMeta(input: string, meta: DateTimeNode[]): void {
    for (const n of meta) {
      if (typeof n !== 'string') {
        this.set(input, n[0], n[1]);
      }
    }
  }

  private set(input: string, field: string, width: number): void {
    const ft = getFieldType(field, width);
    if (ft !== undefined) {
      this.index(input, field, width, ft);
    }
  }

  private index(input: string, field: string, width: number, ft: FieldType): void {
    const idx = ft[1];
    this.type[idx] = ft[2] + (ft[2] > 0 ? width : 0);
    this.info[idx] = { input, field, width, repeat: ft[3] };
    this._isDate = this._isDate || idx < F.DAYPERIOD;
    this._isTime = this._isTime || idx >= F.DAYPERIOD;
  }
}

const EMPTY = new DateSkeleton();

/**
 * Cache of date patterns and skeletons with ICU-compatible best-fit matching.
 */
export class DatePatternMatcher {

  // Save some work for exact matches.
  private exact: { [x: string]: DateSkeleton } = {};

  // Array for matching by distances
  private entries: DateSkeleton[] = [];

  add(skeleton: DateSkeleton, pattern?: DateTimeNode[]): void {
    const key = skeleton.toString();
    // Avoid adding patterns with duplicate skeletons
    if (this.exact[key] === undefined) {
      this.exact[key] = skeleton;
      this.entries.push(skeleton);
    }
  }

  // TODO: future options to control the match

  match(input: DateSkeleton): DateSkeleton {
    const match = this.exact[input.toString()];
    if (match !== undefined) {
      return match;
    }

    let best: DateSkeleton = EMPTY;
    let bestDist: number = Number.MAX_SAFE_INTEGER;

    for (const entry of this.entries) {
      const dist = this.getDistance(entry, input);
      if (dist < bestDist) {
        best = entry;
        bestDist = dist;
        if (dist === 0) {
          break;
        }
      }
    }
    return best;
  }

  /**
   * Make field width adjustments to pattern using the given skeleton.
   */
  adjust(pattern: DateTimeNode[], skeleton: DateSkeleton, decimal: string = '.'): DateTimeNode[] {
    const r: DateTimeNode[] = [];
    for (const n of pattern) {
      if (typeof n === 'string') {
        r.push(n);
        continue;
      }

      const [field, width] = n;
      const p = getFieldType(field, width);
      if (p === undefined) {
        continue;
      }

      // Adjust field and width to match skeleton below
      let adjfield = field;
      let adjwidth = width;

      const i = p[1];

      // For hour, minute and second we use the width from the pattern.
      if (i === F.HOUR || i === F.MINUTE || i === F.SECOND) {
        r.push([adjfield, adjwidth]);

        // See if skeleton requested fractional seconds and augment the seconds field.
        if (i === F.SECOND) {
          const info = skeleton.info[F.FRACTIONAL_SECOND];
          if (info !== undefined) {
            r.push(decimal);
            r.push([info.field, info.width]);
          }
        }
        continue;
      }

      const ptype = p[2];
      const stype = skeleton.type[i];
      // Ensure magnitudes are the same
      if ((ptype < 0 && stype < 0) || (ptype > 0 && stype > 0)) {
        const _info = skeleton.info[i];
        if (_info !== undefined) {
          adjfield = _info.field;
          adjwidth = _info.width;
        }
      }

      // Metacharacters have already been replaced in the pattern.
      if ('jJC'.indexOf(adjfield) !== -1) {
        adjfield = field;
      }
      r.push([adjfield, adjwidth]);
    }

    // TODO: handle appending missing fields
    return r;
  }

  protected getDistance(a: DateSkeleton, b: DateSkeleton, mask: number = 0): number {
    let result = 0;
    for (let i = 0; i < F.MAX_TYPE; i++) {
      const atype = mask > 0 && (mask & (1 << i)) === 0 ? 0 : a.type[i];
      const btype = b.type[i];
      if (atype === btype) {
        continue;
      }
      if (atype === 0) {
        result += C.EXTRA_FIELD;
      } else if (btype === 0) {
        result += C.MISSING_FIELD;
      } else {
        result += Math.abs(atype - btype);
      }
    }
    return result;
  }
}
