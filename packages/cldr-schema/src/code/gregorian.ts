import { Choice, Scope, fieldmap, scope, scopefield, scopemap } from './instructions';
import { PluralValues } from '../schema/enums';
import {
  AvailableFormatValues,
  DateTimeFieldValues,
  DayPeriodValues,
  EraValues,
  FieldWidthValues,
  FormatWidthValues,
  IntervalFormatValues,
  QuarterValues,
  MonthValues,
  WeekdayValues,
} from '../schema/gregorian';

const eras = (n: string) => fieldmap(n, EraValues);

const weekdays = (n: string) => fieldmap(n, WeekdayValues);
const weekdaysFormat = (n: string) => scope(n, FieldWidthValues.map(weekdays));

const months = (n: string) => fieldmap(n, MonthValues);
const monthsFormat = (n: string) => scope(n, FieldWidthValues.map(months));

const quarters = (n: string) => fieldmap(n, QuarterValues);
const quartersFormat = (n: string) => scope(n, FieldWidthValues.map(quarters));

const dayPeriods = (n: string) => fieldmap(n, DayPeriodValues);
const dayPeriodsFormat = (n: string) => scope(n, FieldWidthValues.map(dayPeriods));

const formatWidths = (n: string) => fieldmap(n, FormatWidthValues);

export const GREGORIAN: Scope = scope('Gregorian', [
  scope('eras', [
    eras('names'),
    eras('abbr'),
    eras('narrow')
  ]),

  scope('weekdays', [
    weekdaysFormat('format'),
    weekdaysFormat('stand-alone')
  ]),

  scope('months', [
    monthsFormat('format'),
    monthsFormat('stand-alone')
  ]),

  scope('dayPeriods', [
    dayPeriodsFormat('format'),
    dayPeriodsFormat('stand-alone')
  ]),

  formatWidths('dateFormats'),
  formatWidths('dateTimeFormats'),
  formatWidths('timeFormats'),

  fieldmap('availableFormats', AvailableFormatValues, Choice.ALT),

  scopemap('intervalFormats', IntervalFormatValues, [
    scopefield('field', DateTimeFieldValues)
  ])
]);
