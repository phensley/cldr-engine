import { DateTimeNode, DATE_PATTERN_CHARS } from '../../parsing/date';

import {
  getFieldType,
  skeletonFields,
  EXTRA_FIELD,
  Field,
  FieldType,
  FIELD_INDEX,
  FIELD_TYPES,
  MISSING_FIELD,
} from './fields';

export interface SkeletonField {
  input: string;
  field: string;
  type: Field;
  width: number;
  repeat: number;
}

/**
 * Represents an abstract date pattern, denoting the fields that appear in
 * the actual pattern.
 */
export class DateSkeleton {
  type: number[] = skeletonFields();
  info: (SkeletonField | undefined)[] = [];

  skeleton: string = '';
  pattern?: string;

  isDate: boolean = false;
  isTime: boolean = false;

  compound(): boolean {
    return this.isDate && this.isTime;
  }

  has(field: number): boolean {
    return this.type[field] !== 0;
  }

  monthWidth(): number {
    const m = this.info[Field.MONTH];
    return m ? m.width : 0;
  }

  /**
   * Split this compound skeleton, removing all time fields and copying
   * them to another skeleton.
   */
  split(): DateSkeleton {
    const r = new DateSkeleton();
    // Copy time fields to other skeleton and clear them.
    for (let i = Field.DAYPERIOD; i < Field.MAX_TYPE; i++) {
      if (this.type[i] !== 0) {
        r.type[i] = this.type[i];
        // ensure we copy the properties
        const { input, field, type, width, repeat } = this.info[i]!;
        r.info[i] = { input, field, type, width, repeat };
        this.type[i] = 0;
        this.info[i] = undefined;
      }
    }
    this.isTime = false;
    this.skeleton = this.canonical();
    r.isTime = true;
    r.skeleton = r.canonical();
    return r;
  }

