export const enum DayOfWeek {
  SUNDAY = 1,
  MONDAY = 2,
  TUESDAY = 3,
  WEDNESDAY = 4,
  THURSDAY = 5,
  FRIDAY = 6,
  SATURDAY = 7
}

export const enum DateField {
  LOCAL_MILLIS = 0,
  JULIAN_DAY,
  ERA,
  EXTENDED_YEAR,
  YEAR,
  YEAR_WOY,
  WEEK_OF_YEAR,
  MONTH,
  DAY_OF_YEAR,
  DAY_OF_MONTH,
  DAY_OF_WEEK,
  MILLIS_IN_DAY,
  AM_PM,
  HOUR_OF_DAY,
  HOUR,
  MINUTE,
  SECOND,
  MILLIS,
  TZ_OFFSET,
  IS_LEAP,
  IS_DST // 20
}

// 21 fields
export const dateFields = () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
