import { FieldArrow, FieldMapArrow, FieldMapIndexedArrow, ScopeArrow } from '../arrows';

import { Alt } from '../enums';

import {
  AvailableFormatType,
  DateTimeFieldType,
  DayPeriodType,
  EraType,
  FormatWidthType,
  IntervalFormatType,
  MonthType,
  QuarterType,
  WeekdayType,
} from './enums';

export interface ErasFormat {
  readonly names: FieldMapArrow<EraType>;
  readonly abbr: FieldMapArrow<EraType>;
  readonly narrow: FieldMapArrow<EraType>;
}

export interface WeekdaysFormat {
  readonly abbreviated: FieldMapArrow<WeekdayType>;
  readonly narrow: FieldMapArrow<WeekdayType>;
  readonly wide: FieldMapArrow<WeekdayType>;
  readonly short: FieldMapArrow<WeekdayType>;
}

export interface WeekdaysFormats {
  readonly format: WeekdaysFormat;
  readonly standAlone: WeekdaysFormat;
}

export interface MonthsFormat {
  readonly abbreviated: FieldMapArrow<MonthType>;
  readonly narrow: FieldMapArrow<MonthType>;
  readonly wide: FieldMapArrow<MonthType>;
  readonly short: FieldMapArrow<MonthType>;
}

export interface MonthsFormats {
  readonly format: MonthsFormat;
  readonly standAlone: MonthsFormat;
}

export interface QuartersFormat {
  readonly abbreviated: FieldMapArrow<QuarterType>;
  readonly narrow: FieldMapArrow<QuarterType>;
  readonly wide: FieldMapArrow<QuarterType>;
  readonly short: FieldMapArrow<QuarterType>;
}

export interface QuartersFormats {
  readonly format: QuartersFormat;
  readonly standAlone: QuartersFormat;
}

export interface DayPeriodsFormat {
  readonly abbreviated: FieldMapIndexedArrow<DayPeriodType, Alt>;
  readonly narrow: FieldMapIndexedArrow<DayPeriodType, Alt>;
  readonly wide: FieldMapIndexedArrow<DayPeriodType, Alt>;
  readonly short: FieldMapIndexedArrow<DayPeriodType, Alt>;
}

export interface DayPeriodsFormats {
  readonly format: DayPeriodsFormat;
  readonly standAlone: DayPeriodsFormat;
}

export interface IntervalFormats {
  readonly field: FieldMapArrow<DateTimeFieldType>;
}

export interface Gregorian {
  readonly eras: ErasFormat;
  readonly weekdays: WeekdaysFormats;
  readonly months: MonthsFormats;
  readonly quarters: QuartersFormats;
  readonly dayPeriods: DayPeriodsFormats;
  readonly dateFormats: FieldMapArrow<FormatWidthType>;
  readonly dateTimeFormats: FieldMapArrow<FormatWidthType>;
  readonly timeFormats: FieldMapArrow<FormatWidthType>;
  readonly availableFormats: FieldMapArrow<AvailableFormatType>;
  readonly intervalFormats: ScopeArrow<IntervalFormatType, IntervalFormats>;
  readonly intervalFallbackFormat: FieldArrow;
}
