import { PluralType } from '../enums';
import { FieldArrow, Vector1Arrow, Vector2Arrow } from '../arrows';
import {
  DateTimePatternFieldType,
  DayPeriodType,
  EraWidthType,
  FormatWidthType
} from './enums';

// TODO: add function to determine plural category based on skeleton and date
export interface CalendarInfo {
  eras: string[];
  months: string[];
  availableFormats: string[];
  intervalFormats: string[];
}

export interface CalendarFields {
  readonly weekdays: Vector2Arrow<string, string>;
  readonly months: Vector2Arrow<string, string>;
  readonly quarters: Vector2Arrow<string, string>;
  readonly dayPeriods: Vector2Arrow<string, string>;
}

export interface CalendarSchema {
  readonly eras: Vector2Arrow<EraWidthType, string>;
  readonly format: CalendarFields;
  readonly standAlone: CalendarFields;
  readonly availableFormats: Vector2Arrow<PluralType, string>;
  readonly intervalFormats: Vector2Arrow<DateTimePatternFieldType, string>;
  readonly dateFormats: Vector1Arrow<FormatWidthType>;
  readonly timeFormats: Vector1Arrow<FormatWidthType>;
  readonly dateTimeFormats: Vector1Arrow<FormatWidthType>;
  readonly intervalFormatFallback: FieldArrow;
}
