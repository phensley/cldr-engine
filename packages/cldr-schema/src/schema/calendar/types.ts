import {
  DateTimePatternFieldType,
  DayPeriodType,
  EraWidthType,
  FieldArrow,
  FieldWidthType,
  FormatWidthType,
  PluralType,
  QuarterType,
  WeekdayType
} from '@phensley/cldr-types';

import { Vector1Arrow, Vector2Arrow } from '../arrows';

export const DateTimePatternFieldValues: DateTimePatternFieldType[] = [
  'y', 'M', 'd', 'a', 'H', 'm', 's'
];

export const DayPeriodValues: DayPeriodType[] = [
  'noon', 'midnight', 'am', 'pm', 'morning1', 'morning2',
  'afternoon1', 'afternoon2', 'evening1', 'evening2', 'night1', 'night2',
];

export const EraWidthValues: EraWidthType[] = [
  'names', 'abbr', 'narrow'
];

export const FieldWidthValues: FieldWidthType[] = [
  'abbreviated', 'narrow', 'short', 'wide'
];

export const FormatWidthValues: FormatWidthType[] = [
  'short', 'medium', 'long', 'full'
];

export const QuarterValues: QuarterType[] = [
  '1', '2', '3', '4'
];

export const WeekdayValues: WeekdayType[] = [
  '1', '2', '3', '4', '5', '6', '7'
];

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
  readonly availableFormats: Vector1Arrow<string>;
  readonly pluralFormats: Vector2Arrow<PluralType, string>;
  readonly intervalFormats: Vector2Arrow<DateTimePatternFieldType, string>;
  readonly dateFormats: Vector1Arrow<FormatWidthType>;
  readonly timeFormats: Vector1Arrow<FormatWidthType>;
  readonly dateTimeFormats: Vector1Arrow<FormatWidthType>;
  readonly intervalFormatFallback: FieldArrow;
}