  /**
   * Build a canonical representation of the skeleton.
   */
  canonical(): string {
    let r = '';
    for (let i = 0; i < Field.MAX_TYPE; i++) {
      const info = this.info[i];
      if (info !== undefined) {
        const { field } = info;
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
    return r;
  }
}

export const EMPTY = new DateSkeleton();

export class DateSkeletonParser {
  constructor(
    readonly preferredFlex: DateTimeNode[],
    readonly allowedFlex: DateTimeNode[],
  ) {}

  parse(skeleton: string, isPattern: boolean = false): DateSkeleton {
    const s = new DateSkeleton();
    this._parse(s, skeleton, isPattern);
    return s;
  }

  private _parse(s: DateSkeleton, raw: string, isPattern: boolean): void {
    const len = raw.length;
    let noDayPeriod = false;
    let field = '';
    let width = 0;
    let inquote = false;
    let i = 0;
    while (i < len) {
      const ch = raw[i];
      if (inquote) {
        if (ch === "'") {
          inquote = false;
        }
        i++;
        continue;
      }
      if (ch === "'") {
        inquote = true;
      } else if (DATE_PATTERN_CHARS[ch] > 0) {
        if (ch !== field) {
          if (field) {
            noDayPeriod = this.setDayPeriod(s, field, width, noDayPeriod);
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

    // Push the last field. For a non-empty skeleton this will always
    // be true.
    if (width > 0 && field) {
      noDayPeriod = this.setDayPeriod(s, field, width, noDayPeriod);
    }

    // Handle some special hour cycle / day period behaviors
    const hour = s.info[Field.HOUR];
    const dayPeriod = s.info[Field.DAYPERIOD];
    if (noDayPeriod) {
      this.clear(s, Field.DAYPERIOD);
    } else if (hour && hour.field) {
      // If we have a 12-hour-cycle but no dayperiod, add the default.
      if (hour.field === 'h' || hour.field === 'K') {
        if (!dayPeriod) {
          // Add the default day period
          const idx = FIELD_INDEX.get('a')![0];
          const row = FIELD_TYPES[idx];
          s.type[Field.DAYPERIOD] = row[2];
          s.info[Field.DAYPERIOD] = {
            input: 'a',
            field: 'a',
            type: Field.DAYPERIOD,
            width: row[3],
            repeat: row[3],
          };
        }
      } else if (dayPeriod && dayPeriod.field) {
        this.clear(s, Field.DAYPERIOD);
      }
    }

    s.skeleton = isPattern ? s.canonical() : raw;
    if (isPattern) {
      s.pattern = raw;
    }
  }

  private setDayPeriod(s: DateSkeleton, field: string, width: number, noDayPeriod: boolean): boolean {
    if ('jJC'.indexOf(field) !== -1) {
      noDayPeriod = field === 'J';
      this.setMeta(s, field);
    } else {
      this.set(s, field, field, width);
    }
    return noDayPeriod;
  }

  private setMeta(s: DateSkeleton, field: string): void {
    const meta = field === 'C' ? this.allowedFlex : this.preferredFlex;
    for (const n of meta) {
      /* istanbul ignore else */
      if (typeof n !== 'string') {
        this.set(s, field, n[0], n[1]);
      }
    }
  }

  private set(s: DateSkeleton, input: string, field: string, width: number): void {
    const ft = getFieldType(field, width);
    // Will never fail as field types are whitelisted at a higher call point
    /* istanbul ignore else */
    if (ft !== undefined) {
      this.index(s, input, field, width, ft);
    }
  }

  private clear(s: DateSkeleton, field: number): void {
    s.type[field] = 0;
    s.info[field] = undefined;
  }

  private index(s: DateSkeleton, input: string, field: string, width: number, ft: FieldType): void {
    const idx = ft[1];
    s.type[idx] = ft[2] + (ft[2] > 0 ? width : 0);
    s.info[idx] = { input, field, type: idx, width, repeat: ft[3] };
    s.isDate = s.isDate || idx < Field.DAYPERIOD;
    s.isTime = s.isTime || idx >= Field.DAYPERIOD;
  }
}

const cmp = (a: number, b: number): number => (a < b ? -1 : a > b ? 1 : 0);

export interface DatePatternMatcherEntry<T> {
  skeleton: DateSkeleton;
  data?: T;
}

export const NONE: DatePatternMatcherEntry<any> = {
  skeleton: new DateSkeleton(),
};

/**
 * Cache of date patterns and skeletons with ICU-compatible best-fit matching.
 */
export class DatePatternMatcher<T> {
  // Save some work for exact matches.
  private exact: { [x: string]: DatePatternMatcherEntry<T> } = {};

  // Array for matching by distances
  private entries: DatePatternMatcherEntry<T>[] = [];

  add(skeleton: DateSkeleton, data?: T): void {
    const key = skeleton.skeleton;
    // Avoid adding patterns with duplicate skeletons
    if (this.exact[key] === undefined) {
      const entry: DatePatternMatcherEntry<T> = {
        skeleton,
        data,
      };
      this.exact[key] = entry;
      this.entries.push(entry);
    }
  }

  /**
   * Sort entries once they have all been added.
   */
  sort() {
    this.entries.sort((a, b) => cmp(a.skeleton.skeleton.length, b.skeleton.skeleton.length));
  }

  // TODO: future options to control the match

  match(input: DateSkeleton): DatePatternMatcherEntry<T> {
    const match = this.exact[input.skeleton];
    if (match !== undefined) {
      return match;
    }

    let best: DatePatternMatcherEntry<T> = NONE;
    let bestDist: number = Number.MAX_SAFE_INTEGER;

    for (const entry of this.entries) {
      const dist = this.getDistance(entry.skeleton, input);
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
  adjust(pattern: DateTimeNode[], skeleton: DateSkeleton, decimal: string): DateTimeNode[] {
    const r: DateTimeNode[] = [];
    for (const n of pattern) {
      if (typeof n === 'string') {
        r.push(n);
        continue;
      }

      const [field, width] = n;
      const p = getFieldType(field, width)!;

      // Adjust field and width to match skeleton below
      let adjfield = field;
      let adjwidth = width;

      const i = p[1];

      // For hour, minute and second we use the width from the pattern.
      if (i === Field.HOUR || i === Field.MINUTE || i === Field.SECOND) {
        r.push([adjfield, adjwidth]);

        // See if skeleton requested fractional seconds and augment the seconds field.
        if (i === Field.SECOND) {
          const info = skeleton.info[Field.FRACTIONAL_SECOND];
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
        // Since the 'i' comes from a parsed date pattern, this should
        // always be defined.
        /* istanbul ignore else */
        if (_info) {
          adjfield = _info.field;
          adjwidth = _info.width;
        }
      }

      r.push([adjfield, adjwidth]);
    }

    // TODO: handle appending missing fields
    return r;
  }

  // TODO: mask is currently unused
  protected getDistance(a: DateSkeleton, b: DateSkeleton, _mask: number = 0): number {
    let result = 0;
    for (let i = 0; i < Field.MAX_TYPE; i++) {
      // const atype = mask > 0 && (mask & (1 << i)) === 0 ? 0 : a.type[i];
      const atype = a.type[i];
      const btype = b.type[i];
      if (atype === btype) {
        continue;
      }
      if (atype === 0) {
        result += EXTRA_FIELD;
      } else if (btype === 0) {
        result += MISSING_FIELD;
      } else {
        result += Math.abs(atype - btype);
      }
    }
    return result;
  }
}
