import { CalendarConstants } from './constants';
import { GregorianDate } from './gregorian';
import { DateField } from './fields';
import { TimePeriod } from './interval';

/**
 * A date in the Buddhist calendar.
 *
 * type: buddhist
 */
export class BuddhistDate extends GregorianDate {

  protected constructor(firstDay: number, minDays: number) {
    super('buddhist', firstDay, minDays);
  }

  add(fields: TimePeriod): BuddhistDate {
    const [jd, ms] = this._add(fields);
    return new BuddhistDate(this._firstDay, this._minDays).initFromJD(jd, ms, this.timeZoneId());
  }

  withZone(zoneId: string): BuddhistDate {
    return new BuddhistDate(this._firstDay, this._minDays).initFromUnixEpoch(this.unixEpoch(), zoneId);
  }

  toString(): string {
    return this._toString('Buddhist');
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): BuddhistDate {
    return new BuddhistDate(firstDay, minDays).initFromUnixEpoch(epoch, zoneId);
  }

  protected initFromUnixEpoch(epoch: number, zoneId: string): BuddhistDate {
    super.initFromUnixEpoch(epoch, zoneId);
    this.initFields(this._fields);
    return this;
  }

  protected initFromJD(jd: number, msDay: number, zoneId: string): BuddhistDate {
    super.initFromJD(jd, msDay, zoneId);
    this.initFields(this._fields);
    return this;
  }

  protected initFields(f: number[]): void {
    super.initFields(f);
    computeBuddhistFields(f);
  }
}

const computeBuddhistFields = (f: number[]): void => {
  f[DateField.ERA] = 0;
  f[DateField.YEAR] = f[DateField.EXTENDED_YEAR] - CalendarConstants.BUDDHIST_ERA_START;
};
