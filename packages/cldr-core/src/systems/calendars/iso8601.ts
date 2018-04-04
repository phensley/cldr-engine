import { DayOfWeek } from './fields';
import { CalendarType } from './calendar';
import { Constants } from './constants';
import { GregorianDate } from './gregorian';

export class ISO8601Date extends GregorianDate {

  private constructor(epoch: number, zoneId: string) {
    super(CalendarType.ISO8601, epoch, zoneId, DayOfWeek.MONDAY, Constants.ISO8601_MIN_DAYS);
  }

  toString(): string {
    return this._toString('ISO8601');
  }

  static fromUnixEpoch(epoch: number, zoneId: string): ISO8601Date {
    return new ISO8601Date(epoch, zoneId);
  }

}
