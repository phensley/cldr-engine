/// <reference path="../../../cldr-utils/__benchmarks__/typings.d.ts" />

import { Suite } from 'benchmark';
import { makeSuite } from '../../../cldr-utils/__benchmarks__/util';
import { calendarsApi } from '../../__tests__/_helpers';
import { CalendarsImpl, DateFormatOptions, GregorianDate, TimePeriod } from '../../src';
import { RelativeTimeFormatOptions } from '../../lib';

const BUNDLES: { [x: string]: CalendarsImpl} = {
  'en': calendarsApi('en'),
  'es': calendarsApi('es')
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

const DATES = [
  GregorianDate.fromUnixEpoch(952761625000, 'UTC', 1, 1),
  GregorianDate.fromUnixEpoch(969019200000, 'UTC', 1, 1),
  GregorianDate.fromUnixEpoch(967809600000, 'UTC', 1, 1),
];

const INCR: TimePeriod[] = [
  { day: 10, hour: 7 },
  { month: -3, day: -3 },
  { year: 0.5, month: 3, day: 82 }
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
      const engine = BUNDLES[k];
      const date = { date: e, zoneId: z };
      engine.formatDate(date, opts);
      formatDateSuite.add(`format ${k} ${e} ${z}`, () => {
        engine.formatDate(date, opts);
      });
    });
  });
  DATES.forEach(d => {
    INCR.forEach(i => {
      const opts: RelativeTimeFormatOptions = { dayOfWeek: true };
      const engine = BUNDLES[k];
      formatDateSuite.add(`relative time ${k} ${d.unixEpoch()} ${JSON.stringify(i)}`, () => {
        engine.formatRelativeTime(d, d.add(i), opts);
      });
    });
  });
});
