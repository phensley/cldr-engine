import { TZ } from '@phensley/timezone';
import { add } from './add';
import { CalendarDate } from './calendar';
import { daysInMonth, initGregorianFields, leapGregorian, monthStart, ymdToJD } from './gregorianmath';
import { TimePeriod } from './interval';
import { unixEpochFromJD } from './math';
import { CalendarDateFields, CalendarType } from './types';

const ZEROS: Partial<CalendarDateFields> = {
  year: 1970,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millis: 0,
};

/**
 * Construct a date using the rules of the Gregorian calendar.
 *
 * type: gregory
 *
 * @public
 */
export class GregorianDate extends CalendarDate {
  static _init: void = ((): void => {
    CalendarDate._gregorian = (d, utc, fd, md): GregorianDate =>
      GregorianDate.fromUnixEpoch(d.unixEpoch(), utc ? 'Etc/UTC' : d.timeZoneId(), fd, md);
  })();

  protected constructor(type: CalendarType, firstDay: number, minDays: number) {
    super(type, firstDay, minDays);
  }

  /**
   * Set fields
   *
   * @public
   */
  set(fields: Partial<CalendarDateFields>): GregorianDate {
    return this._set({ ...this.fields(), ...fields });
  }

  /**
   * Add the fields to this date.
   *
   * @public
   */
  add(fields: Partial<TimePeriod>): GregorianDate {
    const [jd, ms] = add(this, fields);
    return this._new().initFromJD(jd, ms, this.timeZoneId());
  }

  /**
   * Subtract the fields from this date.
   *
   * @public
   */
  subtract(fields: Partial<TimePeriod>): GregorianDate {
    return this.add(this._negatePeriod(fields));
  }

  /**
   * Change the timezone, returning a new date.
   *
   * @public
   */
  withZone(zoneId: string): GregorianDate {
    return this._new().initFromUnixEpoch(this.unixEpoch(), zoneId);
  }

  /**
   * String representation of the date and time.
   *
   * @public
   */
  toString(): string {
    return this._toString('Gregorian');
  }

  /**
   * Construct a new date from the given fields.
   *
   * @public
   */
  static fromFields(fields: Partial<CalendarDateFields>, firstDay: number = 1, minDays: number = 1): GregorianDate {
    return new GregorianDate('gregory', firstDay, minDays)._set({ ...ZEROS, ...fields });
  }

  /**
   * Construct a new date from the given UNIX epoch.
   *
   * @public
   */
  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number = 1, minDays: number = 1): GregorianDate {
    return new GregorianDate('gregory', firstDay, minDays).initFromUnixEpoch(epoch, zoneId);
  }

  protected _new(): GregorianDate {
    return new GregorianDate('gregory', this._firstDay, this._minDays);
  }

  protected initFromUnixEpoch(epoch: number, zoneId: string): GregorianDate {
    super.initFromUnixEpoch(epoch, zoneId);
    initGregorianFields(this._fields);
    return this;
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string): GregorianDate {
    super.initFromJD(jd, msDay, zoneId);
    initGregorianFields(this._fields);
    return this;
  }

  // TODO: reorganize calendar-specific methods
  protected daysInMonth(y: number, m: number): number {
    return daysInMonth(y, m);
  }

  // TODO: reorganize calendar-specific methods
  protected daysInYear(y: number): number {
    return leapGregorian(y) ? 366 : 365;
  }

  protected monthCount(): number {
    return 12;
  }

  protected monthStart(eyear: number, month: number, _useMonth: boolean): number {
    return monthStart(eyear, month, _useMonth);
  }

  protected _set(f: Partial<CalendarDateFields>): GregorianDate {
    const jd = ymdToJD(f.year!, f.month!, f.day!, this.monthCount());
    const ms = this._timeToMs(f);
    const epoch = unixEpochFromJD(jd, ms);
    const zoneId = f.zoneId || this.timeZoneId();
    // Find UTC epoch for wall clock time in the requested timezone
    const r = TZ.fromWall(zoneId, epoch);
    return this._new().initFromUnixEpoch(r ? r[0] : epoch, zoneId);
  }
}
