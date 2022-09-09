import { DateTimePatternFieldType } from '@phensley/cldr-types';
import { Cache } from '@phensley/cldr-utils';

import { Internals } from '../internals';
import { Bundle } from '../../resource';
import { DateFormatOptions, DateIntervalFormatOptions } from '../../common';
import { DateTimeNode } from '../../parsing/date';
import { CalendarDate } from '../../systems/calendars';
import { NumberParams } from '../../common/private';
import { CalendarPatterns, GregorianPatterns } from './patterns';
import { DateSkeleton } from './skeleton';
import { DateFormatRequest, DateIntervalFormatRequest } from './types';
import { Field } from './fields';

export class CalendarManager {
  private readonly patternCache: Cache<CalendarPatterns>;
  private readonly availableCalendars: Set<string>;

  constructor(private readonly bundle: Bundle, private readonly internals: Internals) {
    // calendars config array should always be non-empty
    this.availableCalendars = new Set(internals.config.calendars || /* istanbul ignore next */ []);
    const schema = internals.schema;
    this.patternCache = new Cache((calendar: string) => {
      if (this.availableCalendars.has(calendar)) {
        switch (calendar) {
          case 'buddhist':
            return new CalendarPatterns(bundle, internals, schema.Buddhist);
          case 'japanese':
            return new CalendarPatterns(bundle, internals, schema.Japanese);
          case 'persian':
            return new CalendarPatterns(bundle, internals, schema.Persian);
        }
      }
      return new GregorianPatterns(bundle, internals, schema.Gregorian);
    }, 20);
  }

  getCalendarPatterns(calendar: string): CalendarPatterns {
    return this.patternCache.get(calendar);
  }

  getDateFormatRequest(date: CalendarDate, options: DateFormatOptions, params: NumberParams): DateFormatRequest {
    const calendar = this.internals.calendars.selectCalendar(this.bundle, options.ca);
    const patterns = this.getCalendarPatterns(calendar);

    let dateKey = this.supportedOption(options.datetime || options.date);
    const timeKey = this.supportedOption(options.datetime || options.time);
    const wrapKey = this.supportedOption(options.wrap);
    let skelKey = options.skeleton || '';

    if (!dateKey && !timeKey && !skelKey) {
      dateKey = 'long';
    }

    const atTime = options.atTime === false ? false : true;

    let wrapper = '';
    if (wrapKey) {
      wrapper = patterns.getWrapperPattern(wrapKey, atTime);
    } else if (dateKey && timeKey) {
      wrapper = patterns.getWrapperPattern(dateKey, atTime);
    }

    const req: DateFormatRequest = { wrapper, params };
    if (dateKey) {
      req.date = patterns.getDatePattern(dateKey);
    }
    if (timeKey) {
      req.time = patterns.getTimePattern(timeKey);
    }

    let query: DateSkeleton;

    // We have both standard formats, we're done
    if (req.date && req.time) {
      return req;
    }

    // We have at least a date/time standard format.
    if (req.date || req.time) {
      // If no skeleton specified, we're done
      if (!skelKey) {
        return req;
      }

      // We have a standard date or time pattern along with a skeleton.
      // We split the skeleton into date/time parts, then use the one
      // that doesn't conflict with the specified standard format
      query = patterns.parseSkeleton(skelKey);

      // Use the part of the skeleton that does not conflict
      const time = query.split();
      if (req.date) {
        query = time;
      }

      // Update skeleton key with only the used fields
      skelKey = query.canonical();
    } else {
      // No standard format specified, so just parse the skeleton
      query = patterns.parseSkeleton(skelKey);
    }

    // TODO: skeleton caching disabled for now due to mixed formats
    // Check if we've cached the patterns for this skeleton before
    // let entry = patterns.getCachedSkeletonRequest(skelKey);
    // if (entry) {
    //   req.date = entry.date;
    //   req.time = entry.time;
    //   if (!wrapKey && entry.dateSkel && req.date && req.time) {
    //     // If wrapper not explicitly requested, select based on skeleton date fields.
    //     req.wrapper = this.selectWrapper(patterns, entry.dateSkel, req.date);
    //   }
    //   return req;
    // }

    // Perform a best-fit match on the skeleton

    let timeQuery: DateSkeleton | undefined;
    let dateSkel: DateSkeleton | undefined;
    let timeSkel: DateSkeleton | undefined;

    // Check if skeleton specifies date or time fields, or both.
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

    if (dateSkel) {
      req.date = this.getAvailablePattern(patterns, date, query, dateSkel, params);
    }
    if (timeQuery && timeSkel) {
      req.time = this.getAvailablePattern(patterns, date, timeQuery, timeSkel, params);
    }

    if (!wrapKey) {
      if (dateSkel && req.date && req.time) {
        // Select wrapper based on fields in date skeleton
        req.wrapper = this.selectWrapper(patterns, dateSkel, req.date, atTime);
      } else {
        // Select wrapper based on width of standard date format
        req.wrapper = patterns.getWrapperPattern(dateKey || 'short', atTime);
      }
    }

    // TODO: skeleton caching disabled for now due to mixed formats
    // entry = { date: req.date, time: req.time, dateSkel: dateSkel };
    // patterns.setCachedSkeletonRequest(skelKey, entry);
    return req;
  }

