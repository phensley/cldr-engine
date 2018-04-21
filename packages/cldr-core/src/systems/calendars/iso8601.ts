import { DayOfWeek } from './fields';
import { CalendarType } from './calendar';
import { CalendarConstants } from './constants';
import { GregorianDate } from './gregorian';

/**
 * Gregorian calendar with ISO-8601 first day of week and minimum days in week.
 *
 * type: iso8601
 */
export class ISO8601Date extends GregorianDate {

  private constructor(epoch: number, zoneId: string) {
    super('iso8601', epoch, zoneId, DayOfWeek.MONDAY, CalendarConstants.ISO8601_MIN_DAYS);
  }

  toString(): string {
    return this._toString('ISO8601');
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): ISO8601Date {
    // ISO-8601 dates use hard-coded firstDay and minDays
    return new ISO8601Date(epoch, zoneId);
  }

}
