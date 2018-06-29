import { Internals } from '../internals';
import { Bundle } from '../../resource';
import { Cache } from '../../utils/cache';
import { DateFormatOptions, DateIntervalFormatOptions } from '../../common';
import { DateTimeNode } from '../../parsing/patterns/date';
import { CalendarDate } from '../../systems/calendars';
import { NumberParams } from '../../common/private';
import { CalendarPatterns, GregorianPatterns } from './patterns';
import { DateSkeleton } from './skeleton';
import { DateFormatRequest, DateIntervalFormatRequest } from './types';
import { Field } from './fields';
import { DateTimePatternFieldType } from '@phensley/cldr-schema';

export class CalendarManager {

  readonly patternCache: Cache<CalendarPatterns>;

  constructor(
    readonly bundle: Bundle,
    readonly internals: Internals
  ) {
    const schema = internals.schema;
    this.patternCache = new Cache((calendar: string) => {
      switch (calendar) {
      case 'buddhist':
        return new CalendarPatterns(bundle, internals, schema.Buddhist);
      case 'japanese':
        return new CalendarPatterns(bundle, internals, schema.Japanese);
      case 'persian':
        return new CalendarPatterns(bundle, internals, schema.Persian);
      default:
        return new GregorianPatterns(bundle, internals, schema.Gregorian);
      }
    }, 20);
  }

  getCalendarPatterns(calendar: string): CalendarPatterns {
    return this.patternCache.get(calendar);
  }

  getDateFormatRequest(date: CalendarDate, options: DateFormatOptions, params: NumberParams): DateFormatRequest {
    const calendar = this.internals.calendars.selectCalendar(this.bundle, options.ca);
    const patterns = this.getCalendarPatterns(calendar);

    // TODO: default if none set

    let dateKey = this.supportedOption(options.datetime || options.date);
    const timeKey = this.supportedOption(options.datetime || options.time);
    const wrapKey = this.supportedOption(options.wrap);
    const skelKey = options.skeleton || '';

    if (!dateKey && !timeKey && !skelKey) {
      dateKey = 'long';
    }

    let wrapper = '';
    if (wrapKey) {
      wrapper = patterns.getWrapperPattern(wrapKey);
    } else if (dateKey && timeKey) {
      wrapper = patterns.getWrapperPattern(dateKey);
    }

    const req: DateFormatRequest = { wrapper, params };
    if (dateKey) {
      req.date = patterns.getDatePattern(dateKey);
    }
    if (timeKey) {
      req.time = patterns.getTimePattern(timeKey);
    }

    // Standard format
    if (req.date || req.time) {
      return req;
    }

    // Perform a best-fit match on the skeleton

    // Check if we've cached the patterns fo this skeleton before
    let entry = patterns.getCachedSkeletonRequest(skelKey);
    if (entry) {
      req.date = entry.date;
      req.time = entry.time;
      if (!wrapKey && entry.dateSkel && req.date && req.time) {
        // If wrapper not explicitly requested, select based on skeleton date fields.
        req.wrapper = this.selectWrapper(patterns, entry.dateSkel, req.date);
      }
      return req;
    }

    let timeQuery: DateSkeleton | undefined;
    let dateSkel: DateSkeleton | undefined;
    let timeSkel: DateSkeleton | undefined;

    // Check if skeleton specifies date or time fields, or both.
    const query = patterns.parseSkeleton(skelKey);
    if (query.compound()) {
      // Separate into a date and a time skeletons.
      timeQuery = query.split();
      dateSkel = patterns.matchAvailable(query);
      timeSkel = patterns.matchAvailable(timeQuery);
    } else if (query.isDate) {
      dateSkel = patterns.matchAvailable(query);
    } else {
      timeQuery = query;
      timeSkel = patterns.matchAvailable(query);
    }

    req.date = dateSkel ?
      this.getAvailablePattern(patterns, date, query, dateSkel, params) : undefined;

    req.time = timeQuery && timeSkel ?
      this.getAvailablePattern(patterns, date, timeQuery, timeSkel, params) : undefined;

    if (!wrapKey && dateSkel && req.date && req.time) {
      req.wrapper = this.selectWrapper(patterns, dateSkel, req.date);
    }

    entry = { date: req.date, time: req.time, dateSkel: dateSkel };
    patterns.setCachedSkeletonRequest(skelKey, entry);
    return req;
  }

