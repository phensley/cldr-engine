import { CalendarConstants } from './constants';
import { GregorianDate } from './gregorian';
import { DateField } from './fields';

/**
 * A date in the Buddhist calendar.
 *
 * type: buddhist
 */
export class BuddhistDate extends GregorianDate {

  constructor(epoch: number, zoneId: string, firstDay: number, minDays: number) {
    super('buddhist', epoch, zoneId, firstDay, minDays);
    computeBuddhistFields(this._fields);
  }

  toString(): string {
    return this._toString('Buddhist');
  }

  static fromUnixEpoch(epoch: number, zoneId: string, firstDay: number, minDays: number): BuddhistDate {
    return new BuddhistDate(epoch, zoneId, firstDay, minDays);
  }
}

const computeBuddhistFields = (f: number[]): void => {
  f[DateField.ERA] = 0;
  f[DateField.YEAR] = f[DateField.EXTENDED_YEAR] - CalendarConstants.BUDDHIST_ERA_START;
};
