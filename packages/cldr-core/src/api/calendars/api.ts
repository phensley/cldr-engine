import { DateFieldType, DateTimePatternFieldType, DayPeriod, Schema } from '@phensley/cldr-schema';
import { Calendars } from '../api';
import { Bundle } from '../../resource';

import {
  DateFormatOptions,
  DateIntervalFormatOptions,
  DateRawFormatOptions,
  RelativeTimeFormatOptions,
  UnixEpochTime
} from '../../common';

import { Internals } from '../../internals';

import {
  BuddhistDate,
  CalendarDate,
  CalendarFromUnixEpoch,
  CalendarType,
  GregorianDate,
  ISO8601Date,
  JapaneseDate,
  PersianDate,
} from '../../systems/calendars';

import { DecimalArg } from '../../types/numbers';
import { Part } from '../../types';

import { CalendarManager } from '../../internals/calendars/manager';
import { PartsRenderer, Renderer, StringRenderer } from '../../utils/render';
import { PrivateApiImpl } from '../private';

const DEFAULT_OPTIONS: DateFormatOptions = { date: 'full' };
const DEFAULT_INTERVAL_OPTIONS: DateIntervalFormatOptions = { skeleton: 'yMd' };
const DEFAULT_RAW_OPTIONS: DateRawFormatOptions = { };
const DEFAULT_RELTIME_OPTIONS: RelativeTimeFormatOptions = { width: 'wide' };

export class CalendarsImpl implements Calendars {

  readonly manager: CalendarManager;
  readonly firstDay: number;
  readonly minDays: number;

  constructor(
    protected readonly bundle: Bundle,
    protected readonly internals: Internals,
    protected readonly privateApi: PrivateApiImpl
  ) {
    this.manager = new CalendarManager(bundle, internals);
    const region = bundle.region();
    this.firstDay = internals.calendars.weekFirstDay(region);
    this.minDays = internals.calendars.weekMinDays(region);
  }

  /**
   * @alpha
   */
  dayPeriods(type?: CalendarType): { [x: string]: string } {
    const calendar = this.internals.calendars.selectCalendar(this.bundle, type);
    const patterns = this.manager.getCalendarPatterns(calendar);
    return patterns.dayPeriods();
  }

  /**
   * @alpha
   */
  months(type?: CalendarType): { [x: string]: string } {
    const calendar = this.internals.calendars.selectCalendar(this.bundle, type);
    const patterns = this.manager.getCalendarPatterns(calendar);
    return patterns.months();
  }

  /**
   * @alpha
   */
  quarters(type?: CalendarType): { [x: string]: string } {
    const calendar = this.internals.calendars.selectCalendar(this.bundle, type);
    const patterns = this.manager.getCalendarPatterns(calendar);
    return patterns.quarters();
  }

  /**
   * @alpha
   */
  weekdays(type?: CalendarType): { [x: string]: string } {
    const calendar = this.internals.calendars.selectCalendar(this.bundle, type);
    const patterns = this.manager.getCalendarPatterns(calendar);
    return patterns.weekdays();
  }

  /**
   * Convert the given date to the Buddhist calendar.
   */
  toBuddhistDate(date: CalendarDate | UnixEpochTime): BuddhistDate {
    return this.convertDate(BuddhistDate.fromUnixEpoch, date);
  }

  /**
   * Convert the given date to the Gregorian calendar.
   */
  toGregorianDate(date: CalendarDate | UnixEpochTime): GregorianDate {
    return this.convertDate(GregorianDate.fromUnixEpoch, date);
  }

  /**
   * Convert the given date to the ISO-8601 calendar.
   */
  toISO8601Date(date: CalendarDate | UnixEpochTime): ISO8601Date {
    return this.convertDate(ISO8601Date.fromUnixEpoch, date);
  }

  /**
   * Convert the given date to the Japanese calendar.
   */
  toJapaneseDate(date: CalendarDate | UnixEpochTime): JapaneseDate {
    return this.convertDate(JapaneseDate.fromUnixEpoch, date);
  }

  /**
   * Convert the given date to the Persian calendar.
   */
  toPersianDate(date: CalendarDate | UnixEpochTime): PersianDate {
    return this.convertDate(PersianDate.fromUnixEpoch, date);
  }

