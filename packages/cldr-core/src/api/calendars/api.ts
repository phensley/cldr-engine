import {
  Alt,
  DateFieldType,
  FieldWidth,
  FieldWidthType,
  DayPeriodType,
  QuarterType,
  WeekdayType,
  FormatWidthType
} from '@phensley/cldr-schema';

import { Calendars } from '../api';
import { PrivateApiImpl } from '../private';
import { Bundle } from '../..';
import { CalendarInternals, DateFieldInternals, Internals } from '../../internals';
import { DateFormatOptions, DateIntervalFormatOptions, RelativeTimeFormatOptions } from '../../common';
import { DateFormatRequest } from '../../common/private';
import { CalendarDate } from '../../systems/calendars';
import { ZonedDateTime } from '../../types/datetime';
import { DecimalArg, Part } from '../../types';

const DEFAULT_OPTIONS = { skeleton: 'yMd' };

/**
 * Date and time formatting per a given calendar.
 */
export class CalendarsImpl implements Calendars {

  // fake skeletons using date and time patterns for fuzzy matching.
  protected datetimeSkels: string[] = [];
  protected calendar: CalendarInternals;
  protected dateFields: DateFieldInternals;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals,
    protected privateApi: PrivateApiImpl
  ) {
    this.calendar = internals.calendars;
    this.dateFields = internals.dateFields;
  }

  // TODO: rework these to return standalone field for a given 'now'
  // getDayPeriod(dayPeriod: DayPeriodType, width: FieldWidthType = FieldWidth.WIDE): string {
  //   const impl = this.internal.dayPeriods.standAlone[width];
  //   return impl === undefined ? '' : impl(this.bundle, dayPeriod, Alt.NONE);
  // }

  // getEra(era: EraType, width: FieldWidthType = FieldWidth.WIDE): string {
  //   switch (width) {
  //   case FieldWidth.NARROW:
  //   case FieldWidth.SHORT:
  //     return this.internal.eras.narrow(this.bundle, era);
  //   case FieldWidth.ABBREVIATED:
  //     return this.internal.eras.abbr(this.bundle, era);
  //   case FieldWidth.WIDE:
  //   default:
  //     return this.internal.eras.names(this.bundle, era);
  //   }
  // }

  // getMonth(month: MonthType, width: FieldWidthType = FieldWidth.WIDE): string {
  //   const impl = this.internal.months.standAlone[width];
  //   return impl === undefined ? '' : impl(this.bundle, month);
  // }

  // getQuarter(quarter: QuarterType, width: FieldWidthType = FieldWidth.WIDE): string {
  //   const impl = this.internal.quarters.standAlone[width];
  //   return impl === undefined ? '' : impl(this.bundle, quarter);
  // }

  // getWeekday(weekday: WeekdayType, width: FieldWidthType = FieldWidth.WIDE): string {
  //   const impl = this.internal.weekdays.standAlone[width];
  //   return impl === undefined ? '' : impl(this.bundle, weekday);
  // }

  // TODO: Support context transforms, context-sensitive fields
  // https://www.unicode.org/reports/tr35/tr35-dates.html#months_days_quarters_eras

  newFormatDate(date: CalendarDate, options?: DateFormatOptions): string {
    return '';
  }

  formatDate(date: ZonedDateTime, options?: DateFormatOptions): string {
    // TODO: select calendar based on options
    const request = this.privateApi.getDateFormatRequest(date, options || DEFAULT_OPTIONS);
    return this.calendar.formatDate(this.bundle, date, request);
  }

  formatDateToParts(date: ZonedDateTime, options?: DateFormatOptions): Part[] {
    // TODO: select calendar based on options
    const request = this.privateApi.getDateFormatRequest(date, options || DEFAULT_OPTIONS);
    return this.calendar.formatDateToParts(this.bundle, date, request);
  }

  // TODO: expand string/parts rendered so the string/part methods can be unified

  formatDateInterval(start: ZonedDateTime, end: ZonedDateTime, options?: DateIntervalFormatOptions): string {
    options = options || DEFAULT_OPTIONS;
    const ireq = this.privateApi.getDateIntervalFormatRequest(start, end, options || DEFAULT_OPTIONS);

    if (ireq.skeleton !== undefined) {
      const { ca, nu } = options;
      const request = this.privateApi.getDateFormatRequest(start, { skeleton: ireq.skeleton, ca, nu });
      return this.calendar.formatDateIntervalFallback(this.bundle, start, end, request, ireq.wrapper);
    }

    let range = '';
    if (ireq.range) {
      range = this.calendar.formatDateInterval(this.bundle, start, end, ireq.range);
    }

    let date = '';
    if (ireq.date) {
      // Format standalone pattern.
      const dreq: DateFormatRequest = { date: ireq.date, params: ireq.params, wrapper: '' };
      date = this.calendar.formatDate(this.bundle, start, dreq);
      if (!range) {
        return date;
      }
    }

    // TODO: the ICU date-time concatenation pattern not available in CLDR.
    // May need to build a patch for this.

    return date ? (range ? `${date} ${range}` : date) : range;
  }

  formatDateIntervalToParts(start: ZonedDateTime, end: ZonedDateTime, options?: DateIntervalFormatOptions): Part[] {
    options = options || DEFAULT_OPTIONS;
    const ireq = this.privateApi.getDateIntervalFormatRequest(start, end, options || DEFAULT_OPTIONS);

    if (ireq.skeleton !== undefined) {
      const { ca, nu } = options;
      const request = this.privateApi.getDateFormatRequest(start, { skeleton: ireq.skeleton, ca, nu });
      return this.calendar.formatDateIntervalFallbackToParts(this.bundle, start, end, request, ireq.wrapper);
    }

    let range: Part[] | undefined;
    if (ireq.range) {
      range = this.calendar.formatDateIntervalToParts(this.bundle, start, end, ireq.range);
    }

    let date: Part[] | undefined;
    if (ireq.date) {
      // Format standalone pattern.
      const dreq: DateFormatRequest = { date: ireq.date, params: ireq.params, wrapper: '' };
      date = this.calendar.formatDateToParts(this.bundle, start, dreq);
      if (!range) {
        return date;
      }
    }

    // TODO: the ICU date-time concatenation pattern not available in CLDR. May need to build
    // a patch for this
    if (date !== undefined) {
      const spacer: Part[] = [{ type: 'space', value: ' '}];
      return range !== undefined ? date.concat(spacer, range) : date;
    }
    return range !== undefined ? range : [];
  }

  formatDateIntervalToPartsOld(start: ZonedDateTime, end: ZonedDateTime, options?: DateIntervalFormatOptions): Part[] {
    options = options || DEFAULT_OPTIONS;
    const req = this.privateApi.getDateIntervalFormatRequest(start, end, options || DEFAULT_OPTIONS);
    if (req.range) {
      return this.calendar.formatDateIntervalToParts(this.bundle, start, end, req.range);
    }

    const { skeleton, ca, nu } = options;
    const request = this.privateApi.getDateFormatRequest(start, { skeleton, ca, nu });
    return this.calendar.formatDateIntervalFallbackToParts(this.bundle, start, end, request, req.wrapper);
  }

  // TODO: compute field difference and format
  // formatRelativeTime(start: ZonedDateTime, end: ZonedDateTime): string {
  //   return '';
  // }

  // formatRelativeTimeToParts(start: ZonedDateTime, end: ZonedDateTime): Part[] {
  //   return [];
  // }

  formatRelativeTimeField(
    value: DecimalArg, field: DateFieldType, options?: RelativeTimeFormatOptions): string {
    options = options || { width: 'wide' };
    return this.dateFields.formatRelativeTime(this.bundle, value, field, options);
  }

  formatDateRaw(date: ZonedDateTime, pattern: string): string {
    return this.calendar.formatDateRaw(this.bundle, date, pattern);
  }

  formatDateRawToParts(date: ZonedDateTime, pattern: string): Part[] {
    return this.calendar.formatDateRawToParts(this.bundle, date, pattern);
  }

}
