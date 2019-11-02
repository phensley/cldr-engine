import { KeyIndexImpl } from '../instructions';

import { DateFieldType, DateFieldWidthType, RelativeTimeFieldType } from '@phensley/cldr-types';

export const DateFieldValues: DateFieldType[] = [
  'era', 'year', 'quarter', 'month', 'week',
  'weekday', 'weekdayOfMonth', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
  'day', 'dayperiod', 'hour', 'minute', 'second', 'zone'
];

export const DateFieldWidthValues: DateFieldWidthType[] = [
  'short', 'narrow', 'wide'
];

export const RelativeTimeFieldValues: RelativeTimeFieldType[] = [
  'year', 'quarter', 'month', 'week', 'day',
  'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'hour', 'minute', 'second'
];

export const DateFieldIndex = new KeyIndexImpl(DateFieldValues);
export const DateFieldWidthIndex = new KeyIndexImpl(DateFieldWidthValues);
export const RelativeTimeFieldIndex = new KeyIndexImpl(RelativeTimeFieldValues);
