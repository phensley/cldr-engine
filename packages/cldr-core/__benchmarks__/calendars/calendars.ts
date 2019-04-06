import { Suite } from 'benchmark';
import { makeSuite } from '../util';
import { CalendarsImpl, DateFormatOptions, GregorianDate, InternalsImpl, PrivateApiImpl } from '../../src';
import { EN, ES } from '../bundles';
import { Bundle } from '../../src/resource';

const INTERNALS = new InternalsImpl();
const BUNDLES: { [x: string]: Bundle} = {
  'en': EN,
  'es': ES
};

export const gregorianSuite: Suite = makeSuite('GregorianDate');
export const formatDateSuite: Suite = makeSuite('Calendars.formatDate');

const ZONES = [
  undefined,
  'UTC',
  'America/New_York',
  'Europe/London',
];

const EPOCHS = [
  // Mar 10 2018
  1520693966000,
  // Gregorian Oct 15 1582
  // -12219256128000,
  // Battle of Hastings, Oct 14 1066
  -28502718528000,
  // Fire of London, Sep 2 1666
  // -9572087379000,
  // Magna Carta, Jun 15 1215
  -23811152979000
];

ZONES.forEach(z => {
  EPOCHS.forEach(e => {
    gregorianSuite.add(`construct ${e} ${z}`, () => {
      GregorianDate.fromUnixEpoch(e, z as string, 1, 1);
    });
  });
});

Object.keys(BUNDLES).forEach(k => {
  ZONES.forEach(z => {
    EPOCHS.forEach(e => {
      const opts: DateFormatOptions = { datetime: 'full' };
      const privateApi = new PrivateApiImpl(BUNDLES[k], INTERNALS);
      const engine = new CalendarsImpl(BUNDLES[k], INTERNALS, privateApi);
      const date = { date: e, zoneId: z };
      engine.formatDate(date, opts);
      formatDateSuite.add(`format ${k} ${e} ${z}`, () => {
        engine.formatDate(date, opts);
      });
    });
  });
});
