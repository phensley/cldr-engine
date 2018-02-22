import { Choice, Scope, FieldMap, fieldmap, scope, scopefield, scopemap } from './instructions';

import {
  AvailableFormatValues,
  DateTimeFieldValues,
  DayPeriodValues,
  EraValues,
  FieldWidthValues,
  FormatWidthValues,
  IntervalFormatValues,
  PluralValues,
  QuarterValues,
  MonthValues,
  WeekdayValues,
} from '../schema';

const weekdays = FieldWidthValues.map(n => fieldmap(n, n, WeekdayValues));
const months = FieldWidthValues.map(n => fieldmap(n, n, MonthValues));
const quarters = FieldWidthValues.map(n => fieldmap(n, n, QuarterValues));
const dayPeriods = FieldWidthValues.map(n => fieldmap(n, n, DayPeriodValues, Choice.ALT));

const eras = (n: string) => fieldmap(n, n, EraValues);

const scopeFormat = (map: FieldMap[]) => [
  scope('format', 'format', map),
  scope('stand-alone', 'standAlone', map)
];

const formatWidths = (n: string) => fieldmap(n, n, FormatWidthValues);

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

  fieldmap('availableFormats', 'availableFormats', AvailableFormatValues, Choice.ALT),

  scopemap('intervalFormats', IntervalFormatValues, [
    scopefield('field', DateTimeFieldValues)
  ])
]);
