import { add } from './add';
import { CalendarConstants } from './constants';
import { DateField } from './fields';
import { GregorianDate } from './gregorian';
import { TimePeriod } from './interval';
import { CalendarDateFields } from './types';

const ZEROS: Partial<CalendarDateFields> = { year: 1, month: 1, day: 1, hour: 0, minute: 0, second: 0, millis: 0 };

/**
 * A date in the Buddhist calendar.
 *
 * type: buddhist
 *
 * @public
 */
export class BuddhistDate extends GregorianDate {
  protected constructor(firstDay: number, minDays: number) {
    super('buddhist', firstDay, minDays);
  }

  set(fields: Partial<CalendarDateFields>): GregorianDate {
    return this._set({ ...this.fields(), ...fields });
  }

  add(fields: Partial<TimePeriod>): BuddhistDate {
    const [jd, ms] = add(this, fields);
    return this._new().initFromJD(jd, ms, this.timeZoneId());
  }

  withZone(zoneId: string): BuddhistDate {
    return this._new().initFromUnixEpoch(this.unixEpoch(), zoneId);
  }

  toString(): string {
    return this._toString('Buddhist');
  }

  static fromFields(fields: Partial<CalendarDateFields>, firstDay: number, minDays: number): BuddhistDate {
    return new BuddhistDate(firstDay, minDays)._set({ ...ZEROS, ...fields }) as BuddhistDate;
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): BuddhistDate {
    return new BuddhistDate(firstDay, minDays).initFromUnixEpoch(epoch, zoneId);
  }

  protected _new(): BuddhistDate {
    return new BuddhistDate(this._firstDay, this._minDays);
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
