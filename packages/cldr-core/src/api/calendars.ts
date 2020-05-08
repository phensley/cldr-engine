import {
  ContextTransformFieldType,
  ContextType,
  DateFieldType,
  DateTimePatternFieldType,
  RelativeTimeFieldType,
} from '@phensley/cldr-types';

import { DecimalArg, Part } from '@phensley/decimal';
import { TZ, ZoneInfo } from '@phensley/timezone';

import { Bundle } from '../resource';

import {
  CalendarFieldsOptions,
  DateFieldFormatOptions,
  DateFormatAltOptions,
  DateFormatOptions,
  DateIntervalFormatOptions,
  DateRawFormatOptions,
  DateWrapperFormatOptions,
  EraFieldOptions,
  RelativeTimeFieldFormatOptions,
  RelativeTimeFormatOptions,
  TimeZoneInfo,
  ZonedDateTime,
} from '../common';

import { Internals } from '../internals';
import { Quantity } from '../common';

import {
  BuddhistDate,
  CalendarDate,
  CalendarDateFields,
  CalendarFromUnixEpoch,
  CalendarType,
  GregorianDate,
  ISO8601Date,
  JapaneseDate,
  PersianDate,
  TimePeriod,
  TIME_PERIOD_FIELDS,
} from '../systems/calendars';

import { CalendarManager } from '../internals/calendars/manager';
import { CalendarPatterns } from '../internals/calendars/patterns';
import { AbstractValue, PartsValue, StringValue } from '../utils/render';

import { Calendars } from './api';
import { PrivateApiImpl } from './private';
import { CalendarContext } from '../internals/calendars/formatter';
import { NumberParams } from '../common/private';
import { getStableTimeZoneId, substituteZoneAlias } from '../systems/calendars/timezone';