  /**
   * Find the field of greatest difference between two dates. This can be used by applications
   * to select an appropriate skeleton for date interval formatting.
   */
  fieldOfGreatestDifference(a: CalendarDate, b: CalendarDate): DateTimePatternFieldType {
    const zoneId = a.timeZoneId();
    if (a.type() !== b.type() || zoneId === b.timeZoneId()) {
      b = this.convertDateTo(a.type(), b, zoneId);
    }
    return a.fieldOfGreatestDifference(b);
  }

  /**
   * Format a calendar date to string using the given options.
   */
  formatDate(date: CalendarDate | UnixEpochTime, options?: DateFormatOptions): string {
    return this._formatDate(new StringRenderer(), date, options);
  }

  /**
   * Format a calendar date to a parts array using the given options.
   */
  formatDateToParts(date: CalendarDate | UnixEpochTime, options?: DateFormatOptions): Part[] {
    return this._formatDate(new PartsRenderer(), date, options);
  }

  formatDateInterval(start: CalendarDate | UnixEpochTime, end: CalendarDate | UnixEpochTime,
      options?: DateIntervalFormatOptions): string {
    return this._formatInterval(new StringRenderer(), start, end, options);
  }

  formatDateIntervalToParts(start: CalendarDate | UnixEpochTime, end: CalendarDate | UnixEpochTime,
      options?: DateIntervalFormatOptions): Part[] {
    return this._formatInterval(new PartsRenderer(), start, end, options);
  }

  formatRelativeTime(start: CalendarDate | UnixEpochTime, end: CalendarDate | UnixEpochTime,
      options?: RelativeTimeFormatOptions): string {
    options = options || DEFAULT_RELTIME_OPTIONS;
    const params = this.privateApi.getNumberParams(options.nu);
    const calendar = this.internals.calendars.selectCalendar(this.bundle);
    start = this.convertDateTo(calendar, start);
    end = this.convertDateTo(calendar, end, start.timeZoneId());
    return this.internals.dateFields.formatRelativeTime(
      this.bundle, start, end, options, params);
  }

  formatRelativeTimeField(value: DecimalArg, field: DateFieldType, options?: RelativeTimeFormatOptions): string {
    options = options || DEFAULT_RELTIME_OPTIONS;
    const params = this.privateApi.getNumberParams(options.nu);
    return this.internals.dateFields.formatRelativeTimeField(
      this.bundle, value, field, options, params);
  }

  /**
   * Format a raw date pattern. Note: This should not be used, but is available for debugging or
   * extreme cases where an application must implement a custom format.
   */
  formatDateRaw(date: CalendarDate | UnixEpochTime, options?: DateRawFormatOptions): string {
    return this._formatDateRaw(new StringRenderer(), date, options || DEFAULT_RAW_OPTIONS);
  }

  formatDateRawToParts(date: CalendarDate | UnixEpochTime, options?: DateRawFormatOptions): Part[] {
    return this._formatDateRaw(new PartsRenderer(), date, options || DEFAULT_RAW_OPTIONS);
  }

  private _formatDate<R>(renderer: Renderer<R>, date: CalendarDate | UnixEpochTime, options?: DateFormatOptions): R {
    const calendars = this.internals.calendars;
    options = options || DEFAULT_OPTIONS;
    const calendar = calendars.selectCalendar(this.bundle, options.ca);
    const params = this.privateApi.getNumberParams(options.nu, 'default');

    date = this.convertDateTo(calendar, date);
    const req = this.manager.getDateFormatRequest(date, options, params);
    const ctx = { date, bundle: this.bundle, system: params.system, latnSystem: params.latnSystem };
    return calendars.formatDateTime(calendar, ctx, renderer, req.date, req.time, req.wrapper);
  }

