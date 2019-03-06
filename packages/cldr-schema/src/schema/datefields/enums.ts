export type DateFieldType = 'era' | 'year' | 'quarter' | 'month' | 'week' |
  'weekday' | 'weekdayOfMonth' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' |
  'day' | 'dayperiod' | 'hour' | 'minute' | 'second' | 'zone';

export const DateFieldValues: DateFieldType[] = [
  'era', 'year', 'quarter', 'month', 'week',
  'weekday', 'weekdayOfMonth', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
  'day', 'dayperiod', 'hour', 'minute', 'second', 'zone'
];

export const enum DateField {
  ERA = 'era',
  YEAR = 'year',
  QUARTER = 'quarter',
  MONTH = 'month',
  WEEK = 'week',
  WEEK_OF_MONTH = 'weekOfMonth',
  DAY = 'day',
  DAY_OF_YEAR = 'dayOfYear',
  WEEKDAY = 'weekday',
  WEEKDAY_OF_MONTH = 'weekdayOfMonth',
  SUN = 'sun',
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  DAY_PERIOD = 'dayperiod',
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second',
  ZONE = 'zone'
}

export type RelativeTimeFieldType = 'year' | 'quarter' | 'month' | 'week' | 'day' |
  'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'hour' | 'minute' | 'second';

export const RelativeTimeFieldValues: RelativeTimeFieldType[] = [
  'year', 'quarter', 'month', 'week', 'day',
  'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'hour', 'minute', 'second'
];

export const enum RelativeTimeField {
  YEAR = 'year',
  QUARTER = 'quarter',
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day',
  SUN = 'sun',
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  HOUR = 'hour',
  MINUTE = 'minute',
  SECOND = 'second'
}

export type RelativeTimeWidthType = 'short' | 'narrow' | 'wide';

export const RelativeTimeWidthValues: RelativeTimeWidthType[] = [
  'short', 'narrow', 'wide'
];

export const enum RelativeTimeWidth {
  SHORT = 'short',
  NARROW = 'narrow',
  WIDE = 'wide'
}
