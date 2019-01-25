import { DayOfWeek } from './fields';
import { CalendarDateFields } from './calendar';
import { CalendarConstants } from './constants';
import { GregorianDate } from './gregorian';

/**
 * Gregorian calendar with ISO-8601 first day of week and minimum days in week.
 *
 * type: iso8601
 *
 * @alpha
 */
export class ISO8601Date extends GregorianDate {

  private constructor() {
    // ISO-8601 dates use hard-coded firstDay and minDays
    super('iso8601', DayOfWeek.MONDAY, CalendarConstants.ISO8601_MIN_DAYS);
  }

  add(fields: CalendarDateFields): ISO8601Date {
    const zoneId = fields.zoneId || this.timeZoneId();
    const [jd, ms] = this._add(fields);
    return new ISO8601Date().initFromJD(jd, ms, zoneId) as ISO8601Date;
  }

  toString(): string {
    return this._toString('ISO8601');
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): ISO8601Date {
    return new ISO8601Date().initFromUnixEpoch(epoch, zoneId);
  }

  protected initFromUnixEpoch(epoch: number, zoneId: string): ISO8601Date {
    return super.initFromUnixEpoch(epoch, zoneId) as ISO8601Date;
  }
}
