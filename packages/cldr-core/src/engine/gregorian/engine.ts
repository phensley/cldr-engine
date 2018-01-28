import {
  Bundle,
  FieldWidth,
  FieldWidthType,
  IntervalFormatType,
  DayPeriodType,
  QuarterType,
  MonthType,
  WeekdayType,
  EraType,
  FormatWidth,
  FormatWidthType
} from '@phensley/cldr-schema';

import { ZonedDateTime } from '../../types/datetime';
import { parseDatePattern, DateTimeNode } from '../../parsing/patterns/date';
import { GregorianInternal } from './internal';
import { GregorianFormatOptions } from './options';

const defaultFormatOptions = new GregorianFormatOptions();

/**
 * Date formatting using the Gregorian calendar.
 */
export class GregorianEngine {

  readonly cache: Map<string, DateTimeNode[]>;

  constructor(
    protected internal: GregorianInternal,
    protected bundle: Bundle
  ) {
    this.cache = new Map();
  }

  bundleId(): string {
    return this.bundle.bundleId();
  }

  /**
   * Get standalone day period.
   */
  getDayPeriod(dayPeriod: DayPeriodType, width: FieldWidthType = FieldWidth.WIDE): string {
    return this.internal.dayPeriods.standAlone[width](this.bundle, dayPeriod);
  }

  /**
   * Get standalone era name.
   */
  getEra(era: EraType, width: FieldWidthType = FieldWidth.WIDE): string {
    switch (width) {
    case FieldWidth.NARROW:
    case FieldWidth.SHORT:
      return this.internal.eras.narrow(this.bundle, era);
    case FieldWidth.ABBREVIATED:
      return this.internal.eras.abbr(this.bundle, era);
    case FieldWidth.WIDE:
    default:
      return this.internal.eras.names(this.bundle, era);
    }
  }

  /**
   * Get standalone month name.
   */
  getMonth(month: MonthType, width: FieldWidthType = FieldWidth.WIDE): string {
    return this.internal.months.standAlone[width](this.bundle, month);
  }

  /**
   * Get standalone quarter name.
   */
  getQuarter(quarter: QuarterType, width: FieldWidthType = FieldWidth.WIDE): string {
    return this.internal.quarters.standAlone[width](this.bundle, quarter);
  }

  /**
   * Get standalone weekday name.
   */
  getWeekday(weekday: WeekdayType, width: FieldWidthType = FieldWidth.WIDE): string {
    return this.internal.weekdays.standAlone[width](this.bundle, weekday);
  }

  format(date: ZonedDateTime, options: GregorianFormatOptions = defaultFormatOptions): string {
    const width = options.date ? options.date : 'full';
    const raw = this.internal.Gregorian.dateFormats(this.bundle, width as FormatWidthType);

    // let pattern = this.cache.get(raw);
    // if (pattern === undefined) {
    //   pattern = parseDatePattern(raw);
    // }
    // return this.formatter.format(this.bundle, date, pattern);

    return this.internal.format(this.bundle, date, parseDatePattern(raw));
  }

  formatParts(date: ZonedDateTime, options: GregorianFormatOptions = defaultFormatOptions): any[] {
    const width = options.date ? options.date : 'full';
    const raw = this.internal.Gregorian.dateFormats(this.bundle, width as FormatWidthType);
    return this.internal.formatParts(this.bundle, date, parseDatePattern(raw));
  }

  formatInterval(start: ZonedDateTime, end: ZonedDateTime, skeleton: IntervalFormatType): string {
    const field = start.fieldOfGreatestDifference(end);
    const raw = this.internal.Gregorian.intervalFormats(skeleton).field(this.bundle, field);
    return this.internal.formatInterval(this.bundle, start, end, parseDatePattern(raw));
  }

}
