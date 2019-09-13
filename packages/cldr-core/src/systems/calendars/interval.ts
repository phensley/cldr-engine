import { UnitType } from '@phensley/cldr-schema';
import { Quantity } from '../../common';

export interface TimeSpanFields {
  year?: number;
  month?: number;
  week?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millis?: number;
}

export class TimeSpan implements TimeSpanFields {

  year?: number;
  month?: number;
  week?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millis?: number;

  constructor(fields: TimeSpanFields) {
    Object.assign(this, fields);
  }

  quantity(): Quantity[] {
    //
    const r: Quantity[] = [];
    for (const f of TIME_SPAN_FIELDS) {
      const v = this[f];
      if (v) {
        r.push({ unit: f as UnitType, value: v });
      }
    }
    return r;
  }
}

export const TIME_SPAN_FIELDS: (keyof TimeSpanFields)[] =
  ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millis'];
