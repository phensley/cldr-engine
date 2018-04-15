import {
  DateTimePatternFieldType,
  GregorianInfo,
  FormatWidthType,
  FormatWidthValues,
  GregorianSchema,
  Plural,
  PluralType,
  Schema,
  pluralCategory
} from '@phensley/cldr-schema';

import { timeData } from './autogen.timedata';
import { DateTimeNode, parseDatePattern, intervalPatternBoundary } from '../../../parsing/patterns/date';
import { DateFormatOptions, DateIntervalFormatOptions } from '../../../common';
import { DateFormatRequest, DateIntervalFormatRequest, NumberParams } from '../../../common/private';
import { Internals } from '../../../internals';
import { Bundle } from '../../../resource';
import { DatePatternMatcher, DateSkeleton } from './matcher';
import { coerceDecimal, ZonedDateTime } from '../../../types';
import { Cache } from '../../../utils/cache';
import { LRU } from '../../../utils/lru';

export interface DateSkeletons {
  // Date pattern that matched the skeleton
  date?: DateSkeleton;
  // Time pattern that matched the skeleton
  time?: DateSkeleton;
}

export interface DatePatterns {
  date?: DateTimeNode[];
  time?: DateTimeNode[];
  wrap: string;
}

export interface DateIntervalPatterns {
  date?: DateTimeNode[];
  range?: DateTimeNode[];
}

export interface CalendarMatcher {
  matcher: DatePatternMatcher;
  cache: LRU<string, DatePatterns>;
}

export interface IntervalMatcher {
  matcher: DatePatternMatcher;
  cache: LRU<string, DateIntervalPatterns>;
}

const CANONICAL_FIELDS = [
  'G', 'y', 'Q', 'M', 'w', 'W', 'E',
  'd', 'D', 'F', 'a',
  'H', 'm', 's', 'S', 'v'
];

const getTimeData = (language: string, region: string): [string, string] => {
  const t = timeData[language] || timeData[''];
  let r = t[region] || timeData['']['001'];
  if (r === undefined) {
    r = timeData['']['001'];
  }
  const [a, b] = r.split('|');
  return [a, b];
};

/**
 * Manages finding / matching and adjusting date patterns.
 */
export class DatePatternManager {

  // TODO: generalize to any calendar
  private Gregorian: GregorianSchema;
  private dateMatchers: LRU<string, CalendarMatcher>;
  private intervalMatchers: LRU<string, IntervalMatcher>;
  private patternCache: Cache<DateTimeNode[]>;
  private allowedFlex: DateTimeNode[][];
  private preferredFlex: DateTimeNode[];

  constructor(
    readonly bundle: Bundle,
    readonly internals: Internals,
    readonly cacheSize: number = 50) {

    // Size this to number of calendars
    this.dateMatchers = new LRU(10);
    this.intervalMatchers = new LRU(10);

    // TODO: Use the calendar internals pattern cache
    this.patternCache = new Cache(parseDatePattern, cacheSize);

    // TODO: generalize to any calendar
    this.Gregorian = internals.schema.Gregorian;

    const tmp = getTimeData(bundle.language(), bundle.region());
    this.allowedFlex = tmp[0].split(' ').map(parseDatePattern);
    this.preferredFlex = parseDatePattern(tmp[1]);
  }

  /**
   * Get the field types for date, time and skeleton.
   */
  getPatternTypes(options: DateFormatOptions): [string, string, string] {
    let timeKey = options.datetime || options.time || '';
    let dateKey = options.datetime || options.date || '';
    let skelKey = options.skeleton || '';
    if (timeKey === undefined && dateKey === undefined) {
      if (skelKey !== undefined) {
        dateKey = '';
        timeKey = '';
      } else {
        skelKey = 'yMd';
      }
    }
    return [dateKey, timeKey, skelKey];
  }

  getCalendar(options: DateFormatOptions): string {
    return options.ca || this.defaultCalendar();
  }