  /**
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
   */
  getDateIntervalFormatRequest(
    calendar: string,
    start: CalendarDate,
    fieldDiff: DateTimePatternFieldType,
    options: DateIntervalFormatOptions,
    params: NumberParams,
  ): DateIntervalFormatRequest {
    const patterns = this.getCalendarPatterns(calendar);

    const dateDiffers = 'yMd'.indexOf(fieldDiff) !== -1;

    const wrapper = patterns.getIntervalFallback();
    const req: DateIntervalFormatRequest = { params, wrapper };

    let origSkeleton = options.skeleton;
    if (!origSkeleton) {
      if (dateDiffers && options.date) {
        origSkeleton = options.date;
      } else {
        origSkeleton = options.time;
      }
    }

    // If the skeleton is still undefined, select a reasonable default
    if (!origSkeleton) {
      origSkeleton = dateDiffers ? 'yMMMd' : 'hmsa';
    }

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
      if (fieldDiff === 'y') {
        skeleton = `yMd${skeleton}`;
      } else if (fieldDiff === 'M') {
        skeleton = `Md${skeleton}`;
      } else {
        skeleton = `d${skeleton}`;
      }
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
      if (match) {
        const pattern = patterns.getIntervalPattern(fieldDiff, match.skeleton);
        /* istanbul ignore else */
        if (pattern.length) {
          entry.range = patterns.adjustPattern(pattern, query, params.symbols.decimal);
        }
      }
    }

    patterns.setCachedIntervalRequest(cacheKey, entry);
    req.date = entry.date;
    req.range = entry.range;
    return req;
  }

  private matchAvailablePattern(
    patterns: CalendarPatterns,
    date: CalendarDate,
    query: DateSkeleton,
    params: NumberParams,
  ): DateTimeNode[] | undefined {
    const match = patterns.matchAvailable(query);
    return this.getAvailablePattern(patterns, date, query, match, params);
  }

  private getAvailablePattern(
    patterns: CalendarPatterns,
    date: CalendarDate,
    query: DateSkeleton,
    match: DateSkeleton,
    params: NumberParams,
  ): DateTimeNode[] | undefined {
    const pattern = patterns.getAvailablePattern(date, match);
    /* istanbul ignore else */
    if (pattern.length) {
      return patterns.adjustPattern(pattern, query, params.symbols.decimal);
    }
    // Base standard calendar formats are (currently) always defined.
    /* istanbul ignore next */
    return undefined;
  }

  /**
   * Select appropriate wrapper based on fields in the date skeleton.
   */
  private selectWrapper(
    patterns: CalendarPatterns,
    dateSkel: DateSkeleton,
    _date: DateTimeNode[],
    atTime: boolean,
  ): string {
    let wrapKey = 'short';
    const monthWidth = dateSkel.monthWidth();
    const hasWeekday = dateSkel.has(Field.WEEKDAY);
    if (monthWidth === 4) {
      wrapKey = hasWeekday ? 'full' : 'long';
    } else if (monthWidth === 3) {
      wrapKey = 'medium';
    }
    return patterns.getWrapperPattern(wrapKey, atTime);
  }

  private supportedOption(key?: string): string {
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
