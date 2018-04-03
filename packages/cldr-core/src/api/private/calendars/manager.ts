import {
  DateTimePatternFieldType,
  GregorianInfo,
  FormatWidthType,
  FormatWidthValues,
  GregorianSchema,
  Plural,
  Schema
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

export interface CalendarMatcher {
  matcher: DatePatternMatcher;
  cache: LRU<string, DatePatterns>;
}

export interface IntervalMatcher {
  matcher: DatePatternMatcher;
  cache: LRU<string, DateTimeNode[]>;
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

  getIntervalRequest(start: ZonedDateTime, end: ZonedDateTime,
      options: DateIntervalFormatOptions, params: NumberParams): DateIntervalFormatRequest {
    const calendar = options.ca || this.defaultCalendar();
    const field = start.fieldOfGreatestDifference(end);
    const skeleton = options.skeleton || 'yMd';
    const wrapper = this.Gregorian.intervalFormatFallback(this.bundle);

    const req: DateIntervalFormatRequest = { params, wrapper };

    const { matcher, cache } = this.getIntervalMatcher(calendar);

    // Check cache if this combination of skeleton / field of greatest difference exists.
    const key = `${skeleton}\t${field}`;
    let pattern = cache.get(key);
    if (pattern !== undefined) {
      req.pattern = pattern;
      return req;
    }

    // Use skeleton to find best fit patterns.
    const query = DateSkeleton.parse(skeleton, this.preferredFlex, this.allowedFlex[0]);
    if (query.compound()) {
      // We cannot format an interval containing date and time fields. Fall back to
      // default.
      return req;
    }

    const skel = matcher.match(query);
    if (skel) {
      pattern = this.getIntervalPattern(skel.skeleton, field);
      if (pattern === undefined) {
        // Fallback
        return req;
      }
      pattern = matcher.adjust(pattern, query, params.symbols.decimal);
    }

    if (pattern) {
      // Remember this pattern for next time
      cache.set(key, pattern);
      return { pattern, params, wrapper };
    }
    // Fallback
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
    let plural: Plural | undefined;
    // Determine plural category for each skeleton that requires it.
    switch (skeleton) {
    case 'MMMMW':
    {
      plural = Plural.OTHER;
      // TODO: implement 'W' and complete
      break;
    }
    case 'yw':
    {
      plural = Plural.OTHER;
      const week = coerceDecimal(d.getISOWeek());
      plural = this.internals.plurals.ordinal(this.bundle.language(), week.operands());
      break;
    }
    default:
      break;
    }

    let raw = '';
    if (plural !== undefined) {
      raw = this.Gregorian.pluralAvailableFormats(this.bundle, skeleton, plural);
    } else {
      raw = this.Gregorian.availableFormats(this.bundle, skeleton);
    }
    return this.patternCache.get(raw);
  }

  protected getIntervalPattern(skeleton: string, field: DateTimePatternFieldType): DateTimeNode[] | undefined {
    const formats = this.Gregorian.intervalFormats(skeleton);
    let raw = '';
    if (formats) {
      raw = formats.field(this.bundle, field);
    }
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
