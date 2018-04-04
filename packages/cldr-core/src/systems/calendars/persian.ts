import { CalendarDate, CalendarType } from './calendar';
import { Constants } from './constants';
import { DateField } from './fields';
import { floorDiv } from './utils';

export class PersianDate extends CalendarDate {

  protected constructor(epoch: number, zoneId: string, firstDay: number, minDays: number) {
    super(CalendarType.PERSIAN, epoch, zoneId, firstDay, minDays);
    computePersianFields(this._fields);
  }

  toString(): string {
    return this._toString('Persian');
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): PersianDate {
    return new PersianDate(epoch, zoneId, firstDay, minDays);
  }

  protected monthStart(eyear: number, month: number, useMonth: boolean): number {
    return Constants.JD_PERSIAN_EPOCH - 1 + 365 * (eyear - 1) + floor((8 * eyear + 21) / 33);
  }
}

const floor = Math.floor;

const MONTH_COUNT = [
  [  31,  31,   0 ], // Farvardin
  [  31,  31,  31 ], // Ordibehesht
  [  31,  31,  62 ], // Khordad
  [  31,  31,  93 ], // Tir
  [  31,  31, 124 ], // Mordad
  [  31,  31, 155 ], // Shahrivar
  [  30,  30, 186 ], // Mehr
  [  30,  30, 216 ], // Aban
  [  30,  30, 246 ], // Azar
  [  30,  30, 276 ], // Dey
  [  30,  30, 306 ], // Bahman
  [  29,  30, 336 ]  // Esfand
];

const computePersianFields = (f: number[]): void => {
  const jd = f[DateField.JULIAN_DAY];
  const days = jd - Constants.JD_PERSIAN_EPOCH;
  const year = 1 + floor((33 * days + 3) / 12053);
  const favardin1 = 365 * (year - 1) + floor((8 * year + 21) / 33);
  const doy = days - favardin1;
  const month = floor(doy < 216 ? (doy / 31) : ((doy - 6) / 30));
  const dom = doy - MONTH_COUNT[month][2] + 1;

  f[DateField.ERA] = 0;
  f[DateField.YEAR] = year;
  f[DateField.EXTENDED_YEAR] = year;
  f[DateField.MONTH] = month;
  f[DateField.DAY_OF_MONTH] = dom;
  f[DateField.DAY_OF_YEAR] = doy + 1;
  f[DateField.IS_LEAP] = leapPersian(year) ? 1 : 0;
};

/**
 * Return true if the given year is a leap year in the Persian calendar; false otherwise;
 */
const leapPersian = (y: number): boolean => {
  const rem: [number] = [0];
  floorDiv(25 * y + 11, 33, rem);
  return rem[0] < 8;
};