  /**
   *
   * Best-fit match an input skeleton. The skeleton can contain both date and
   * time fields.
   *
   * The field of greatest difference between the start and end dates can be
   * either a date or time field.
   *
   * Given this we need to cover the following cases:
   *
   * 1. Input skeleton requests both date and time fields.
   *  a. "yMd" same: split skeleton, format date standalone, followed by time range.
   *  b. "yMd" differ: format full start / end with fallback format.
   *
   * 2. Input skeleton requests date fields only:
   *  a. "yMd" same: format date standalone
   *  b. "yMd" differ: select and format date range
   *
   * 3. Input skeleton requests time fields only:
   *  a. "yMd" same, "ahms" same: format time standalone
   *  b. "yMd" same, "ahms" differ: select and format time range.
   *  c. "yMd" differ: prepend "yMd" to skeleton and go to (1a).
   *
   */
  getDateIntervalFormatRequest(
    calendar: string,
    start: CalendarDate,
    fieldDiff: DateTimePatternFieldType, options: DateIntervalFormatOptions,
  params: NumberParams): DateIntervalFormatRequest {

    const patterns = this.getCalendarPatterns(calendar);

    const dateDiffers = 'yMd'.indexOf(fieldDiff) !== -1;

    const wrapper = patterns.getIntervalFallback();
    const req: DateIntervalFormatRequest = { params, wrapper };

    const origSkeleton = options.skeleton || 'yMd';
    let skeleton = origSkeleton;

    // Cache key consists of the input skeleton and the field of greatest difference between
    // the start and end dates.
    const cacheKey = `${skeleton}\t${fieldDiff}`;
    let entry = patterns.getCachedIntervalRequest(cacheKey);
    if (entry) {
      req.date = entry.date;
      req.range = entry.range;
      req.skeleton = entry.skeleton;
      return req;
    }

    entry = {};

    let query = patterns.parseSkeleton(skeleton);

    // TODO: Augment skeleton to ensure context. day without month, minute without hour, etc.

    let standalone = fieldDiff === 's' || (query.isDate && !dateDiffers) || (query.isTime && dateDiffers);

    if (!standalone) {
      if (query.has(Field.DAY) && !query.has(Field.MONTH)) {
        skeleton = `M${skeleton}`;
      }
      if (query.has(Field.MINUTE) && !query.has(Field.HOUR)) {
        skeleton = `j${skeleton}`;
      }
    }

    if (!query.isDate && dateDiffers) {
      // 3c. prepend "yMd" and proceed
      skeleton = `yMd${skeleton}`;
    }

    if (origSkeleton !== skeleton) {
      query = patterns.parseSkeleton(skeleton);
    }

    let timeQuery: DateSkeleton | undefined;

    // If both date and time fields are requested, we have two choices:
    // a. date fields are the same:  "<date>, <time start> - <time end>"
    // b. date fields differ, format full range: "<start> - <end>"
    if (query.compound()) {
      if (dateDiffers) {
        // 1b. format start and end dates with fallback: "<start> - <end>"
        req.skeleton = skeleton;
        entry.skeleton = skeleton;
        patterns.setCachedIntervalRequest(cacheKey, entry);
        return req;
      }

      // 1a. split skeleton, format date standalone ..
      timeQuery = query.split();
      entry.date = this.matchAvailablePattern(patterns, start, query, params);

      // ... followed by time range: "<date>, <time start> - <time end>"
      query = timeQuery;
    }

    // standalone: in certain cases we cannot display a range.
    standalone = fieldDiff === 's' || (query.isDate && !dateDiffers) || (query.isTime && dateDiffers);
    if (standalone) {
      // 2a. format date standalone: "<date>"
      // 3a. format time standalone: "<time>"
      entry.date = this.matchAvailablePattern(patterns, start, query, params);
    } else {
      // 2b. format date interval: "<date start> - <date end>"
      // 3b. format time interval: "<time start> - <time end>"
      const match = patterns.matchInterval(query, fieldDiff);
      const pattern = patterns.getIntervalPattern(fieldDiff, match.skeleton);
      entry.range = pattern.length === 0 ? undefined : patterns.adjustPattern(pattern, query, params.symbols.decimal);
    }

    patterns.setCachedIntervalRequest(cacheKey, entry);
    req.date = entry.date;
    req.range = entry.range;
    return req;
  }

  protected matchAvailablePattern(patterns: CalendarPatterns, date: CalendarDate,
      query: DateSkeleton, params: NumberParams): DateTimeNode[] | undefined {
    const match = patterns.matchAvailable(query);
    return this.getAvailablePattern(patterns, date, query, match, params);
  }

  protected getAvailablePattern(patterns: CalendarPatterns, date: CalendarDate,
      query: DateSkeleton, match: DateSkeleton, params: NumberParams): DateTimeNode[] | undefined {
    const pattern = patterns.getAvailablePattern(date, match);
    return pattern.length === 0 ? undefined : patterns.adjustPattern(pattern, query, params.symbols.decimal);
  }

  /**
   * Select appropriate wrapper based on fields in the date skeleton.
   */
  protected selectWrapper(
    patterns: CalendarPatterns, dateSkel: DateSkeleton, date: DateTimeNode[]): string {

    let wrapKey = 'short';
    const monthWidth = dateSkel.monthWidth();
    const hasWeekday = dateSkel.has(Field.WEEKDAY);
    if (monthWidth === 4) {
      wrapKey = hasWeekday ? 'full' : 'long';
    } else if (monthWidth === 3) {
      wrapKey = 'medium';
    }
    return patterns.getWrapperPattern(wrapKey);
  }

  protected supportedOption(key?: string): string {
    switch (key) {
      case 'full':
      case 'long':
      case 'medium':
      case 'short':
        return key;
      default:
        return '';
    }
  }
}
