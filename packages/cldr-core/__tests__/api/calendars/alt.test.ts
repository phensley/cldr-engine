import { calendarsApi } from '../../_helpers';
import { CalendarsImpl, ZonedDateTime } from '../../../src';

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const LOS_ANGELES = 'America/Los_Angeles';

test('java alt examples', () => {
  const apr17 = unix(1587126896000, 'America/New_York');
  let api: CalendarsImpl;
  let s: string;

  api = calendarsApi('en');
  s = api.formatDate(apr17, { skeleton: 'GyMMd' });
  expect(s).toEqual('04/17/2020 AD');

  s = api.formatDate(apr17, { skeleton: 'GGGGyMMd' });
  expect(s).toEqual('04/17/2020 Anno Domini');

  s = api.formatDate(apr17, { skeleton: 'GyMMd', alt: { era: 'sensitive' } });
  expect(s).toEqual('04/17/2020 CE');

  s = api.formatDate(apr17, { skeleton: 'GGGGyMMd', alt: { era: 'sensitive' } });
  expect(s).toEqual('04/17/2020 Common Era');
});

test('era alternate', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  let api: CalendarsImpl;
  let s: string;

  // ENGLISH

  api = calendarsApi('en');

  // abbreviated
  s = api.formatDate(mar11, { skeleton: 'GMMMyd', alt: { era: 'none' } });
  expect(s).toEqual('Mar 10, 2018 AD');

  s = api.formatDate(mar11, { skeleton: 'GMMMyd', alt: { era: 'sensitive' } });
  expect(s).toEqual('Mar 10, 2018 CE');

  // names
  s = api.formatDate(mar11, { skeleton: 'GGGGMMMyd', alt: { era: 'none' } });
  expect(s).toEqual('Mar 10, 2018 Anno Domini');

  s = api.formatDate(mar11, { skeleton: 'GGGGMMMyd', alt: { era: 'sensitive' } });
  expect(s).toEqual('Mar 10, 2018 Common Era');

  // narrow
  s = api.formatDate(mar11, { skeleton: 'GGGGGMMMyd', alt: { era: 'none' } });
  expect(s).toEqual('Mar 10, 2018 A');

  s = api.formatDate(mar11, { skeleton: 'GGGGGMMMyd', alt: { era: 'sensitive' } });
  expect(s).toEqual('Mar 10, 2018 CE');

  // SPANISH

  api = calendarsApi('es');

  s = api.formatDate(mar11, { skeleton: 'GGGGMMMyd', alt: { era: 'none' } });
  expect(s).toEqual('10 mar 2018 después de Cristo');

  s = api.formatDate(mar11, { skeleton: 'GGGGMMMyd', alt: { era: 'sensitive' } });
  expect(s).toEqual('10 mar 2018 era común');

  // GERMAN

  api = calendarsApi('de');

  s = api.formatDate(mar11, { skeleton: 'GGGGMMMyd', alt: { era: 'none' } });
  expect(s).toEqual('10. März 2018 n. Chr.');

  s = api.formatDate(mar11, { skeleton: 'GGGGMMMyd', alt: { era: 'sensitive' } });
  expect(s).toEqual('10. März 2018 unserer Zeitrechnung');
});

test('day period alternate', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  let api: CalendarsImpl;
  let s: string;

  // ENGLISH

  api = calendarsApi('en');

  // abbreviated
  s = api.formatDate(mar11, { skeleton: 'hma', alt: { dayPeriod: 'none' } });
  expect(s).toEqual('11:00 PM');

  s = api.formatDate(mar11, { skeleton: 'hma', alt: { dayPeriod: 'casing' } });
  expect(s).toEqual('11:00 pm');

  // wide
  s = api.formatDate(mar11, { skeleton: 'hmaaaa', alt: { dayPeriod: 'none' } });
  expect(s).toEqual('11:00 PM');

  s = api.formatDate(mar11, { skeleton: 'hmaaaa', alt: { dayPeriod: 'casing' } });
  expect(s).toEqual('11:00 pm');

  // narrow
  s = api.formatDate(mar11, { skeleton: 'hmaaaaa', alt: { dayPeriod: 'none' } });
  expect(s).toEqual('11:00 p');

  s = api.formatDate(mar11, { skeleton: 'hmaaaaa', alt: { dayPeriod: 'casing' } });
  expect(s).toEqual('11:00 pm');

  // SPANISH

  api = calendarsApi('es');

  // abbreviated
  s = api.formatDate(mar11, { skeleton: 'hma', alt: { dayPeriod: 'none' } });
  expect(s).toEqual('11:00 p. m.');

  s = api.formatDate(mar11, { skeleton: 'hma', alt: { dayPeriod: 'casing' } });
  expect(s).toEqual('11:00 p. m.');

  // narrow
  s = api.formatDate(mar11, { skeleton: 'hmaaaaa', alt: { dayPeriod: 'none' } });
  expect(s).toEqual('11:00 p. m.');

  s = api.formatDate(mar11, { skeleton: 'hmaaaaa', alt: { dayPeriod: 'casing' } });
  expect(s).toEqual('11:00 p. m.');

  // GERMAN

  api = calendarsApi('de');

  s = api.formatDate(mar11, { skeleton: 'hma', alt: { dayPeriod: 'none' } });
  expect(s).toEqual('11:00 PM');

  s = api.formatDate(mar11, { skeleton: 'hma', alt: { dayPeriod: 'casing' } });
  expect(s).toEqual('11:00 PM');
});
