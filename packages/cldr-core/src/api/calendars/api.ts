import {
  Alt,
  DateFieldType,
  DateTimePatternField,
  DateTimePatternFieldType,
  FieldWidth,
  FieldWidthType,
  IntervalFormatType,
  DayPeriodType,
  QuarterType,
  MonthType,
  WeekdayType,
  EraType,
  FormatWidthType
} from '@phensley/cldr-schema';

import { Calendars } from '../api';
import { Bundle } from '../..';
import { CalendarInternals, DateFieldInternals, Internals } from '../../internals';
import { DateFormatOptions, RelativeTimeFormatOptions } from '../../common';
import { ZonedDateTime } from '../../types/datetime';
import { DecimalArg, Part } from '../../types';

const ISO_WEEKDATE_EXTENDED = "YYYY-'W'ww-";
const ISO_WEEKDATE_COMPACT = "YYYY'W'ww";

/**
 * Date and time formatting per a given calendar.
 */
export class CalendarsImpl implements Calendars {

  protected calendar: CalendarInternals;
  protected dateFields: DateFieldInternals;

  constructor(
    protected bundle: Bundle,
    protected internals: Internals
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

  getCompactISOWeekDate(date: ZonedDateTime): string {
    return this.getISOWeekDate(date, ISO_WEEKDATE_COMPACT);
  }

  getExtendedISOWeekDate(date: ZonedDateTime): string {
    return this.getISOWeekDate(date, ISO_WEEKDATE_EXTENDED);
  }

  // TODO: Support context transforms, context-sensitive fields
  // https://www.unicode.org/reports/tr35/tr35-dates.html#months_days_quarters_eras

  formatDate(date: ZonedDateTime, options: DateFormatOptions = {}): string {
    return this.calendar.formatDate(this.bundle, date, options);
  }

  formatDateToParts(date: ZonedDateTime, options: DateFormatOptions = {}): Part[] {
    return this.calendar.formatDateToParts(this.bundle, date, options);
  }

  formatDateInterval(start: ZonedDateTime, end: ZonedDateTime, skeleton: IntervalFormatType): string {
    const field = start.fieldOfGreatestDifference(end);
    const pattern = this.calendar.intervalFormats(this.bundle, skeleton, field);
    return this.calendar.formatDateInterval(this.bundle, start, end, pattern);
  }

  formatDateIntervalToParts(start: ZonedDateTime, end: ZonedDateTime, skeleton: IntervalFormatType): Part[] {
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
    value: DecimalArg, field: DateFieldType, options: RelativeTimeFormatOptions = { width: 'wide' }): string {
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
