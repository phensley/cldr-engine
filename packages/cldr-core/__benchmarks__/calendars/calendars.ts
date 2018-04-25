import { Suite } from 'benchmark';
import { makeSuite, readLines } from '../util';
import { GregorianDate } from '../../src';

export const calendarsSuite: Suite = makeSuite('ZonedDateTime');

const EPOCH = 1520693966000;

const ZONES = [undefined, 'UTC', 'America/New_York', 'Europe/London'];

ZONES.forEach(z => {
  calendarsSuite.add(`construct ${z}`, () => {
    const d = GregorianDate.fromUnixEpoch(EPOCH, z as string, 1, 1);
  });
});