const DOW_FIELDS: RelativeTimeFieldType[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * @internal
 */
export class CalendarsImpl implements Calendars {
  private manager: CalendarManager;
  private _firstDay: number;
  private _minDays: number;
  private exemplarCities: { [x: string]: string } | undefined;

  constructor(
    private readonly bundle: Bundle,
    private readonly internals: Internals,
    private readonly privateApi: PrivateApiImpl,
  ) {
    this.manager = new CalendarManager(bundle, internals);
    const region = bundle.region();
    this._firstDay = internals.calendars.weekFirstDay(region);
    this._minDays = internals.calendars.weekMinDays(region);
  }

  firstDayOfWeek(): number {
    return this._firstDay;
  }

  minDaysInFirstWeek(): number {
    return this._minDays;
  }

  dateField(type: DateFieldType, opt?: DateFieldFormatOptions): string {
    opt = opt || {};
    const field = this.internals.schema.DateFields.displayName.get(this.bundle, type, opt.width || 'wide');
    return this._transformField(field, 'calendar-field', opt.context);
  }

  dayPeriods(opt?: CalendarFieldsOptions): any {
    opt = opt || {};
    const fields = this._getPatterns(opt.ca).dayPeriods()[opt.width || 'wide'];
    return this._transformFields(fields, undefined, opt.context);
  }

  eras(opt?: EraFieldOptions): any {
    opt = opt || {};
    const w = opt.width || 'names';
    const fields = this._getPatterns(opt.ca).eras()[w];
    const tx = w === 'abbr' ? 'era-abbr' : w === 'names' ? 'era-name' : undefined;
    return this._transformFields(fields, tx, opt.context);
  }

  months(opt?: CalendarFieldsOptions): any {
    opt = opt || {};
    const w = opt.width === 'short' ? 'narrow' : opt.width || 'wide';
    const fields = this._getPatterns(opt.ca).months()[w];
    const tx = w !== 'narrow' ? 'month-standalone-except-narrow' : undefined;
    return this._transformFields(fields, tx, opt.context);
  }

  quarters(opt?: CalendarFieldsOptions): any {
    opt = opt || {};
    const fields = this._getPatterns(opt.ca).quarters()[opt.width || 'wide'];
    return this._transformFields(fields, undefined, opt.context);
  }

  weekdays(opt?: CalendarFieldsOptions): any {
    opt = opt || {};
    const w = opt.width || 'wide';
    const fields = this._getPatterns(opt.ca).weekdays()[w];
    const tx = w !== 'narrow' ? 'day-standalone-except-narrow' : undefined;
    return this._transformFields(fields, tx, opt.context);
  }

  /**
   * Alias for nowGregorian()
   */
  now(zoneId?: string): GregorianDate {
    return this.nowGregorian(zoneId);
  }

  /**
   * Convert the given date to the Buddhist calendar.
   */
  toBuddhistDate(date: CalendarDate | ZonedDateTime | Date): BuddhistDate {
    return this.convertDate(BuddhistDate.fromUnixEpoch, date);
  }

  /**
   * Construct a new date in the Buddhist calendar with the given fields.
   */
  newBuddhistDate(fields: Partial<CalendarDateFields>): BuddhistDate {
    return BuddhistDate.fromFields(fields, this._firstDay, this._minDays);
  }

  /**
   * Construct a new date in the Buddhist calendar representing the current date and time.
   */
  nowBuddhist(zoneId?: string): BuddhistDate {
    return BuddhistDate.fromUnixEpoch(new Date().getTime(), zoneId || '', this._firstDay, this._minDays);
  }

  /**
   * Convert the given date to the Gregorian calendar.
   */
  toGregorianDate(date: CalendarDate | ZonedDateTime | Date): GregorianDate {
    return this.convertDate(GregorianDate.fromUnixEpoch, date);
  }

  /**
   * Construct a new date in the Gregorian calendar with the given fields.
   */
  newGregorianDate(fields: Partial<CalendarDateFields>): GregorianDate {
    return GregorianDate.fromFields(fields, this._firstDay, this._minDays);
  }

  /**
   * Construct a new date in the Gregorian calendar representing the current date and time.
   */
  nowGregorian(zoneId?: string): GregorianDate {
    return GregorianDate.fromUnixEpoch(new Date().getTime(), zoneId || '', this._firstDay, this._minDays);
  }

  /**
   * Convert the given date to the ISO-8601 calendar.
   */
  toISO8601Date(date: CalendarDate | ZonedDateTime | Date): ISO8601Date {
    return this.convertDate(ISO8601Date.fromUnixEpoch, date);
  }

  /**
   * Construct a new date in the ISO-8601 calendar with the given fields.
   */
  newISO8601Date(fields: Partial<CalendarDateFields>): ISO8601Date {
    return ISO8601Date.fromFields(fields, this._firstDay, this._minDays);
  }

  /**
   * Construct a new date in the ISO8601 calendar representing the current date and time.
   */
  nowISO8601(zoneId?: string): ISO8601Date {
    return ISO8601Date.fromUnixEpoch(new Date().getTime(), zoneId || '', this._firstDay, this._minDays);
  }

  /**
   * Convert the given date to the Japanese calendar.
   */
  toJapaneseDate(date: CalendarDate | ZonedDateTime | Date): JapaneseDate {
    return this.convertDate(JapaneseDate.fromUnixEpoch, date);
  }

  /**
   * Construct a new date in the Japanese calendar with the given fields.
   */
  newJapaneseDate(fields: Partial<CalendarDateFields>): JapaneseDate {
    return JapaneseDate.fromFields(fields, this._firstDay, this._minDays);
  }

  /**
   * Construct a new date in the Japanese calendar representing the current date and time.
   */
  nowJapanese(zoneId?: string): JapaneseDate {
    return JapaneseDate.fromUnixEpoch(new Date().getTime(), zoneId || '', this._firstDay, this._minDays);
  }

  /**
   * Convert the given date to the Persian calendar.
   */
  toPersianDate(date: CalendarDate | ZonedDateTime | Date): PersianDate {
    return this.convertDate(PersianDate.fromUnixEpoch, date);
  }

  /**
   * Construct a new date in the Persian calendar with the given fields.
   */
  newPersianDate(fields: Partial<CalendarDateFields>): PersianDate {
    return PersianDate.fromFields(fields, this._firstDay, this._minDays);
  }

  /**
   * Construct a new date in the Persian calendar representing the current date and time.
   */
  nowPersian(zoneId?: string): PersianDate {
    return PersianDate.fromUnixEpoch(new Date().getTime(), zoneId || '', this._firstDay, this._minDays);
  }

  /**
   * Find the field of visual difference between two dates. For example, the
   * dates "2019-03-31" and "2019-04-01" differ visually in the month field,
   * even though the dates are only 1 day apart.
   *
   * This can be used by applications to select an appropriate skeleton for date
   * interval formatting, e.g. to format "March 31 - April 01, 2019"
   */
  fieldOfVisualDifference(
    a: CalendarDate | ZonedDateTime | Date,
    b: CalendarDate | ZonedDateTime | Date,
  ): DateTimePatternFieldType {
    // Date is interpreted as UTC
    if (a instanceof Date) {
      a = { date: a } as ZonedDateTime;
    }
    if (b instanceof Date) {
      b = { date: b } as ZonedDateTime;
    }

    // Determine calendar type to use for comparison, falling back to the default for the
    // current locale.
    const type: CalendarType =
      a instanceof CalendarDate
        ? a.type()
        : b instanceof CalendarDate
        ? b.type()
        : this.internals.calendars.selectCalendar(this.bundle);

    // Convert a and b to CalendarDate having the correct type, ensuring their types and timezones match.
    if (!(a instanceof CalendarDate) || type !== a.type()) {
      a = this.convertDateTo(type, a);
    }
    if (!(b instanceof CalendarDate) || type !== b.type() || a.timeZoneId() !== b.timeZoneId()) {
      b = this.convertDateTo(type, b, a.timeZoneId());
    }
    return a.fieldOfVisualDifference(b);
  }

  /**
   * Format a calendar date to string using the given options.
   */
  formatDate(date: CalendarDate | ZonedDateTime | Date, options?: DateFormatOptions): string {
    return this._formatDate(new StringValue(), date, options);
  }

  /**
   * Format a calendar date to a parts array using the given options.
   */
  formatDateToParts(date: CalendarDate | ZonedDateTime | Date, options?: DateFormatOptions): Part[] {
    return this._formatDate(new PartsValue(), date, options);
  }

  formatDateInterval(
    start: CalendarDate | ZonedDateTime | Date,
    end: CalendarDate | ZonedDateTime | Date,
    options?: DateIntervalFormatOptions,
  ): string {
    return this._formatInterval(new StringValue(), start, end, options);
  }

  formatDateIntervalToParts(
    start: CalendarDate | ZonedDateTime | Date,
    end: CalendarDate | ZonedDateTime | Date,
    options?: DateIntervalFormatOptions,
  ): Part[] {
    return this._formatInterval(new PartsValue(), start, end, options);
  }

  // TODO: need to sort out the options
  // formatRelativeTime(start: CalendarDate | ZonedDateTime, end: CalendarDate | ZonedDateTime,
  //     options?: RelativeTimeFormatOptions): string {
  //   options = options || DEFAULT_RELTIME_OPTIONS;
  //   const params = this.privateApi.getNumberParams(options.nu);
  //   const calendar = this.internals.calendars.selectCalendar(this.bundle);
  //   start = this.convertDateTo(calendar, start);
  //   end = this.convertDateTo(calendar, end, start.timeZoneId());
  //   return this.internals.dateFields.formatRelativeTime(
  //     this.bundle, start, end, options, params);
  // }

  formatRelativeTimeField(
    value: DecimalArg,
    field: RelativeTimeFieldType,
    options?: RelativeTimeFieldFormatOptions,
  ): string {
    options = options || { width: 'wide' };
    const transform = this.privateApi.getContextTransformInfo();
    const params = this.privateApi.getNumberParams(options.nu);
    return this.internals.dateFields.formatRelativeTimeField(this.bundle, value, field, options, params, transform);
  }

  formatRelativeTime(
    start: CalendarDate | ZonedDateTime | Date,
    end: CalendarDate | ZonedDateTime | Date,
    options?: RelativeTimeFormatOptions,
  ): string {
    options = options || { width: 'wide', maximumFractionDigits: 0, group: true };

    const calendar = this.internals.calendars.selectCalendar(this.bundle, options.ca);
    const _start = this.convertDateTo(calendar, start);
    const _end = this.convertDateTo(calendar, end);

    let [field, amount] = _start.relativeTime(_end, options.field);
    if (_start.compare(_end) === 1) {
      amount *= -1;
    }

    if (field === 'millis') {
      amount /= 1000.0;
      field = 'second';
    }
    let _field = field as RelativeTimeFieldType;

    // See if we can use day of week formatting
    if (options.dayOfWeek && field === 'week' && _start.dayOfWeek() === _end.dayOfWeek()) {
      const dow = _end.dayOfWeek() - 1;
      _field = DOW_FIELDS[dow];
    }

    return this.formatRelativeTimeField(amount, _field, options);
  }

  /**
   * Format a raw date pattern. Note: This should not be used, but is available for debugging or
   * extreme cases where an application must implement a custom format.
   */
  formatDateRaw(date: CalendarDate | ZonedDateTime | Date, options?: DateRawFormatOptions): string {
    return this._formatDateRaw(new StringValue(), date, options || {});
  }

  formatDateRawToParts(date: CalendarDate | ZonedDateTime | Date, options?: DateRawFormatOptions): Part[] {
    return this._formatDateRaw(new PartsValue(), date, options || {});
  }

  formatDateWrapper(date: string, time: string, options?: DateWrapperFormatOptions): string {
    return this._formatDateWrapper(new StringValue(), date, time, options || {});
  }

  formatDateWrapperToParts(date: Part[], time: Part[], options?: DateWrapperFormatOptions): Part[] {
    return this._formatDateWrapper(new PartsValue(), date, time, options || {});
  }

  timeZoneIds(): string[] {
    return TZ.zoneIds();
  }

  resolveTimeZoneId(zoneid: string): string | undefined {
    return TZ.resolveId(substituteZoneAlias(zoneid));
  }

  timeZoneInfo(zoneid: string): TimeZoneInfo {
    if (!this.exemplarCities) {
      this.exemplarCities = this.internals.schema.TimeZones.exemplarCity.mapping(this.bundle);
    }
    const id = this.resolveTimeZoneId(zoneid) || 'Factory';
    const stableid = getStableTimeZoneId(id);
    const city = this.exemplarCities[stableid] || this.exemplarCities['Etc/Unknown'];
    return { id, city: { name: city } };
  }

  timeZoneFromUTC(utc: number, zoneid: string): ZoneInfo | undefined {
    return TZ.fromUTC(zoneid, utc);
  }

  timeZoneFromWall(wall: number, zoneid: string): [number, ZoneInfo] | undefined {
    return TZ.fromWall(zoneid, wall);
  }

  timePeriodToQuantity(period: Partial<TimePeriod>): Quantity[] {
    const q: Quantity[] = [];
    for (const f of TIME_PERIOD_FIELDS) {
      const v = period[f];
      if (v) {
        const unit = f === 'millis' ? 'millisecond' : f;
        q.push({ unit, value: v });
      }
    }
    return q;
  }

  private _getPatterns(type?: CalendarType): CalendarPatterns {
    const calendar = this.internals.calendars.selectCalendar(this.bundle, type);
    return this.manager.getCalendarPatterns(calendar);
  }

  /**
   * Copy fields, applying an optional context transform to the values.
   */
  private _transformFields(fields: any, type?: ContextTransformFieldType, context?: ContextType): any {
    const res: any = {};
    if (fields) {
      for (const key of Object.keys(fields)) {
        const val = fields[key];
        res[key] =
          typeof val === 'string'
            ? this._transformField(val, type, context)
            : this._transformFields(val, type, context);
      }
    }
    return res;
  }

  private _transformField(field: string, type?: ContextTransformFieldType, context?: ContextType): string {
    const info = this.privateApi.getContextTransformInfo();
    return context ? this.internals.general.contextTransform(field, info, context, type) : field;
  }

  private _formatDate<R>(
    value: AbstractValue<R>,
    date: CalendarDate | ZonedDateTime | Date,
    options?: DateFormatOptions,
  ): R {
    const calendars = this.internals.calendars;
    options = options || { date: 'full' };
    const calendar = calendars.selectCalendar(this.bundle, options.ca);
    const params = this.privateApi.getNumberParams(options.nu, 'default');

    date = this.convertDateTo(calendar, date);
    const req = this.manager.getDateFormatRequest(date, options, params);
    const ctx = this._context(date, params, options.context, options.alt);
    return calendars.formatDateTime(calendar, ctx, value, req.date, req.time, req.wrapper);
  }

  private _formatInterval<R>(
    value: AbstractValue<R>,
    start: CalendarDate | ZonedDateTime | Date,
    end: CalendarDate | ZonedDateTime | Date,
    options?: DateIntervalFormatOptions,
  ): R {
    // options = options || { skeleton: 'yMd' };
    options = options || {};
    const calendar = this.internals.calendars.selectCalendar(this.bundle, options.ca);
    start = this.convertDateTo(calendar, start);
    end = this.convertDateTo(calendar, end);

    const fieldDiff = this.fieldOfVisualDifference(start, end);
    const params = this.privateApi.getNumberParams(options.nu, 'default');
    const req = this.manager.getDateIntervalFormatRequest(calendar, start, fieldDiff, options, params);

    if (req.skeleton) {
      const { ca, nu } = options;
      const r = this.manager.getDateFormatRequest(start, { ca, nu, skeleton: req.skeleton }, params);
      const ctx = this._context(start, params, options.context, options.alt);
      const _start = this.internals.calendars.formatDateTime(calendar, ctx, value, r.date, r.time, r.wrapper);
      ctx.date = end;
      const _end = this.internals.calendars.formatDateTime(calendar, ctx, value, r.date, r.time, r.wrapper);
      const wrapper = this.internals.general.parseWrapper(req.wrapper);
      value.wrap(wrapper, [_start, _end]);
      return value.render();
    }

    let _date: R | undefined;
    if (req.date) {
      const ctx = this._context(start, params, options.context, options.alt);
      _date = this.internals.calendars.formatDateTime(calendar, ctx, value, req.date);
    }

    if (req.range) {
      const ctx = this._context(start, params, options.context, options.alt);
      const _range = this.internals.calendars.formatInterval(calendar, ctx, value, end, req.range);
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
      const wrapper = this.internals.general.parseWrapper(patterns.getWrapperPattern('medium'));
      value.wrap(wrapper, [_range, _date]);
      return value.render();
    }
    // Here, the request should always be:
    //   { date }
    //   { date, range }
    //   { range }
    // Unless the schema config contains no relevant patterns.
    return _date || value.empty();
  }

  private _context<T extends CalendarDate>(
    date: T,
    params: NumberParams,
    context?: ContextType,
    alt: DateFormatAltOptions = {},
  ): CalendarContext<T> {
    return {
      alt,
      date,
      bundle: this.bundle,
      system: params.system,
      latnSystem: params.latnSystem,
      context,
      transform: this.privateApi.getContextTransformInfo(),
    };
  }

  private _formatDateRaw<R>(
    value: AbstractValue<R>,
    date: CalendarDate | ZonedDateTime | Date,
    options: DateRawFormatOptions,
  ): R {
    if (!options.pattern) {
      return value.empty();
    }
    const pattern = this.internals.calendars.parseDatePattern(options.pattern);
    const calendar = this.internals.calendars.selectCalendar(this.bundle, options.ca);
    const params = this.privateApi.getNumberParams(options.nu, 'default');
    const ctx = this._context(this.convertDateTo(calendar, date), params, options.context, options.alt);
    return this.internals.calendars.formatDateTime(calendar, ctx, value, pattern);
  }

  private _formatDateWrapper<R>(value: AbstractValue<R>, date: R, time: R, options: DateWrapperFormatOptions): R {
    const calendar = this.internals.calendars.selectCalendar(this.bundle, options.ca);
    const patterns = this.manager.getCalendarPatterns(calendar);
    const wrapper = this.internals.general.parseWrapper(patterns.getWrapperPattern(options.width || 'medium'));
    value.wrap(wrapper, [time, date]);
    return value.render();
  }

  private convertDate<T>(cons: CalendarFromUnixEpoch<T>, date: CalendarDate | ZonedDateTime | Date): T {
    if (date instanceof Date) {
      date = { date, zoneId: 'UTC' } as ZonedDateTime;
    }
    return date instanceof CalendarDate
      ? this.convertEpoch(cons, date.unixEpoch(), date.timeZoneId())
      : this.convertEpoch(cons, getEpochUTC(date.date), date.zoneId || 'UTC');
  }

  private convertEpoch<T>(cons: CalendarFromUnixEpoch<T>, epoch: number, zoneId: string): T {
    return cons(epoch, zoneId, this._firstDay, this._minDays);
  }

  private convertDateTo(
    target: CalendarType,
    date: CalendarDate | ZonedDateTime | Date,
    zoneId?: string,
  ): CalendarDate {
    if (date instanceof CalendarDate && target === date.type() && (!zoneId || zoneId === date.timeZoneId())) {
      return date;
    } else if (date instanceof Date) {
      date = { date, zoneId } as ZonedDateTime;
    }

    switch (target) {
      case 'buddhist':
        return this.toBuddhistDate(date);
      case 'japanese':
        return this.toJapaneseDate(date);
      case 'persian':
        return this.toPersianDate(date);
    }
    // All others convert to 'gregory'
    return this.toGregorianDate(date);
  }
}

const getEpochUTC = (date: Date | number): number => {
  const n = +date;
  return isFinite(n) ? n : 0;
};
