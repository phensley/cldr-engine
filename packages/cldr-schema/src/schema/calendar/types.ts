import { Alt } from '../enums';
import { FieldMapArrow, FieldMapIndexedArrow } from '../arrows';
import { DayPeriodType, QuarterType, WeekdayType } from './enums';

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
