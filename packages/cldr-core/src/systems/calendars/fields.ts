export const enum DayOfWeek {
  SUNDAY = 1,
  MONDAY = 2,
  TUESDAY = 3,
  WEDNESDAY = 4,
  THURSDAY = 5,
  FRIDAY = 6,
  SATURDAY = 7,
}

export const enum DateField {
  // Milliseconds from Unix epoch, adjusted by local timezone offset
  LOCAL_MILLIS = 0,
  // Date in Julian days
  JULIAN_DAY,
  ERA,
  EXTENDED_YEAR,
  YEAR,
  YEAR_WOY,
  WEEK_OF_YEAR,
  MONTH,
  WEEK_OF_MONTH,
  DAY_OF_YEAR,
  DAY_OF_MONTH,
  DAY_OF_WEEK,
  DAY_OF_WEEK_IN_MONTH,
  MILLIS_IN_DAY,
  AM_PM,
  HOUR_OF_DAY,
  HOUR,
  MINUTE,
  SECOND,
  MILLIS,
  TZ_OFFSET,
  IS_LEAP,
  IS_DST,
  ISO_YEAR_WOY,
  ISO_WEEK_OF_YEAR, // 24
}

// 25 fields
export const dateFields = (): number[] => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
