import { CalendarConstants } from './constants';
import { CalendarDateFields } from './calendar';
import { GregorianDate } from './gregorian';
import { DateField } from './fields';

/**
 * A date in the Buddhist calendar.
 *
 * type: buddhist
 */
export class BuddhistDate extends GregorianDate {

  private constructor(firstDay: number, minDays: number) {
    super('buddhist', firstDay, minDays);
  }

  add(fields: CalendarDateFields): BuddhistDate {
    const zoneId = fields.zoneId || this.timeZoneId();
    const [jd, ms] = this._add(fields);
    return new BuddhistDate(this._firstDay, this._minDays).initFromJD(jd, ms, zoneId);
  }

  toString(): string {
    return this._toString('Buddhist');
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): BuddhistDate {
    return new BuddhistDate(firstDay, minDays).initFromUnixEpoch(epoch, zoneId);
  }

  protected initFromUnixEpoch(epoch: number, zoneId: string): BuddhistDate {
    super.initFromUnixEpoch(epoch, zoneId);
    computeBuddhistFields(this._fields);
    return this;
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string): BuddhistDate {
    super.initFromJD(jd, msDay, zoneId);
    computeBuddhistFields(this._fields);
    return this;
  }
}

const computeBuddhistFields = (f: number[]): void => {
  f[DateField.ERA] = 0;
  f[DateField.YEAR] = f[DateField.EXTENDED_YEAR] - CalendarConstants.BUDDHIST_ERA_START;
};
