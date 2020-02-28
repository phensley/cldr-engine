import { KeyIndexImpl } from '../instructions';

import { DateFieldType, DateFieldWidthType, RelativeTimeFieldType } from '@phensley/cldr-types';

/**
 * @public
 */
export const DateFieldValues: DateFieldType[] = [
  'era', 'year', 'quarter', 'month', 'week',
  'weekday', 'weekdayOfMonth', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
  'day', 'dayperiod', 'hour', 'minute', 'second', 'zone'
];

/**
 * @public
 */
export const DateFieldWidthValues: DateFieldWidthType[] = [
  'short', 'narrow', 'wide'
];

/**
 * @public
 */
export const RelativeTimeFieldValues: RelativeTimeFieldType[] = [
  'year', 'quarter', 'month', 'week', 'day',
  'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'hour', 'minute', 'second'
];

/**
 * @public
 */
export const DateFieldIndex = new KeyIndexImpl(DateFieldValues);

/**
 * @public
 */
export const DateFieldWidthIndex = new KeyIndexImpl(DateFieldWidthValues);

/**
 * @public
 */
export const RelativeTimeFieldIndex = new KeyIndexImpl(RelativeTimeFieldValues);
