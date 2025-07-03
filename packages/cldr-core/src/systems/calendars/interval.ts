/**
 * @public
 */
export type TimePeriodField = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millis';

/**
 * @internal
 */
export const TIME_PERIOD_FIELDS: TimePeriodField[] = [
  'year',
  'month',
  'week',
  'day',
  'hour',
  'minute',
  'second',
  'millis',
];

/**
 * @public
 */
export interface TimePeriod {
  year: number;
  month: number;
  week: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millis: number;
}

export const timePeriod = (): TimePeriod => ({
  year: 0,
  month: 0,
  week: 0,
  day: 0,
  hour: 0,
  minute: 0,
  second: 0,
  millis: 0,
});

/**
 * @internal
 */
export const enum TimePeriodFieldFlag {
  YEAR = 1,
  MONTH = 2,
  WEEK = 4,
  DAY = 8,
  HOUR = 16,
  MINUTE = 32,
  SECOND = 64,
  MILLIS = 128,
}

/**
 * @internal
 */
export const TIME_FLAGS =
  TimePeriodFieldFlag.HOUR | TimePeriodFieldFlag.MINUTE | TimePeriodFieldFlag.SECOND | TimePeriodFieldFlag.MILLIS;

const FIELDMAP: { [x: string]: number } = {
  year: TimePeriodFieldFlag.YEAR,
  month: TimePeriodFieldFlag.MONTH,
  week: TimePeriodFieldFlag.WEEK,
  day: TimePeriodFieldFlag.DAY,
  hour: TimePeriodFieldFlag.HOUR,
  minute: TimePeriodFieldFlag.MINUTE,
  second: TimePeriodFieldFlag.SECOND,
  millis: TimePeriodFieldFlag.MILLIS,
};

/**
 * @internal
 */
export const timePeriodFieldFlags = (fields?: TimePeriodField[]): [number, number] => {
  let flags = 0;
  let smallest = TimePeriodFieldFlag.MILLIS;
  if (fields) {
    for (const field of fields) {
      const flag = FIELDMAP[field];
      if (flag) {
        flags |= flag;
        smallest = flag;
      }
    }
  }
  return [flags, smallest];
};
