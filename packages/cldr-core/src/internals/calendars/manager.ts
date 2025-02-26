import { DateTimePatternField, DateTimePatternFieldType } from '@phensley/cldr-types';
import { Cache } from '@phensley/cldr-utils';

import { Internals } from '../internals';
import { Bundle } from '../../resource';
import { DateFormatOptions, DateIntervalFormatOptions } from '../../common';
import { DateTimeNode } from '../../parsing/date';
import { CalendarDate } from '../../systems/calendars';
import { NumberParams } from '../../common/private';
import { CalendarPatterns, GregorianPatterns } from './patterns';
import { DateSkeleton, SkeletonField } from './skeleton';
import { DateFormatRequest, DateIntervalFormatRequest } from './types';
import { Field } from './fields';

const maskedFOVDFields: Field[] = [
  Field.ERA,
  Field.YEAR,
  Field.MONTH,
  Field.DAY,
  Field.DAYPERIOD,
  Field.HOUR,
  Field.MINUTE,
  Field.SECOND,
];

const minutes = (d: CalendarDate): number => d.hourOfDay() * 60 + d.minute();

export class CalendarManager {
  private readonly patternCache: Cache<CalendarPatterns>;
  private readonly availableCalendars: Set<string>;

  constructor(
    private readonly bundle: Bundle,
    private readonly internals: Internals,
  ) {
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
   * Formats datetime intervals.
   *
   * NOTE: The ICU implementation of CLDR datetime range formatting
   * contains inconsistent behavior (see code at end of comment below).
   *
   * The skeleton data for interval formatting consists of a series of
   * separate date and time patterns. No interval skeletons / formats
   * contain both date and time fields.
   *
   * For example, the data might contain the following:
   *
   *  ['y', 'yM', 'yMd', 'h', 'hm', 'H', 'Hm']
   *
   * However a caller can pass input skeleton containing a mix of date and
   * time fields. We split this skeleton into separate date and time
   * skeletons, and perform formatting by considering the possibilities below.
   *
   * Variables:
   *
   *   start         = start datetime
   *   end           = end datetime
   *   skeleton      = input skeleton
   *   fovd          = fieldOfVisualDifference(start, end)
   *   date_differs  = fovd in ('era', 'year', 'month', 'day')
   *   time_differs  = fovd in ('dayperiod', 'hour', 'minute')
   *   equal         = fovd in ('second', undefined)
   *
   * Formatting Rules:
   *
   * 1. Skeleton requests both date and time fields
   *
   *   a. IF time_differs, format date followed by time range
   *      e.g. "date, time0 - time 1"
   *
   *   b. ELSE IF date_differs, format generic fallback
   *      e.g. "date0, time0 - date1, time1"
   *
   *   c. ELSE format the date + time standalone
   *      e.g. "date0, time0"
   *
   * 2: Skeleton only requests date fields
   *
   *   a. IF date_differs, format date range
   *      e.g. "date0 - date1"
   *
   *   b. ELSE format date standalone
   *
   * 3: Skeleton only requests time fields
   *
   *   a. IF time_differs, format time range
   *      e.g. "time0 - time1"
   *
   *   b. ELSE format time standalone
   *
   * ========================================================
   *
   * Example of inconsistency of ICU range formatting.
   * The output was produced using Node 23.7.0 and ICU 74.
   * ICU4J version 75 produces the same output.
   *
   *     const OPTS = [
   *       { day: 'numeric' },
   *       { day: 'numeric', minute: '2-digit' }
   *     ];
   *     const start = new Date(Date.UTC(2007, 0, 1, 10, 12, 0));
   *     const end = new Date(Date.UTC(2008, 0, 2, 11, 13, 0));
   *     for (let i = 0; i < OPTS.length; i++) {
   *       const opts = OPTS[i];
   *       const fmt = new Intl.DateTimeFormat('en', opts);
   *       console.log(fmt.formatRange(start, end));
   *     }
   *
   * This code formats two dates two different ways:
   *
   *   2007-Jan-01 10:12
   *   2008-Jan-02 11:13
   *
   * 1. Display the day: { day: 'numeric' }
   *
   *  ICU auto-expands the selected pattern to include the year
   *  and month:
   *
   *    "1/1/2007 – 1/2/2008"
   *
   *  This adds context needed to understand the two
   *  dates are separated by 367 days.
   *
   * 2. Display day and minute: { day: 'numeric', minute: '2-digit' }
   *
   *  No pattern expansion occurs, we get only what we
   *  requested. The output is highly ambiguous since it's
   *  missing year, month, and hour fields:
   *
   *    "1, 12 – 2, 13"
   *
   * Additional context is added in one case but not in the other.
   *
   * IMO it makes more sense to leave the input skeleton as untouched
   * as possible, leaving it up to the caller to decide which
   * fields to request.
   */
  getDateIntervalFormatRequest(
    calendar: string,
    start: CalendarDate,
    end: CalendarDate,
    options: DateIntervalFormatOptions,
    params: NumberParams,
  ): DateIntervalFormatRequest {
    const patterns = this.getCalendarPatterns(calendar);
    const wrapper = patterns.getIntervalFallback();
    const req: DateIntervalFormatRequest = { params, wrapper };

    // Determine whether the largest field of visual difference (fovd)
    // is a date or time field, or neither.  Note that interval patterns
    // in the CLDR data do not include seconds, so we consider dates
    // that only differ in seconds to be equivalent.
    const fovd = start.fieldOfVisualDifference(end) || 's';
    const dateDiffers = 'GyMd'.indexOf(fovd) !== -1;
    const timeDiffers = 'BahHm'.indexOf(fovd) !== -1;

    // If main skeleton input is not used, select either date or
    // time based on whether the date or time differ.
    let skeleton = options.skeleton;
    if (!skeleton) {
      if (dateDiffers && options.date) {
        skeleton = options.date;
      } else {
        skeleton = options.time;
      }
    }

    // If no skeleton is defined, choose a simple default
    let defaulted = false;
    if (!skeleton) {
      skeleton = dateDiffers ? 'yMMMd' : 'jm';
      defaulted = true;
    }

    // At this point the skeleton contains at least one field.

    // Parse the input skeleton.
    let query = patterns.parseSkeleton(skeleton);

    // If we are not using a default pattern, check a few cases and
    // augment the skeleton accordingly.
    if (!defaulted) {
      // In non-strict mode, if the query requested time fields only
      // and the date fields differ, insert some context.
      if (!options.strict && dateDiffers && !query.isDate) {
        skeleton = `yMMMd` + skeleton;
        query = patterns.parseSkeleton(skeleton);
      }

      // Interval skeletons for bare seconds 's' and minutes 'm' do not
      // exist in the CLDR data. We fill in the gap to ensure we at least
      // match on the correct hour field for the current locale.
      const largest = this.largestSkeletonField(query);
      if ('sm'.indexOf(largest) !== -1) {
        skeleton = (largest === 's' ? 'jm' : 'j') + skeleton;
        query = patterns.parseSkeleton(skeleton);
      }
    }

    // BEGIN formatting rules.

    // RULE 1. Skeleton contains both date and time fields
    if (query.compound()) {
      if (timeDiffers) {
        // RULE 1a. IF time_differs, format date followed by time range
        const timeQuery = query.split();
        req.date = this.matchAvailablePattern(patterns, start, query, params);
        query = timeQuery;
        // ... (1a) intentional fall through to format date + time range
      } else if (dateDiffers) {
        // RULE 1b. ELSE IF date_differs, format generic fallback
        req.skeleton = skeleton;
        return req;
      } else {
        // RULE 1c. ELSE format the date + time standalone
        const timeQuery = query.split();
        if (query.isDate) {
          req.date = this.matchAvailablePattern(patterns, start, query, params);
        }
        if (timeQuery.isTime) {
          req.time = this.matchAvailablePattern(patterns, start, timeQuery, params);
        }
        return req;
      }
    }

    // RULE 2: skeleton only contains date fields
    // RULE 2b ELSE format date standalone (!dateDiffers)
    if (!dateDiffers && !query.isTime) {
      req.date = this.matchAvailablePattern(patterns, start, query, params);
      return req;
    }

    // Something differs in date or time fields
    if (fovd !== 's') {
      // RULE 2a IF dateDiffers, format date range
      // RULE 3a IF timeDiffers, format time range
      const match = patterns.matchInterval(query);
      if (match && match.data) {
        // Compute masked field of visual difference using the found skeleton.
        const fovd = this.maskedFOVD(start, end, match.skeleton);

        // Use fovd to select final pattern. Since it was masked by the matched
        // skeleton, the fovd should completely cover the set of patterns in the data.
        let pattern = match.data.patterns[fovd];

        const parsedPattern = this.internals.calendars.parseDatePattern(pattern || '');
        /* istanbul ignore else */
        if (parsedPattern.length) {
          req.range = patterns.adjustPattern(parsedPattern, query, params.symbols.decimal);
        }
      }
    } else {
      // RULE 3b ELSE format time standalone
      req.date = this.matchAvailablePattern(patterns, start, query, params);
    }

    return req;
  }

  largestSkeletonField(skeleton: DateSkeleton): DateTimePatternFieldType {
    for (const field of maskedFOVDFields) {
      const info = skeleton.info[field];
      if (info) {
        return info.field as DateTimePatternFieldType;
      }
    }
    return DateTimePatternField.SECOND;
  }

  maskedFOVD(start: CalendarDate, end: CalendarDate, skeleton: DateSkeleton): DateTimePatternFieldType {
    let smallest: SkeletonField | undefined;
    for (const field of maskedFOVDFields) {
      const info = skeleton.info[field];
      if (!info) {
        continue;
      }

      smallest = info;
      switch (field) {
        case Field.ERA:
          if (start.era() !== end.era()) {
            return DateTimePatternField.ERA;
          }
          break;

        case Field.YEAR:
          if (start.year() !== end.year()) {
            return DateTimePatternField.YEAR;
          }
          break;

        case Field.MONTH:
          if (start.month() !== end.month()) {
            return DateTimePatternField.MONTH;
          }
          break;

        case Field.DAY:
          if (start.dayOfMonth() !== end.dayOfMonth()) {
            return DateTimePatternField.DAY;
          }
          break;

        case Field.DAYPERIOD:
          switch (info.field) {
            case 'a': // dayperiod
            case 'b': // dayperiod extended (resolve to 'a' for now)
              if (start.isAM() !== end.isAM()) {
                return DateTimePatternField.DAYPERIOD;
              }
              break;
            case 'B': // dayperiod flex
              if (this.dayperiodFlex(start) !== this.dayperiodFlex(end)) {
                return DateTimePatternField.DAYPERIOD_FLEX;
              }
              break;
          }
          break;

        case Field.HOUR:
          switch (info.field) {
            case 'h': // hour 1-12
            case 'K': // hour 0-11
              if (start.hour() !== end.hour()) {
                return DateTimePatternField.HOUR12;
              }
              break;

            case 'H': // hour 0-23
            case 'k': // hour 1-24
              if (start.hourOfDay() !== end.hourOfDay()) {
                return DateTimePatternField.HOUR24;
              }
              break;
          }
          break;

        case Field.MINUTE:
        case Field.SECOND:
          if (start.minute() !== end.minute()) {
            return DateTimePatternField.MINUTE;
          }
          break;
      }
    }

    // If we exhaust all fields of the skeleton, the two dates are equivalent
    // with respect to the fields masked by the skeleton. We return the smallest
    // field by default.

    return smallest ? (smallest.field as DateTimePatternFieldType) : DateTimePatternField.MINUTE;
  }

  private dayperiodFlex(date: CalendarDate): string {
    return this.internals.calendars.flexDayPeriod(this.bundle, minutes(date)) || '';
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
