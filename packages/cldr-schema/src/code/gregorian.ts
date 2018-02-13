import { Choice, Scope, FieldMap, fieldmap, scope, scopefield, scopemap } from './instructions';
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

const weekdays = FieldWidthValues.map(n => fieldmap(n, WeekdayValues));
const months = FieldWidthValues.map(n => fieldmap(n, MonthValues));
const quarters = FieldWidthValues.map(n => fieldmap(n, QuarterValues));
const dayPeriods = FieldWidthValues.map(n => fieldmap(n, DayPeriodValues));

const eras = (n: string) => fieldmap(n, EraValues);

const scopeFormat = (map: FieldMap[]) => [
  scope('format', 'format', map),
  scope('stand-alone', 'standAlone', map)
];

const formatWidths = (n: string) => fieldmap(n, FormatWidthValues);

export const GREGORIAN: Scope = scope('Gregorian', 'Gregorian', [
  scope('eras', 'eras', [
    eras('names'),
    eras('abbr'),
    eras('narrow')
  ]),

  scope('weekdays', 'weekdays', scopeFormat(weekdays)),
  scope('months', 'months', scopeFormat(months)),
  scope('quarters', 'quarters', scopeFormat(quarters)),
  scope('dayPeriods', 'dayPeriods', scopeFormat(dayPeriods)),

  formatWidths('dateFormats'),
  formatWidths('dateTimeFormats'),
  formatWidths('timeFormats'),

  fieldmap('availableFormats', AvailableFormatValues, Choice.ALT),

  scopemap('intervalFormats', IntervalFormatValues, [
    scopefield('field', DateTimeFieldValues)
  ])
]);
