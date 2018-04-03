import { Choice, Scope, FieldMap, field, fieldmap, scope, scopefield, scopemap } from './instructions';

import {
  DateTimePatternFieldValues,
  DayPeriodValues,
  FieldWidthValues,
  FormatWidthValues,
  GregorianInfo,
  QuarterValues,
  WeekdayValues,
} from '../schema';

const weekdays = FieldWidthValues.map(n => fieldmap(n, n, WeekdayValues));
const months = FieldWidthValues.map(n => fieldmap(n, n, GregorianInfo.months));
const quarters = FieldWidthValues.map(n => fieldmap(n, n, QuarterValues));
const dayPeriods = FieldWidthValues.map(n => fieldmap(n, n, DayPeriodValues, Choice.ALT));

const eras = (n: string) => fieldmap(n, n, GregorianInfo.eras);

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

  fieldmap('availableFormats', 'availableFormats', GregorianInfo.availableFormats),
  fieldmap('availableFormats', 'pluralAvailableFormats', GregorianInfo.pluralAvailableFormats, Choice.PLURAL),

  scopemap('intervalFormats', GregorianInfo.intervalFormats, [
    scopefield('field', DateTimePatternFieldValues)
  ]),

  field('intervalFormatFallback', 'intervalFormatFallback')
]);
