import { CalendarDate } from './calendar';
import { CalendarConstants } from './constants';
import { DateField } from './fields';
import { floorDiv } from './utils';
import { TimePeriod } from './interval';
import { CalendarDateFields } from './types';

/**
 * Construct a date using the rules of the Persian calendar.
 *
 * type: persian
 *
 * @public
 */
export class PersianDate extends CalendarDate {

  protected constructor(firstDay: number, minDays: number) {
    super('persian', firstDay, minDays);
  }

  relatedYear(): number {
    return this._fields[DateField.EXTENDED_YEAR] + 622;
  }

  set(fields: Partial<CalendarDateFields>): PersianDate {
    const f = { ...this.fields(), ...fields };
    const jd = this._ymdToJD(f.year!, f.month!, f.day!);
    const ms = this._timeToMs(f) - this.timeZoneOffset();
    return this._new().initFromJD(jd, ms, this.timeZoneId());
  }

  add(fields: TimePeriod): PersianDate {
    const [jd, ms] = this._add(fields);
    return this._new().initFromJD(jd, ms, this.timeZoneId());
  }

  subtract(fields: TimePeriod): PersianDate {
    return this.add(this._invertPeriod(fields));
  }

  withZone(zoneId: string): PersianDate {
    return this._new().initFromUnixEpoch(this.unixEpoch(), zoneId);
  }

  toString(): string {
    return this._toString('Persian');
  }

  static fromFields(fields: Partial<CalendarDateFields>, firstDay: number, minDays: number): PersianDate {
    return new PersianDate(firstDay, minDays).set({ year: 1, month: 1, day: 1, ...fields });
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): PersianDate {
    return new PersianDate(firstDay, minDays).initFromUnixEpoch(epoch, zoneId);
  }

  protected _new(): PersianDate {
    return new PersianDate(this._firstDay, this._minDays);
  }

  protected initFromUnixEpoch(epoch: number, zoneId: string): PersianDate {
    super.initFromUnixEpoch(epoch, zoneId);
    computePersianFields(this._fields);
    return this;
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string): PersianDate {
    super.initFromJD(jd, msDay, zoneId);
    computePersianFields(this._fields);
    return this;
  }

  protected initFields(f: number[]): void {
    computePersianFields(f);
  }

  protected monthCount(): number {
    return 12;
  }

  protected daysInMonth(y: number, m: number): number {
    return MONTH_COUNT[m][leapPersian(y) ? 1 : 0];
  }

  protected daysInYear(y: number): number {
    return leapPersian(y) ? 366 : 365;
  }

  protected monthStart(eyear: number, month: number, _useMonth: boolean): number {
    let jd = CalendarConstants.JD_PERSIAN_EPOCH - 1 + 365 * (eyear - 1) + floor((8 * eyear + 21) / 33);
    if (month !== 0) {
      const mc = MONTH_COUNT;
      const m = floor(month);
      const d = month - m;

      jd += mc[m][2];

      // TODO: we never reach the block below since all internal uses of monthStart
      // pass in an integer

      // Check if there is a fractional month part, and if so add the number
      // of the days in the next month multiplied by the fraction
      /* istanbul ignore if */
      if (d !== 0) {
        // number of days in Esfand determined by:
        // "number of days between two vernal equinoxes"
        const isLeap = leapPersian(eyear);

        // note: the 'month' parameter must always be <= # months in the calendar
        // year, so <= 12 in this case.
        jd += d * mc[m + 1][isLeap ? 1 : 0];
      }
    }
    return jd;
  }

  private _ymdToJD(y: number, m: number, d: number): number {
    y |= 0;
    const leap = leapPersian(y);
    const mc = this.monthCount();
    m = m < 1 ? 1 : m > mc ? mc : m;
    const dc = MONTH_COUNT[m - 1][leap ? 1 : 0];
    d = d < 1 ? 1 : d > dc ? dc : d;

    const favardin1 = 365 * (y - 1) + floor((8 * y + 21) / 33);
    const mdays = MONTH_COUNT[m - 1][2];
    const days = favardin1 + d + mdays - 1;
    return days + CalendarConstants.JD_PERSIAN_EPOCH;
  }
}

const floor = Math.floor;

const MONTH_COUNT = [
  [31, 31, 0], // Farvardin
  [31, 31, 31], // Ordibehesht
  [31, 31, 62], // Khordad
  [31, 31, 93], // Tir
  [31, 31, 124], // Mordad
  [31, 31, 155], // Shahrivar
  [30, 30, 186], // Mehr
  [30, 30, 216], // Aban
  [30, 30, 246], // Azar
  [30, 30, 276], // Dey
  [30, 30, 306], // Bahman
  [29, 30, 336]  // Esfand
];

const computePersianFields = (f: number[]): void => {
  const jd = f[DateField.JULIAN_DAY];
  const days = jd - CalendarConstants.JD_PERSIAN_EPOCH;
  const year = 1 + floor((33 * days + 3) / 12053);

  const favardin1 = 365 * (year - 1) + floor((8 * year + 21) / 33);
  const doy = days - favardin1;
  const month = floor(doy < 216 ? (doy / 31) : ((doy - 6) / 30));
  const dom = doy - MONTH_COUNT[month][2] + 1;

  f[DateField.ERA] = 0;
  f[DateField.YEAR] = year;
  f[DateField.EXTENDED_YEAR] = year;
  f[DateField.MONTH] = month + 1;
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
