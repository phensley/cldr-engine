import { DayOfWeek } from './fields';
import { CalendarConstants } from './constants';
import { GregorianDate } from './gregorian';
import { TimePeriod } from './interval';

/**
 * Gregorian calendar with ISO-8601 first day of week and minimum days in week.
 *
 * type: iso8601
 *
 * @public
 */
export class ISO8601Date extends GregorianDate {

  protected constructor() {
    // ISO-8601 dates use hard-coded firstDay and minDays
    super('iso8601', DayOfWeek.MONDAY, CalendarConstants.ISO8601_MIN_DAYS);
  }

  add(fields: TimePeriod): ISO8601Date {
    const [jd, ms] = this._add(fields);
    return this._new().initFromJD(jd, ms, this.timeZoneId()) as ISO8601Date;
  }

  toString(): string {
    return this._toString('ISO8601');
  }

  withZone(zoneId: string): ISO8601Date {
    return this._new().initFromUnixEpoch(this.unixEpoch(), zoneId);
  }

  static fromUnixEpoch(epoch: number, zoneId: string, _firstDay: number, _minDays: number): ISO8601Date {
    return new ISO8601Date().initFromUnixEpoch(epoch, zoneId);
  }

  protected _new(): ISO8601Date {
    return new ISO8601Date();
  }

  protected initFromUnixEpoch(epoch: number, zoneId: string): ISO8601Date {
    return super.initFromUnixEpoch(epoch, zoneId) as ISO8601Date;
  }
}
