import { Alt, Plural } from '../enums';
import { FieldArrow, FieldMapArrow, FieldMapIndexedArrow, ScopeArrow } from '../arrows';
import { DateTimePatternFieldType, DayPeriodType, FormatWidthType, QuarterType, WeekdayType } from './enums';

// Types common to all calendars

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

export interface ErasFormat {
  readonly names: FieldMapArrow<string>;
  readonly abbr: FieldMapArrow<string>;
  readonly narrow: FieldMapArrow<string>;
}

export interface MonthsFormat {
  readonly abbreviated: FieldMapArrow<string>;
  readonly narrow: FieldMapArrow<string>;
  readonly wide: FieldMapArrow<string>;
  readonly short: FieldMapArrow<string>;
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

export interface CalendarInfo {
  eras: string[];
  months: string[];
  availableFormats: string[];
  pluralAvailableFormats: string[];
  intervalFormats: string[];
}

export interface IntervalFormats {
  readonly field: FieldMapArrow<DateTimePatternFieldType>;
}

export interface CalendarSchema {
  readonly eras: ErasFormat;
  readonly weekdays: WeekdaysFormats;
  readonly months: MonthsFormats;
  readonly quarters: QuartersFormats;
  readonly dayPeriods: DayPeriodsFormats;
  readonly dateFormats: FieldMapArrow<FormatWidthType>;
  readonly dateTimeFormats: FieldMapArrow<FormatWidthType>;
  readonly timeFormats: FieldMapArrow<FormatWidthType>;
  readonly availableFormats: FieldMapArrow<string>;
  readonly pluralAvailableFormats: FieldMapIndexedArrow<string, Plural>;
  readonly intervalFormats: ScopeArrow<string, IntervalFormats>;
  readonly intervalFormatFallback: FieldArrow;
}
