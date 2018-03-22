import { FieldArrow, FieldMapArrow, FieldMapIndexedArrow, ScopeArrow } from '../arrows';
import { Alt } from '../enums';

import {
  AvailableFormatType,
  EraType,
  IntervalFormatType,
  MonthType
} from './enums';

import {
  DateTimePatternFieldType,
  DayPeriodsFormats,
  FormatWidthType,
  QuartersFormats,
  WeekdaysFormats
} from '../calendar';

export interface ErasFormat {
  readonly names: FieldMapArrow<EraType>;
  readonly abbr: FieldMapArrow<EraType>;
  readonly narrow: FieldMapArrow<EraType>;
}

export interface IntervalFormats {
  readonly field: FieldMapArrow<DateTimePatternFieldType>;
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

export interface GregorianSchema {
  readonly eras: ErasFormat;
  readonly weekdays: WeekdaysFormats;
  readonly months: MonthsFormats;
  readonly quarters: QuartersFormats;
  readonly dayPeriods: DayPeriodsFormats;
  readonly dateFormats: FieldMapArrow<FormatWidthType>;
  readonly dateTimeFormats: FieldMapArrow<FormatWidthType>;
  readonly timeFormats: FieldMapArrow<FormatWidthType>;
  readonly availableFormats: FieldMapIndexedArrow<AvailableFormatType, Alt>;
  readonly intervalFormats: ScopeArrow<IntervalFormatType, IntervalFormats>;
  readonly intervalFallbackFormat: FieldArrow;
}
