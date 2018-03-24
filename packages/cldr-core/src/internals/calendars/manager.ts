import {
  GregorianInfo,
  FormatWidthType,
  FormatWidthValues,
  GregorianSchema,
  Plural,
  Schema,
} from '@phensley/cldr-schema';

import { timeData } from './autogen.timedata';
import { DateTimeNode, parseDatePattern, intervalPatternBoundary } from '../../parsing/patterns/date';
import { DateFormatOptions } from '../../common';
import { DateFormatRequest } from '../../common/private';
import { Internals } from '../../internals';
import { Bundle } from '../../resource';
import { DatePatternMatcher, DateSkeleton } from './matcher';
import { coerceDecimal, ZonedDateTime } from '../../types';
import { Cache } from '../../utils/cache';
import { LRU } from '../../utils/lru';

export interface DateSkeletons {
  // Date pattern that matched the skeleton
  date?: DateSkeleton;
  // Time pattern that matched the skeleton
  time?: DateSkeleton;
}

export interface DatePatterns {
  date?: DateTimeNode[];
  time?: DateTimeNode[];
}

export interface CalendarMatcher {
  matcher: DatePatternMatcher;
  cache: LRU<string, DatePatterns>;
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
  private matchers: LRU<string, CalendarMatcher>;
  private patternCache: Cache<DateTimeNode[]>;
  private allowedFlex: DateTimeNode[][];
  private preferredFlex: DateTimeNode[];

  constructor(
    readonly bundle: Bundle,
    readonly internals: Internals,
    readonly cacheSize: number = 50) {

    // Size this to number of calendars
    this.matchers = new LRU(10);

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
  getRequest(d: ZonedDateTime, options: DateFormatOptions): DateFormatRequest {
    const calendar = options.ca || this.defaultCalendar();
    // TODO: calendar support
    const [dateKey, timeKey, skelKey] = this.getPatternTypes(options);

    // TODO: default wrapper
    let wrapKey: string | undefined = options.wrap;
    const wrapper = this.Gregorian.dateTimeFormats(this.bundle, (wrapKey || 'short') as FormatWidthType);
    const req: DateFormatRequest = { wrapper };

    // Handle standard named patterns
    if (dateKey !== '') {
      const raw = this.Gregorian.dateFormats(this.bundle, dateKey as FormatWidthType);
      req.date = this.patternCache.get(raw);
    }
    if (timeKey !== '') {
      const raw = this.Gregorian.timeFormats(this.bundle, timeKey as FormatWidthType);
      req.time = this.patternCache.get(raw);
    }

    if (req.date || req.time) {
      if (req.date && req.time) {
        if (!wrapKey) {
          wrapKey = dateKey;
        }
        const raw = this.Gregorian.dateTimeFormats(this.bundle, wrapKey as FormatWidthType);
        req.wrapper = raw;
      }
      return req;
    }

    // Use skeleton to find best fit patterns.
    const { matcher, cache } = this.getCalendarMatcher(calendar);

    // Check if we've matched this skeleton before
    let entry = cache.get(skelKey);
    if (entry !== undefined) {
      req.date = entry.date;
      req.time = entry.time;
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
      date = matcher.adjust(tempDate, query);
      if (date.length === 0) {
        date = undefined;
      }
    }
    if (tquery && timeSkel) {
      const tempTime = timeSkel.pattern || this.getSkeletonPattern(d, timeSkel.skeleton);
      time = matcher.adjust(tempTime, tquery);
      if (time.length === 0) {
        time = undefined;
      }
    }

    entry = { date, time };
    // Remember this skeleton
    cache.set(skelKey, entry);

    req.date = entry.date;
    req.time = entry.time;

    // Determine wrapper using the date fields.
    if (!wrapKey && dateSkel && date && time) {
      wrapKey = 'short';
      const monthWidth = dateSkel.monthWidth();
      const hasWeekday = dateSkel.hasWeekday();
      if (monthWidth === 4) {
        wrapKey = hasWeekday ? 'full' : 'long';
      } else if (monthWidth === 3) {
        wrapKey = 'medium';
      }
      req.wrapper = this.Gregorian.dateTimeFormats(this.bundle, wrapKey as FormatWidthType);
    }

    return req;
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

  /**
   * Build a date pattern matcher for the given calendar type.
   */
  protected getCalendarMatcher(calendar: string): CalendarMatcher {
    let m = this.matchers.get(calendar);
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
    this.matchers.set(calendar, m);
    return m;
  }

  protected defaultCalendar(): string {
    // TODO: use default calendar preference data
    return 'gregory';
  }
}
