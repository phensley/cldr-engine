import { Choice, Scope, FieldMap, field, fieldmap, scope, scopefield, scopemap } from '../types';

import { DateFieldValues, RelativeTimeFieldValues, WeekdayValues } from '../schema';

const relativeTimes = (width: string) => scope(width, width, [
  field('relative-type--2', 'previous2'),
  field('relative-type--1', 'previous'),
  field('relative-type-0', 'current'),
  field('relative-type-1', 'next'),
  field('relative-type-2', 'next2'),
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

/**

VectorArrow1<RelativeTimeFieldValues, RelativeTimePatternWidth>
  vector arrow1: 'relative'
  key index: RelativeTimeFieldValues
  dim0: 'wide' | 'short' | 'narrow'

VectorArrow2<RelativeTimeFieldType, RelativeTimeFuturePast, PluralValues>

  name: 'relativeTimes'
  key index: RelativeTimeFieldValues
  dim0: 'future' | 'past'
  dim2: <plural>

VectorArrow<DateTimeFieldType>

  vector arrow0: 'displayName'
  key index: DateFieldValues

  */
