import { field, scope, vector1, vector2 } from '../types';

const formats = (name: string, rename: string, month: string) => scope(name, rename, [
  vector2('weekdays', 'field-width', 'weekday'),
  vector2('months', 'field-width', `${month}-month`),
  vector2('quarters', 'field-width', 'quarter'),
  vector2('dayPeriods', 'field-width', 'day-period'),
]);

export const calendarScope = (name: string, scopeName: string) => scope(scopeName, scopeName, [
  vector2('eras', 'era-type', `${name}-era`),
  formats('format', 'format', name),
  formats('standAlone', 'standAlone', name),
  vector2('availableFormats', 'plural-key', `${name}-available-format`),
  vector2('intervalFormats', 'date-time-pattern-field', `${name}-interval-format`),
  vector1('dateFormats', 'format-width'),
  vector1('timeFormats', 'format-width'),
  vector1('dateTimeFormats', 'format-width'),
  field('intervalFormatFallback')
]);
