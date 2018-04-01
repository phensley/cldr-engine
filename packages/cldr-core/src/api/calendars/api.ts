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
import { Bundle } from '../..';
import { CalendarInternals, DateFieldInternals, Internals } from '../../internals';
import { DatePatternManager } from '../../internals/calendars/manager';
import { DateFormatOptions, RelativeTimeFormatOptions } from '../../common';
import { DateFormatRequest } from '../../common/private';
import { ZonedDateTime } from '../../types/datetime';
import { DecimalArg, Part } from '../../types';

const ISO_WEEKDATE_EXTENDED = "YYYY-'W'ww-";
const ISO_WEEKDATE_COMPACT = "YYYY'W'ww";

const DEFAULT_OPTIONS = { skeleton: 'yMd' };

/**
 * Date and time formatting per a given calendar.
 */
export class CalendarsImpl implements Calendars {

  // fake skeletons using date and time patterns for fuzzy matching.
  protected datetimeSkels: string[] = [];
  protected calendar: CalendarInternals;
  protected dateFields: DateFieldInternals;
  protected datePatternManager: DatePatternManager;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
  ) {
    this.calendar = internals.calendars;
    this.dateFields = internals.dateFields;

    // TODO: reorg and move this type
    this.datePatternManager = new DatePatternManager(bundle, internals);
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

  getCompactISOWeekDate(date: ZonedDateTime): string {
    return this.getISOWeekDate(date, ISO_WEEKDATE_COMPACT);
  }

  getExtendedISOWeekDate(date: ZonedDateTime): string {
    return this.getISOWeekDate(date, ISO_WEEKDATE_EXTENDED);
  }

  // TODO: Support context transforms, context-sensitive fields
  // https://www.unicode.org/reports/tr35/tr35-dates.html#months_days_quarters_eras

  formatDate(date: ZonedDateTime, options?: DateFormatOptions): string {
    // TODO: select calendar based on options
    const request = this.datePatternManager.getRequest(date, options || DEFAULT_OPTIONS);
    return this.calendar.formatDate(this.bundle, date, request);
  }

  formatDateToParts(date: ZonedDateTime, options?: DateFormatOptions): Part[] {
    // TODO: select calendar based on options
    const request = this.datePatternManager.getRequest(date, options || DEFAULT_OPTIONS);
    return this.calendar.formatDateToParts(this.bundle, date, request);
  }

  formatDateInterval(start: ZonedDateTime, end: ZonedDateTime, skeleton: string): string {
    const field = start.fieldOfGreatestDifference(end);
    const pattern = this.calendar.intervalFormats(this.bundle, skeleton, field);
    return this.calendar.formatDateInterval(this.bundle, start, end, pattern);
  }

  formatDateIntervalToParts(start: ZonedDateTime, end: ZonedDateTime, skeleton: string): Part[] {
    const field = start.fieldOfGreatestDifference(end);
    const pattern = this.calendar.intervalFormats(this.bundle, skeleton, field);
    return this.calendar.formatDateIntervalToParts(this.bundle, start, end, pattern);
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

  protected getISOWeekDate(date: ZonedDateTime, pattern: string): string {
    const weekday = date.getDayOfWeek();
    const base = this.calendar.formatDateRaw(this.bundle, date, pattern);
    return base + weekday;
  }

}