  /**
   * Determine the final date and time patterns to use. If a skeleton is specified,
   * do a best-fit match to find the patterns, adjusted per the skeleton field
   * widths where possible.
   */
  getRequest(d: ZonedDateTime, options: DateFormatOptions, params: NumberParams): DateFormatRequest {
    const calendar = options.ca || this.defaultCalendar();
    // TODO: calendar support
    const [dateKey, timeKey, skelKey] = this.getPatternTypes(options);

    // TODO: default wrapper
    let wrapKey: string | undefined = options.wrap;
    let wrapper = '';
    if (wrapKey) {
      wrapper = this.Gregorian.dateTimeFormats(this.bundle, (wrapKey || 'short') as FormatWidthType);
    }

    const req: DateFormatRequest = { wrapper, params };

    // Handle standard named patterns
    if (dateKey !== '') {
      const raw = this.Gregorian.dateFormats(this.bundle, dateKey as FormatWidthType);
      req.date = this.patternCache.get(raw);
    }
    if (timeKey !== '') {
      const raw = this.Gregorian.timeFormats(this.bundle, timeKey as FormatWidthType);
      req.time = this.patternCache.get(raw);
    }

    if (req.date && req.time) {
      if (!wrapKey) {
        wrapKey = dateKey;
      }
      req.wrapper = this.Gregorian.dateTimeFormats(this.bundle, wrapKey as FormatWidthType);
    }

    if (req.date || req.time) {
      return req;
    }

    // Use skeleton to find best fit patterns.
    const { matcher, cache } = this.getCalendarMatcher(calendar);

    // Check if we've matched this skeleton before
    let entry = cache.get(skelKey);
    if (entry !== undefined) {
      req.date = entry.date;
      req.time = entry.time;
      if (!req.wrapper) {
        req.wrapper = entry.wrap;
      }
      return req;
    }

    const query = DateSkeleton.parse(skelKey, this.preferredFlex, this.allowedFlex[0]);
    let tquery: DateSkeleton | undefined;

    let dateSkel: DateSkeleton | undefined;
    let timeSkel: DateSkeleton | undefined;

    // Query for closest fit
    if (query.compound()) {
      tquery = query.split();
      dateSkel = matcher.match(query);
      timeSkel = matcher.match(tquery);
    } else if (query.isDate()) {
      dateSkel = matcher.match(query);
    } else {
      tquery = query;
      timeSkel = matcher.match(query);
    }

    // Get the underlying patterns and adjust them per the skeleton
    let date: DateTimeNode[] | undefined;
    let time: DateTimeNode[] | undefined;
    if (dateSkel) {
      const tempDate = dateSkel.pattern || this.getSkeletonPattern(d, dateSkel.skeleton);
      date = matcher.adjust(tempDate, query, params.symbols.decimal);
      if (date.length === 0) {
        date = undefined;
      }
    }
    if (tquery && timeSkel) {
      const tempTime = timeSkel.pattern || this.getSkeletonPattern(d, timeSkel.skeleton);
      time = matcher.adjust(tempTime, tquery, params.symbols.decimal);
      if (time.length === 0) {
        time = undefined;
      }
    }

    // Determine wrapper using the date fields.
    if (wrapKey) {
      req.wrapper = this.Gregorian.dateTimeFormats(this.bundle, wrapKey as FormatWidthType);
    } else if (dateSkel && date && time) {
      req.wrapper = this.getWrapper(dateSkel, date, time);
    }

    entry = { date, time, wrap: req.wrapper };

    // Remember this skeleton
    cache.set(skelKey, entry);

    req.date = entry.date;
    req.time = entry.time;

    return req;
  }

