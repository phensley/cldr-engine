// TODO: may not need this
export type DateFieldSymbol = 'G' | 'y' | 'Y' | 'u' | 'U' | 'r' | 'Q' | 'q' | 'M' | 'L' | 'l' | 'w' | 'W' |
  'd' | 'D' | 'F' | 'g' | 'E' | 'e' | 'c' | 'a' | 'b' | 'B' | 'h' | 'H' | 'K' | 'k' | 'j' | 'J' | 'C' | 'm' |
  's' | 'S' | 'A' | 'z' | 'Z' | 'O' | 'v' | 'V' | 'X' | 'x';

export type DateFieldType = 'era' | 'year' | 'quarter' | 'month' | 'week' |
  'weekday' | 'weekdayOfMonth' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' |
  'day' | 'dayperiod' | 'hour' | 'minute' | 'second' | 'zone';

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

export type DateFieldWidthType = 'short' | 'narrow' | 'wide';

export const enum DateFieldWidth {
  SHORT = 'short',
  NARROW = 'narrow',
  WIDE = 'wide'
}

export type RelativeTimeFieldType = 'year' | 'quarter' | 'month' | 'week' | 'day' |
  'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'hour' | 'minute' | 'second';

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
