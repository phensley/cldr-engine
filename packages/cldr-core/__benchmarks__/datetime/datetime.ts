import { makeSuite, readLines } from '../util';
import { ZonedDateTime } from '../../src';

export const datetimeSuite = makeSuite('ZonedDateTime');

const EPOCH = 1520693966000;

const ZONES = [undefined, 'UTC', 'America/New_York', 'Europe/London'];

ZONES.forEach(z => {
  datetimeSuite.add(`construct ${z}`, () => {
    const d = new ZonedDateTime(EPOCH, z);
  });
});
