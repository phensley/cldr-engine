export const TIME_SPAN_FIELDS: (keyof TimeSpan)[] =
  ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millis'];

export interface TimeSpan {
  year?: number;
  month?: number;
  week?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millis?: number;
}
