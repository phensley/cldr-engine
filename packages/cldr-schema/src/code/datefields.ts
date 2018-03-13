import { Choice, Scope, FieldMap, field, fieldmap, scope, scopefield, scopemap } from './instructions';

import { DateFieldValues, RelativeTimeFieldValues, WeekdayValues } from '../schema';

const relativeTimes = (width: string) => scope(width, width, [
  field('relative-type--1', 'previous'),
  field('relative-type-0', 'current'),
  field('relative-type-1', 'next'),
  scope('relativeTime-type-future', 'future', [
    field('relativeTimePattern', 'pattern', Choice.PLURAL)
  ]),
  scope('relativeTime-type-past', 'past', [
    field('relativeTimePattern', 'pattern', Choice.PLURAL)
  ])
]);

export const DATEFIELDS: Scope = scope('DateFields', 'DateFields', [
  scopemap('relativeTimes', RelativeTimeFieldValues, [
    relativeTimes('wide'),
    relativeTimes('short'),
    relativeTimes('narrow')
  ]),
  fieldmap('displayName', 'displayName', DateFieldValues)
]);
