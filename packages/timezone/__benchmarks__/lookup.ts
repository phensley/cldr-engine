import { Suite } from 'benchmark';
import { makeSuite } from './util';
import { Tz } from '../src';

const asUTC = (d: number | Date) =>
  typeof d === 'number' ? d : (+d) - d.getTimezoneOffset() * 60000;

const DATES = [
  new Date(1000, 3, 1),
  new Date(1890, 3, 1),
  new Date(1962, 3, 1),
  new Date(1987, 3, 5),
  new Date(1998, 6, 11),
  new Date()
];

const ZONES = [
  'UTC',
  'America/New_York',
  'Asia/Qyzylorda'
];

export const timezoneSuite: Suite = makeSuite('Timezone');

const tz = new Tz();
ZONES.forEach(zid => {
  DATES.forEach(date => {
    const utc = asUTC(date);
    timezoneSuite.add(`lookup ${zid} ${date.toUTCString()}`, () => {
      tz.get(zid, utc);
    });
  });
});