  private _formatInterval<R>(renderer: Renderer<R>,
      start: CalendarDate | UnixEpochTime, end: CalendarDate | UnixEpochTime,
      options?: DateIntervalFormatOptions): R {

    options = options || DEFAULT_INTERVAL_OPTIONS;
    const calendar = this.internals.calendars.selectCalendar(this.bundle, options.ca);
    start = this.convertDateTo(calendar, start);
    end = this.convertDateTo(calendar, end);

    const fieldDiff = this.fieldOfGreatestDifference(start, end);
    const params = this.privateApi.getNumberParams(options.nu, 'default');
    const req = this.manager.getDateIntervalFormatRequest(calendar, start, fieldDiff, options, params);

    if (req.skeleton) {
      const { ca, nu } = options;
      const r = this.manager.getDateFormatRequest(start, { ca, nu, skeleton: req.skeleton }, params);
      const ctx = { date: start, bundle: this.bundle, system: params.system, latnSystem: params.latnSystem };
      const _start = this.internals.calendars.formatDateTime(calendar, ctx, renderer, r.date, r.time, r.wrapper);
      ctx.date = end;
      const _end = this.internals.calendars.formatDateTime(calendar, ctx, renderer, r.date, r.time, r.wrapper);
      const wrapper = this.internals.wrapper.parseWrapper(req.wrapper);
      renderer.wrap(wrapper, [_start, _end]);
      return renderer.get();
    }

    let _date: R | undefined;
    if (req.date) {
      const { ca, nu } = options;
      const ctx = { date: start, bundle: this.bundle, system: params.system, latnSystem: params.latnSystem};
      _date = this.internals.calendars.formatDateTime(calendar, ctx, renderer, req.date);
    }

    if (req.range) {
      const _range = this.internals.calendars.formatInterval(
        calendar, this.bundle, params, renderer, start, end, req.range);
      if (!_date) {
        return _range;
      }
      // Note: This case is covered in ICU but not mentioned in the CLDR docs. Use the MEDIUM
      // dateTimeFormat to join a common date with a time range.
      // Ticket referencing the discrepancy:
      // https://www.unicode.org/cldr/trac/ticket/11158
      // Docs don't mention this edge case:
      // https://www.unicode.org/reports/tr35/tr35-dates.html#intervalFormats
      const patterns = this.manager.getCalendarPatterns(calendar);
      const wrapper = this.internals.wrapper.parseWrapper(patterns.getWrapperPattern('medium'));
      renderer.wrap(wrapper, [_range, _date]);
      return renderer.get();
    }

    return _date ? _date : renderer.empty();
  }

  private _formatDateRaw<R>(renderer: Renderer<R>,
      date: CalendarDate | UnixEpochTime, options: DateRawFormatOptions): R {

    if (!options.pattern) {
      return renderer.empty();
    }
    const pattern = this.internals.calendars.parseDatePattern(options.pattern);
    const calendar = this.internals.calendars.selectCalendar(this.bundle, options.ca);
    const params = this.privateApi.getNumberParams(options.nu, 'default');
    const ctx = { date: this.convertDateTo(calendar, date), bundle: this.bundle,
      system: params.system, latnSystem: params.latnSystem };
    return this.internals.calendars.formatDateTime(calendar, ctx, renderer, pattern);
  }

  private convertDate<T>(cons: CalendarFromUnixEpoch<T>, date: CalendarDate | UnixEpochTime, zoneId?: string): T {
    return date instanceof CalendarDate ?
      this.convertEpoch(cons, date.unixEpoch(), zoneId ? zoneId : date.timeZoneId()) :
      this.convertEpoch(cons, getEpochUTC(date.epoch), date.zoneId || 'UTC');
  }

  private convertEpoch<T>(cons: CalendarFromUnixEpoch<T>, epoch: number, zoneId: string): T {
    return cons(epoch, zoneId, this.firstDay, this.minDays);
  }

  private convertDateTo(target: CalendarType, date: CalendarDate | UnixEpochTime, zoneId?: string): CalendarDate {
    if (date instanceof CalendarDate && target === date.type() && zoneId === date.timeZoneId()) {
      return date;
    }
    switch (target) {
    case 'buddhist':
      return this.toBuddhistDate(date);
    case 'gregory':
      return this.toGregorianDate(date);
    case 'iso8601':
      return this.toISO8601Date(date);
    case 'japanese':
      return this.toJapaneseDate(date);
    case 'persian':
      return this.toPersianDate(date);
    }
  }
}

const getEpochUTC = (date: Date | number): number =>
  typeof date === 'number' ? date : (+date) - date.getTimezoneOffset() * 60000;