  /**
   * TODO: better description once this routine is reorganized
   *
   * We do a best-fit match of the input skeleton, which can request both date and time
   * fields. The start and end dates can also differ in the "yMd" and "ahms" fields, so
   * we handle the following cases:
   *
   * 1. Skeleton requests both date and time fields:
   *  a. "yMd" same: split skeleton, format date standalone, followed by time range skeleton.
   *  b. "yMd" differ: format full start/end with fallback format.
   *
   * 2. Skeleton requests date fields only:
   *  a. "yMd" same: format date standalone
   *  b. "yMd" differ: select date interval pattern and format
   *
   * 3. Skeleton requests time fields only.
   *  a. "yMd" same, "ahms" same: format time standalone
   *  b. "yMd" same, "ahms" differ: select time interval pattern and format
   *  c. "yMd" differ: prepend "yMd" skeleton and go to (1a).
   *
   */
  getIntervalRequest(start: ZonedDateTime, end: ZonedDateTime,
      options: DateIntervalFormatOptions, params: NumberParams): DateIntervalFormatRequest {

    const calendar = options.ca || this.defaultCalendar();
    const origSkeleton = options.skeleton || 'yMd';
    let skeleton = origSkeleton;

    const field = start.fieldOfGreatestDifference(end);
    const dateDiffers = 'yMd'.indexOf(field) !== -1;
    const timeDiffers = 'aHms'.indexOf(field) !== -1;

    const wrapper = this.Gregorian.intervalFormatFallback(this.bundle);

    const req: DateIntervalFormatRequest = { params, wrapper };

    const { matcher, cache } = this.getIntervalMatcher(calendar);

    // Check cache if this combination of skeleton / field of greatest difference exists.
    const cacheKey = `${skeleton}\t${field}`;
    // console.log('cache key:', cacheKey);
    let entry = cache.get(cacheKey);
    if (entry !== undefined) {
      req.date = entry.date;
      req.range = entry.range;
      return req;
    }

    entry = {};

    // Use skeleton to find best fit patterns.
    let requery = false;
    let query = DateSkeleton.parse(skeleton, this.preferredFlex, this.allowedFlex[0]);

    // 3c. Skeleton requests time fields only, but "yMd" differs
    if (!query.isDate() && query.isTime() && dateDiffers) {
      // Modify requested skeleton to include "yMd"
      skeleton = `yMd${skeleton}`;
      requery = true;

    } else if (dateDiffers) {
      // Modify input skeleton based on requested fields and field of greatest difference.
      // Ensures the skeleton contains appropriate context

      // TODO: augment skeleton to make these queries use masks

      switch (field) {
      case 'y':
        if (query.hasDay()) {
          if (!query.hasMonth()) {
            skeleton = 'M' + skeleton;
          }
        }
        if (!query.hasYear()) {
          skeleton = 'y' + skeleton;
        }
        break;

      case 'M':
        if (!query.hasMonth()) {
          skeleton = 'M' + skeleton;
        }
        break;

      case 'd':
        if (!query.hasDay()) {
          skeleton = 'd' + skeleton;
        }
        if (!query.hasMonth()) {
          skeleton = 'M' + skeleton;
        }
        break;
      }
    } else {
      switch (field) {
      case 'a':
      case 'H':
        if (!query.hasHour()) {
          skeleton = 'j' + skeleton;
        }
        if (!query.hasDayPeriod()) {
          skeleton = 'a' + skeleton;
        }
        break;
      }
    }

    // Check if skeleton was augmented
    if (origSkeleton !== skeleton) {
      query = DateSkeleton.parse(skeleton, this.preferredFlex, this.allowedFlex[0]);
    }

    // 1. Skeleton requests both date and time fields.
    if (query.compound()) {
      // b. "yMd" differs.
      if (dateDiffers) {
        // Bail out and use the fallback format
        req.skeleton = skeleton;
        return req;
      }

      // a. split skeleton, format date standalone...
      const tquery = query.split();

      // TODO: reorganize so this is reusable. inlined temporarily to get things working.

      const datematcher = this.getCalendarMatcher(calendar);
      const dateSkel = datematcher.matcher.match(query);
      const tempDate = dateSkel.pattern || this.getSkeletonPattern(start, dateSkel.skeleton);
      const datePattern = datematcher.matcher.adjust(tempDate, dateSkel, params.symbols.decimal);
      if (datePattern.length !== 0) {
        entry.date = datePattern;
      }

      // .. followed by time range skeleton
      query = tquery;
    }

    const standalone = (query.isDate() && !dateDiffers) || (query.isTime() && !timeDiffers);
    if (standalone) {
      // 2a. "yMd" same: format date standalone
      // 3a. "yMd" same, "ahms" same: format time standalone

      // TODO: reorganize so this is reusable. inlined temporarily to get things working.

      const datematcher = this.getCalendarMatcher(calendar);
      const dateSkel = datematcher.matcher.match(query);
      const tempDate = dateSkel.pattern || this.getSkeletonPattern(start, dateSkel.skeleton);
      const datePattern = datematcher.matcher.adjust(tempDate, query, params.symbols.decimal);
      if (datePattern.length !== 0) {
        entry.date = datePattern;
      }
    } else {
      // 2b. "yMd" differ: select date interval pattern and format
      // 3b. "yMd" same, "ahms" differ: select time interval pattern and format
      // console.log('2b 3b');

      const skel = matcher.match(query);
      if (skel) {
        const pattern = this.getIntervalPattern(skel.skeleton, field);
        if (pattern) {
          entry.range = matcher.adjust(pattern, query, params.symbols.decimal);
        }
      }
    }

    // Cache the entry and return the request
    cache.set(cacheKey, entry);
    req.date = entry.date;
    req.range = entry.range;
    return req;
  }

