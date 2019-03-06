import { field, scope, vector1, vector2, KeyIndex, Scope } from '../types';

import {
  BuddhistAvailableFormatIndex,
  BuddhistEraIndex,
  BuddhistIntervalFormatIndex,
  BuddhistMonthIndex
} from '../schema';

const formats = (name: string, rename: string) => scope(name, rename, [
  vector2('weekdays', 'field-width', 'weekday'),
  vector2('months', 'field-width', 'buddhist-month'),
  vector2('quarters', 'field-width', 'quarter'),
  vector2('dayPeriods', 'field-width', 'day-period'),
]);

export const BUDDHIST: Scope = scope('Buddhist', 'Buddhist', [
  vector2('eras', 'era-type', 'buddhist-era'),
  formats('format', 'format'),
  formats('standAlone', 'standAlone'),
  vector2('availableFormats', 'plural-key', 'buddhist-available-format'),
  vector2('intervalFormats', 'date-time-pattern-field', 'buddhist-interval-format'),
  vector1('dateFormats', 'format-width'),
  vector1('timeFormats', 'format-width'),
  vector1('dateTimeFormats', 'format-width'),
  field('intervalFormatFallback')
]);

export const BUDDHIST_INDICES = {
  'buddhist-available-format': BuddhistAvailableFormatIndex,
  'buddhist-era': BuddhistEraIndex,
  'buddhist-interval-format': BuddhistIntervalFormatIndex,
  'buddhist-month': BuddhistMonthIndex
};