  protected getWrapper(dateSkel: DateSkeleton, date: DateTimeNode[], time: DateTimeNode[]): string {
    let wrapKey = 'short';
    const monthWidth = dateSkel.monthWidth();
    const hasWeekday = dateSkel.hasWeekday();
    if (monthWidth === 4) {
      wrapKey = hasWeekday ? 'full' : 'long';
    } else if (monthWidth === 3) {
      wrapKey = 'medium';
    }
    return this.Gregorian.dateTimeFormats(this.bundle, wrapKey as FormatWidthType);
  }

  protected getSkeletonPattern(d: ZonedDateTime, skeleton: string): DateTimeNode[] {
    let plural: PluralType = 'other';
    // Determine plural category for each skeleton that requires it.
    switch (skeleton) {
    case 'MMMMW':
    {
      // TODO: implement 'W' and complete
      break;
    }

    case 'yw':
    {
      const week = coerceDecimal(d.getISOWeek());
      plural = this.internals.plurals.ordinal(this.bundle.language(), week.operands());
      break;
    }

    default:
      break;
    }

    const raw = this.Gregorian.availableFormats(this.bundle, plural, skeleton)
      || this.Gregorian.availableFormats(this.bundle, 'other', skeleton);
    return this.patternCache.get(raw);
  }

  protected getIntervalPattern(skeleton: string, field: DateTimePatternFieldType): DateTimeNode[] | undefined {
    const raw = this.Gregorian.intervalFormats(this.bundle, field, skeleton);
    return raw ? this.patternCache.get(raw) : undefined;
  }

  /**
   * Build a date pattern matcher for the given calendar type.
   */
  protected getCalendarMatcher(calendar: string): CalendarMatcher {
    let m = this.dateMatchers.get(calendar);
    if (m !== undefined) {
      return m;
    }

    const dm = new DatePatternMatcher();
    for (const k of CANONICAL_FIELDS) {
      const s = DateSkeleton.parse(k, this.preferredFlex, this.allowedFlex[0]);
      const p = parseDatePattern(k);
      dm.add(s, p);
    }

    // TODO: calendar switcher

    for (const k of FormatWidthValues) {
      // Indicate these skeletons are actually patterns
      let raw = this.Gregorian.dateFormats(this.bundle, k as FormatWidthType);
      let s = DateSkeleton.parsePattern(raw);
      let p = parseDatePattern(raw);
      dm.add(s, p);

      raw = this.Gregorian.timeFormats(this.bundle, k as FormatWidthType);
      s = DateSkeleton.parsePattern(raw);
      p = parseDatePattern(raw);
      dm.add(s, p);
    }

    // Skeletons are abstractions of the pattern, so no need to fetch
    // the actual patterns from the bundle yet.
    for (const k of GregorianInfo.availableFormats) {
      const s = DateSkeleton.parse(k, this.preferredFlex, this.allowedFlex[0]);
      dm.add(s);
    }
    for (const k of GregorianInfo.pluralAvailableFormats) {
      const s = DateSkeleton.parse(k, this.preferredFlex, this.allowedFlex[0]);
      dm.add(s);
    }

    m = { matcher: dm, cache: new LRU(this.cacheSize) };
    this.dateMatchers.set(calendar, m);
    return m;
  }

  protected getIntervalMatcher(calendar: string): IntervalMatcher {
    let m = this.intervalMatchers.get(calendar);
    if (m !== undefined) {
      return m;
    }

    const dm = new DatePatternMatcher();
    for (const k of GregorianInfo.intervalFormats) {
      const s = DateSkeleton.parse(k, this.preferredFlex, this.allowedFlex[0]);
      dm.add(s);
    }

    m = { matcher: dm, cache: new LRU(this.cacheSize) };
    this.intervalMatchers.set(calendar, m);
    return m;
  }

  protected defaultCalendar(): string {
    // TODO: use default calendar preference data
    return 'gregory';
  }
}
