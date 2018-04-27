import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarDate,
  CalendarsImpl,
  GregorianDate,
  InternalsImpl,
  PrivateApiImpl,
  UnixEpochTime,
  DateRawFormatOptions
} from '../../../src';
import { CalendarConstants } from '../../../src/systems/calendars/constants';

const INTERNALS = new InternalsImpl();

const unix = (epoch: number, zoneId: string): UnixEpochTime => ({ epoch, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

// March 1, 2018 6:45:17 PM UTC
const MARCH_01_2018_184517_UTC = 1519929917000;

// April, 1, 2018 11:23:34 AM UTC
const APRIL_01_2018_112334_UTC = 1522581814000;

const HOUR = 3600000;
const DAY = 86400000;
const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

test('formats', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = unix(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const api = calendarsApi('en');
  let s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('Saturday, March 10, 2018');

  s = api.formatDate(mar11, { date: 'long' });
  expect(s).toEqual('March 10, 2018');

  s = api.formatDate(mar11, { date: 'medium' });
  expect(s).toEqual('Mar 10, 2018');

  s = api.formatDate(mar11, { date: 'short' });
  expect(s).toEqual('3/10/18');

  s = api.formatDate(mar11, { time: 'full' });
  expect(s).toEqual('11:00:25 PM Pacific Standard Time');

  s = api.formatDate(mar11, { time: 'long' });
  expect(s).toEqual('11:00:25 PM PST');

  s = api.formatDate(mar11, { time: 'medium' });
  expect(s).toEqual('11:00:25 PM');

  s = api.formatDate(mar11, { time: 'short' });
  expect(s).toEqual('11:00 PM');

  s = api.formatDate(mar11, { datetime: 'full' });
  expect(s).toEqual('Saturday, March 10, 2018 at 11:00:25 PM Pacific Standard Time');

  s = api.formatDate(mar11, { datetime: 'long' });
  expect(s).toEqual('March 10, 2018 at 11:00:25 PM PST');

  s = api.formatDate(mar11, { datetime: 'medium' });
  expect(s).toEqual('Mar 10, 2018, 11:00:25 PM');

  s = api.formatDate(mar11, { datetime: 'short' });
  expect(s).toEqual('3/10/18, 11:00 PM');
});

test('year padding', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC + 123, LOS_ANGELES);
  const api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { skeleton: 'yyyyy' });
  expect(s).toEqual('02018');

  s = api.formatDate(mar11, { skeleton: 'yyyyyyyyyy' });
  expect(s).toEqual('0000002018');
});

test('skeletons', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC + 123, LOS_ANGELES);
  const mar14 = unix(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);
  const jun09 = unix(MARCH_11_2018_070025_UTC + (DAY * 90), LOS_ANGELES);
  const sep07 = unix(MARCH_11_2018_070025_UTC + (DAY * 180), LOS_ANGELES);
  const api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { skeleton: 'yQQQ' });
  expect(s).toEqual('Q1 2018');

  s = api.formatDate(mar11, { skeleton: 'yQQQQ' });
  expect(s).toEqual('1st quarter 2018');

  s = api.formatDate(jun09, { skeleton: 'yQQQQ' });
  expect(s).toEqual('2nd quarter 2018');

  s = api.formatDate(sep07, { skeleton: 'yQQQQ' });
  expect(s).toEqual('3rd quarter 2018');

  s = api.formatDate(mar11, { skeleton: 'yMdEEEE' });
  expect(s).toEqual('Saturday, 3/10/2018');

  s = api.formatDate(mar11, { skeleton: 'yMdc' });
  expect(s).toEqual('Sat, 3/10/2018');

  s = api.formatDate(mar11, { skeleton: 'Yw' });
  expect(s).toEqual('week 10 of 2018');

  s = api.formatDate(mar11, { skeleton: 'MMMMW' });
  expect(s).toEqual('week 2 of March');

  s = api.formatDate(mar11, { skeleton: 'yMMMdhms', wrap: 'full' });
  expect(s).toEqual('Mar 10, 2018 at 11:00:25 PM');

  s = api.formatDate(mar11, { skeleton: 'yMMMdhms', wrap: 'long' });
  expect(s).toEqual('Mar 10, 2018 at 11:00:25 PM');

  s = api.formatDate(mar11, { skeleton: 'yMMMdhms', wrap: 'medium' });
  expect(s).toEqual('Mar 10, 2018, 11:00:25 PM');

  s = api.formatDate(mar11, { skeleton: 'yMMMdhms', wrap: 'short' });
  expect(s).toEqual('Mar 10, 2018, 11:00:25 PM');

  s = api.formatDate(mar11, { skeleton: 'yyyyMMddjjmmssSSS' });
  expect(s).toEqual('03/10/2018, 11:00:25.123 PM');

  s = api.formatDate(mar11, { skeleton: 'yMMMMdjmsSSSVVVV' });
  expect(s).toEqual('March 10, 2018 at 11:00:25.123 PM Los Angeles Time');

  const nyMar11 = unix(MARCH_11_2018_070025_UTC + 123, NEW_YORK);
  s = api.formatDate(nyMar11, { skeleton: 'yMMMMdjmsSSSVVVV' });
  expect(s).toEqual('March 11, 2018 at 3:00:25.123 AM New York Time');
});

test('skeleton wrapper width', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC + 123, LOS_ANGELES);
  const api = calendarsApi('en');
  let s: string;

  // full
  s = api.formatDate(mar11, { skeleton: 'yEMMMMdhm' });
  expect(s).toEqual('Sat, March 10, 2018 at 11:00 PM');

  // long
  s = api.formatDate(mar11, { skeleton: 'yMMMMdhm' });
  expect(s).toEqual('March 10, 2018 at 11:00 PM');

  // medium
  s = api.formatDate(mar11, { skeleton: 'yMMMEdhm' });
  expect(s).toEqual('Sat, Mar 10, 2018, 11:00 PM');

  // short
  s = api.formatDate(mar11, { skeleton: 'yMdhm' });
  expect(s).toEqual('3/10/2018, 11:00 PM');
});

test('fractional seconds', () => {
  const base = MARCH_11_2018_070025_UTC;
  let api = calendarsApi('en');
  let s: string;
  let date: UnixEpochTime;

  date = unix(base, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsS' });
  expect(s).toEqual('11:00:25.0 PM');

  date = unix(base, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSS' });
  expect(s).toEqual('11:00:25.00 PM');

  date = unix(base, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSSS' });
  expect(s).toEqual('11:00:25.000 PM');

  date = unix(base + 567, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsS' });
  expect(s).toEqual('11:00:25.5 PM');

  date = unix(base + 567, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSS' });
  expect(s).toEqual('11:00:25.56 PM');

  date = unix(base + 567, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSSS' });
  expect(s).toEqual('11:00:25.567 PM');

  date = unix(base + 567, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSSSS' });
  expect(s).toEqual('11:00:25.5670 PM');

  api = calendarsApi('fr');
  s = api.formatDate(date, { skeleton: 'hmsSSSS' });
  expect(s).toEqual('11:00:25,5670 PM');
});

test('skeleton metacharacters', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  let s: string;

  let api = calendarsApi('en');
  s = api.formatDate(mar11, { skeleton: 'j' });
  expect(s).toEqual('11 PM');

  s = api.formatDate(mar11, { skeleton: 'jmm' });
  expect(s).toEqual('11:00 PM');

  s = api.formatDate(mar11, { skeleton: 'J' });
  expect(s).toEqual('23');

  s = api.formatDate(mar11, { skeleton: 'Jmm' });
  expect(s).toEqual('23:00');

  s = api.formatDate(mar11, { skeleton: 'Cmm' });
  expect(s).toEqual('11:00 PM');

  api = calendarsApi('de');
  s = api.formatDate(mar11, { skeleton: 'J' });
  expect(s).toEqual('23 Uhr');

  s = api.formatDate(mar11, { skeleton: 'Jmm' });
  expect(s).toEqual('23:00');
});

test('parts', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = unix(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const api = calendarsApi('en');
  let p = api.formatDateToParts(mar11, { date: 'full' });
  expect(p).toEqual([
    { type: 'weekday', value: 'Saturday'},
    { type: 'literal', value: ', '},
    { type: 'month', value: 'March'},
    { type: 'literal', value: ' '},
    { type: 'day', value: '10'},
    { type: 'literal', value: ', '},
    { type: 'year', value: '2018'}
  ]);

  p = api.formatDateToParts(mar11, { date: 'short' });
  expect(p).toEqual([
    { type: 'month', value: '3'},
    { type: 'literal', value: '/'},
    { type: 'day', value: '10'},
    { type: 'literal', value: '/'},
    { type: 'year', value: '18'}
  ]);

  p = api.formatDateToParts(mar11, { time: 'full' });
  expect(p).toEqual([
    { type: 'hour', value: '11'},
    { type: 'literal', value: ':'},
    { type: 'minute', value: '00'},
    { type: 'literal', value: ':'},
    { type: 'second', value: '25'},
    { type: 'literal', value: ' '},
    { type: 'dayperiod', value: 'PM'},
    { type: 'literal', value: ' '},
    { type: 'timezone', value: 'Pacific Standard Time'}
  ]);

  p = api.formatDateToParts(mar11, { time: 'medium' });
  expect(p).toEqual([
    { type: 'hour', value: '11'},
    { type: 'literal', value: ':'},
    { type: 'minute', value: '00'},
    { type: 'literal', value: ':'},
    { type: 'second', value: '25'},
    { type: 'literal', value: ' '},
    { type: 'dayperiod', value: 'PM'}
  ]);
});

test('day of week in month', () => {
  const mk = (o: number) => unix(MARCH_01_2018_184517_UTC + o, LOS_ANGELES);
  const api = calendarsApi('en');
  let s: string;
  const opts = { pattern: 'F' };

  s = api.formatDateRaw(mk(0), opts);
  expect(s).toEqual('1');

  s = api.formatDateRaw(mk(DAY), opts);
  expect(s).toEqual('1');

  s = api.formatDateRaw(mk(2 * DAY), opts);
  expect(s).toEqual('1');

  s = api.formatDateRaw(mk(3 * DAY), opts);
  expect(s).toEqual('1');

  s = api.formatDateRaw(mk(4 * DAY), opts);
  expect(s).toEqual('1');

  s = api.formatDateRaw(mk(5 * DAY), opts);
  expect(s).toEqual('1');

  s = api.formatDateRaw(mk(6 * DAY), opts);
  expect(s).toEqual('1');

  s = api.formatDateRaw(mk(7 * DAY), opts);
  expect(s).toEqual('2');

  s = api.formatDateRaw(mk(8 * DAY), opts);
  expect(s).toEqual('2');

  s = api.formatDateRaw(mk(9 * DAY), opts);
  expect(s).toEqual('2');

  s = api.formatDateRaw(mk(10 * DAY), opts);
  expect(s).toEqual('2');

  s = api.formatDateRaw(mk(11 * DAY), opts);
  expect(s).toEqual('2');

  s = api.formatDateRaw(mk(12 * DAY), opts);
  expect(s).toEqual('2');

  s = api.formatDateRaw(mk(13 * DAY), opts);
  expect(s).toEqual('2');

  s = api.formatDateRaw(mk(14 * DAY), opts);
  expect(s).toEqual('3');
});

test('millis in day', () => {
  const mk = (o: number, z: string) => unix(MARCH_11_2018_070025_UTC + o, z);
  const api = calendarsApi('en');
  let s: string;
  const opts = { pattern: 'A' };

  s = api.formatDateRaw(mk(0, NEW_YORK), opts);
  expect(s).toEqual('10825000');

  s = api.formatDateRaw(mk(0, LOS_ANGELES), opts);
  expect(s).toEqual('82825000');
});

test('weekday standalone', () => {
  const mk = (o: number, z: string) => unix(MARCH_11_2018_070025_UTC + o, z);
  const api = calendarsApi('en');
  let s: string;
  const opts = { pattern: 'cccc' };

  s = api.formatDateRaw(mk(0, NEW_YORK), opts);
  expect(s).toEqual('Sunday');

  s = api.formatDateRaw(mk(0, LOS_ANGELES), opts);
  expect(s).toEqual('Saturday');

  s = api.formatDateRaw(mk(CalendarConstants.ONE_HOUR_MS * 3, LOS_ANGELES), opts);
  expect(s).toEqual('Sunday');
});

test('day of year', () => {
  const mk = (o: number, z: string) => unix(MARCH_11_2018_070025_UTC + o, z);
  const api = calendarsApi('en');
  let s: string;
  const opts = { pattern: 'D' };

  s = api.formatDateRaw(mk(0, NEW_YORK), opts);
  expect(s).toEqual('70');
});

test('julian day', () => {
  const mk = (o: number, z: string) => unix(MARCH_11_2018_070025_UTC + o, z);
  const api = calendarsApi('en');
  let s: string;
  const opts = { pattern: 'g' };

  const g = api.toGregorianDate(mk(0, NEW_YORK));
  expect(g.julianDay()).toEqual(2458188.7919560187); // Real Julian day UTC
  expect(g.modifiedJulianDay()).toEqual(2458189);    // CLDR's modified Julian day, midnight local time.

  s = api.formatDateRaw(mk(0, NEW_YORK), opts);
  expect(s).toEqual('2458189');
});

test('week in month', () => {
  const mk = (o: number) => unix(MARCH_01_2018_184517_UTC + o, LOS_ANGELES);
  const api = calendarsApi('en');
  let s: string;

  s = api.formatDateRaw(mk(0), { pattern: 'W' });
  expect(s).toEqual('1');
});

test('intervals best-fit', () => {
  const base = MARCH_11_2018_070025_UTC + 789;

  const api = calendarsApi('en');
  let s: string;

  let start: UnixEpochTime;
  let end: UnixEpochTime;

  start = unix(base - ((HOUR * 13) + 123456), LOS_ANGELES);
  end = unix(base, LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'h' });
  expect(s).toEqual('9 AM – 11 PM');

  s = api.formatDateInterval(start, end, { skeleton: 'm' });
  expect(s).toEqual('9:58 AM – 11:00 PM');

  s = api.formatDateInterval(start, end, { skeleton: 's' });
  expect(s).toEqual('9 AM – 11 PM');

  s = api.formatDateInterval(start, end, { skeleton: 'SSS' });
  expect(s).toEqual('9 AM – 11 PM');

  start = unix(base - (HOUR * 5), LOS_ANGELES);
  end = unix(base, LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'yyMdhms' });
  expect(s).toEqual('3/10/18 6:00 – 11:00 PM');

  start = unix(base - (HOUR * 13), LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'yyMdhms' });
  expect(s).toEqual('3/10/18 10:00 AM – 11:00 PM');

  start = unix(base, LOS_ANGELES);

  // Date skeleton, dates same
  end = start;

  s = api.formatDateInterval(start, end, { skeleton: 'd' });
  expect(s).toEqual('10');

  s = api.formatDateInterval(start, end, { skeleton: 'M' });
  expect(s).toEqual('3');

  s = api.formatDateInterval(start, end, { skeleton: 'y' });
  expect(s).toEqual('2018');

  s = api.formatDateInterval(start, end, { skeleton: 'MEd' });
  expect(s).toEqual('Sat, 3/10');

  s = api.formatDateInterval(start, end, { skeleton: 'yMMMd' });
  expect(s).toEqual('Mar 10, 2018');

  // Date skeleton, minutes differ
  end = unix(base + 60000, LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'd' });
  expect(s).toEqual('10');

  s = api.formatDateInterval(start, end, { skeleton: 'M' });
  expect(s).toEqual('3');

  s = api.formatDateInterval(start, end, { skeleton: 'y' });
  expect(s).toEqual('2018');

  s = api.formatDateInterval(start, end, { skeleton: 'yMMMd' });
  expect(s).toEqual('Mar 10, 2018');

  s = api.formatDateInterval(start, end, { skeleton: 'yEMMMd' });
  expect(s).toEqual('Sat, Mar 10, 2018');

  s = api.formatDateInterval(start, end, { skeleton: 'MMMd' });
  expect(s).toEqual('Mar 10');

  // Date skeleton, days differ
  end = unix(base + (DAY * 3), LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'd' });
  expect(s).toEqual('3/10 – 3/14');

  s = api.formatDateInterval(start, end, { skeleton: 'M' });
  expect(s).toEqual('3/10 – 3/14');

  s = api.formatDateInterval(start, end, { skeleton: 'y' });
  expect(s).toEqual('Mar 10 – 14, 2018');

  s = api.formatDateInterval(start, end, { skeleton: 'yMMMd' });
  expect(s).toEqual('Mar 10 – 14, 2018');

  s = api.formatDateInterval(start, end, { skeleton: 'yEMMMd' });
  expect(s).toEqual('Sat, Mar 10 – Wed, Mar 14, 2018');

  s = api.formatDateInterval(start, end, { skeleton: 'MMMd' });
  expect(s).toEqual('Mar 10 – 14');

  // Date skeleton, months differ
  end = unix(base + (DAY * 34), LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'd' });
  expect(s).toEqual('3/10 – 4/14');

  s = api.formatDateInterval(start, end, { skeleton: 'M' });
  expect(s).toEqual('3 – 4');

  s = api.formatDateInterval(start, end, { skeleton: 'y' });
  expect(s).toEqual('3/2018 – 4/2018');

  s = api.formatDateInterval(start, end, { skeleton: 'yMMMd' });
  expect(s).toEqual('Mar 10 – Apr 14, 2018');

  s = api.formatDateInterval(start, end, { skeleton: 'yEMMMd' });
  expect(s).toEqual('Sat, Mar 10 – Sat, Apr 14, 2018');

  // Date skeleton, years differ
  end = unix(base + (DAY * 301), LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'd' });
  expect(s).toEqual('3/10/2018 – 1/5/2019');

  s = api.formatDateInterval(start, end, { skeleton: 'M' });
  expect(s).toEqual('3/2018 – 1/2019');

  s = api.formatDateInterval(start, end, { skeleton: 'y' });
  expect(s).toEqual('2018 – 2019');

  s = api.formatDateInterval(start, end, { skeleton: 'yMMMd' });
  expect(s).toEqual('Mar 10, 2018 – Jan 5, 2019');

  s = api.formatDateInterval(start, end, { skeleton: 'yEMMMd' });
  expect(s).toEqual('Sat, Mar 10, 2018 – Sat, Jan 5, 2019');

  // Time skeleton, hours differ
  start = unix(base - ((HOUR * 13) + 123456), LOS_ANGELES);
  end = unix(base, LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'h' });
  expect(s).toEqual('9 AM – 11 PM');

  s = api.formatDateInterval(start, end, { skeleton: 'm' });
  expect(s).toEqual('9:58 AM – 11:00 PM');

  s = api.formatDateInterval(start, end, { skeleton: 's' });
  expect(s).toEqual('9 AM – 11 PM');

  s = api.formatDateInterval(start, end, { skeleton: 'SSS' });
  expect(s).toEqual('9 AM – 11 PM');

  s = api.formatDateInterval(start, end, { skeleton: 'yMdhms' });
  expect(s).toEqual('3/10/2018 9:58 AM – 11:00 PM');

  start = unix(base - (HOUR * 5), LOS_ANGELES);
  end = unix(base, LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'yMdhms' });
  expect(s).toEqual('3/10/2018 6:00 – 11:00 PM');

  // Time skeleton, years differ
  start = unix(base, LOS_ANGELES);
  end = unix(base + (DAY * 301), LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'ahm' });
  expect(s).toEqual('3/10/2018, 11:00 PM – 1/5/2019, 11:00 PM');

  s = api.formatDateInterval(start, end, { skeleton: 'ahmsSSS' });
  expect(s).toEqual('3/10/2018, 11:00:25.789 PM – 1/5/2019, 11:00:25.789 PM');

  // FALLBACKS

  // Time skeleton, years differ

  end = unix(base + (DAY * 301) - (HOUR * 7), LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'Bh' });
  expect(s).toEqual('3/10/2018, 11 at night – 1/5/2019, 4 in the afternoon');

  // Mixed skeleton, months differ

  end = unix(base + (DAY * 3), LOS_ANGELES);

  s = api.formatDateInterval(start, end, { skeleton: 'MMMdh' });
  expect(s).toEqual('Mar 10, 11 PM – Mar 14, 12 AM');

  // Mixed skeleton, months differ

  s = api.formatDateInterval(start, end, { skeleton: 'yMMMddhmsSSSv' });
  expect(s).toEqual('Mar 10, 2018, 11:00:25.789 PM PT – Mar 14, 2018, 12:00:25.789 AM PT');
});

test('intervals', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = unix(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  let api = calendarsApi('en');
  let s = api.formatDateInterval(mar11, mar14, { skeleton: 'yMMMd' });
  expect(s).toEqual('Mar 10 – 14, 2018');

  api = calendarsApi('en-GB');
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('Saturday, 10 March 2018');

  s = api.formatDateInterval(mar11, mar14, { skeleton: 'yMMMd' });
  expect(s).toEqual('10–14 Mar 2018');

  api = calendarsApi('es');
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('sábado, 10 de marzo de 2018');

  api = calendarsApi('es-419');
  s = api.formatDate(mar11, { date: 'medium' });
  expect(s).toEqual('10 mar. 2018');

  api = calendarsApi('fr');
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('samedi 10 mars 2018');

  api = calendarsApi('lt');
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('2018 m. kovo 10 d., šeštadienis');

  api = calendarsApi('sr');
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('субота, 10. март 2018.');

  api = calendarsApi('zh');
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('2018年3月10日星期六');
});

test('interval parts', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = unix(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const api = calendarsApi('en');
  const p = api.formatDateIntervalToParts(mar11, mar14, { skeleton: 'yMMMMd' });
  expect(p).toEqual([
    { type: 'month', value: 'March' },
    { type: 'literal', value: ' ' },
    { type: 'day', value: '10' },
    { type: 'literal', value: ' – ' },
    { type: 'day', value: '14'},
    { type: 'literal', value: ', '},
    { type: 'year', value: '2018'}
  ]);
});

test('day periods', () => {
  const base = MARCH_11_2018_070025_UTC;
  const losangeles = (n: number) => unix(base + n, LOS_ANGELES);
  const london = (n: number) => unix(base + n, LONDON);

  const api = calendarsApi('en');

  let d = losangeles(0);
  expect(api.formatDateRaw(d, { pattern: 'a' })).toEqual('PM');
  expect(api.formatDateRaw(d, { pattern: 'aaaa' })).toEqual('PM');
  expect(api.formatDateRaw(d, { pattern: 'aaaaa' })).toEqual('p');
  expect(api.formatDateRaw(d, { pattern: 'b' })).toEqual('PM');
  expect(api.formatDateRaw(d, { pattern: 'bbbb' })).toEqual('PM');
  expect(api.formatDateRaw(d, { pattern: 'bbbbb' })).toEqual('p');

  d = london(0);
  expect(api.formatDateRaw(d, { pattern: 'a' })).toEqual('AM');
  expect(api.formatDateRaw(d, { pattern: 'aaaa' })).toEqual('AM');
  expect(api.formatDateRaw(d, { pattern: 'aaaaa' })).toEqual('a');
  expect(api.formatDateRaw(d, { pattern: 'b' })).toEqual('AM');
  expect(api.formatDateRaw(d, { pattern: 'bbbb' })).toEqual('AM');
  expect(api.formatDateRaw(d, { pattern: 'bbbbb' })).toEqual('a');

  d = london(-(7 * 3600 * 1000));
  expect(api.formatDateRaw(d, { pattern: 'b' })).toEqual('midnight');
  expect(api.formatDateRaw(d, { pattern: 'bbbb' })).toEqual('midnight');
  expect(api.formatDateRaw(d, { pattern: 'bbbbb' })).toEqual('mi');

  d = london(5 * 3600 * 1000);
  expect(api.formatDateRaw(d, { pattern: 'b' })).toEqual('noon');
  expect(api.formatDateRaw(d, { pattern: 'bbbb' })).toEqual('noon');
  expect(api.formatDateRaw(d, { pattern: 'bbbbb' })).toEqual('n');

  expect(api.formatDateRawToParts(d, { pattern: 'b' })).toEqual([
    { type: 'dayperiod', value: 'noon'}
  ]);
});

test('flexible day periods', () => {
  const base = MARCH_11_2018_070025_UTC;
  const losangeles = (n: number) => unix(base + n, LOS_ANGELES);
  const london = (n: number) => unix(base + n, LONDON);

  const hour = 3600 * 1000;

  let api = calendarsApi('en');
  let d: UnixEpochTime;
  const opts: DateRawFormatOptions = { pattern: 'B' };

  // 11 pm
  d = losangeles(0);
  expect(api.formatDateRaw(d, opts)).toEqual('at night');

  // 8 pm
  d = losangeles(-3 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('in the evening');

  // 5 pm
  d = losangeles(-6 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('in the afternoon');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('noon');

  // 10 am
  d = losangeles(-13 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('in the morning');

  // 3 am
  d = losangeles(-20 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('at night');

  // 12 am
  d = losangeles(-23 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('midnight');

  api = calendarsApi('es');

  // 11 pm
  d = losangeles(0);
  expect(api.formatDateRaw(d, opts)).toEqual('de la noche');

  // 7 pm
  d = losangeles(-4 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('de la tarde');

  // 3 pm
  d = losangeles(-8 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('de la tarde');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('del mediodía');

  // 10 am
  d = losangeles(-13 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('de la mañana');

  // 3 am
  d = losangeles(-20 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('de la madrugada');

  // 12 am
  d = losangeles(-23 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('de la madrugada');

  // "be" has no explicit rules so falls back to extended, but
  // only has basic am/pm keys.
  api = calendarsApi('be');

  // 11 pm
  d = losangeles(0);
  expect(api.formatDateRaw(d, opts)).toEqual('PM');

  // 7 pm
  d = losangeles(-4 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('PM');

  // 3 pm
  d = losangeles(-8 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('PM');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('PM');

  // 10 am
  d = losangeles(-13 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('AM');

  // 3 am
  d = losangeles(-20 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('AM');

  // 12 am
  d = losangeles(-23 * hour);
  expect(api.formatDateRaw(d, opts)).toEqual('AM');
});

test('weekday firstday raw', () => {
  const en = calendarsApi('en');
  const de = calendarsApi('de');
  const base = MARCH_11_2018_070025_UTC;

  const opts = { pattern: 'e' };
  let ux: UnixEpochTime;
  let gr: GregorianDate;
  let s: string;

  // US first day of week = sunday
  // DE first day of week = monday

  // March 10 LA
  ux = unix(base, LOS_ANGELES);

  gr = en.toGregorianDate(ux);
  expect(gr.dayOfWeek()).toEqual(7); // saturday
  expect(gr.ordinalDayOfWeek()).toEqual(7); // saturday = 7th dow
  s = en.formatDateRaw(ux, opts);
  expect(s).toEqual('7'); // saturday = 7th dow

  gr = de.toGregorianDate(ux);
  expect(gr.dayOfWeek()).toEqual(7); // saturday
  expect(gr.ordinalDayOfWeek()).toEqual(6); // saturday = 6th dow
  s = de.formatDateRaw(ux, opts);
  expect(s).toEqual('6'); // saturday = 6th dow

  // March 11 NY
  ux = unix(base, NEW_YORK);

  gr = en.toGregorianDate(ux);
  expect(gr.dayOfWeek()).toEqual(1); // sunday
  expect(gr.ordinalDayOfWeek()).toEqual(1); // sunday = 1st dow
  s = en.formatDateRaw(ux, opts);
  expect(s).toEqual('1'); // sunday = 1st dow

  gr = de.toGregorianDate(ux);
  expect(gr.dayOfWeek()).toEqual(1); // sunday
  expect(gr.ordinalDayOfWeek()).toEqual(7); // sunday = 7th dow
  s = de.formatDateRaw(ux, opts);
  expect(s).toEqual('7'); // sunday = 7th dow

  // March 12 NY
  ux = unix(base + DAY, NEW_YORK);

  gr = en.toGregorianDate(ux);
  expect(gr.dayOfWeek()).toEqual(2); // monday
  expect(gr.ordinalDayOfWeek()).toEqual(2); // monday = 2nd dow
  s = en.formatDateRaw(ux, opts);
  expect(s).toEqual('2'); // tuesday is 2nd day of week

  gr = de.toGregorianDate(ux);
  expect(gr.dayOfWeek()).toEqual(2); // monday
  expect(gr.ordinalDayOfWeek()).toEqual(1); // monday = 1st dow
  s = de.formatDateRaw(ux, opts);
  expect(s).toEqual('1');
});

test('timezone short/long specific non-location format', () => {
  const en = calendarsApi('en');
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: UnixEpochTime;

  d = unix(base, NEW_YORK);

  s = en.formatDateRaw(d, { pattern: 'z' });
  expect(s).toEqual('EDT');

  s = en.formatDateRaw(d, { pattern: 'zzzz' });
  expect(s).toEqual('Eastern Daylight Time');
});

test('timezone iso8601 basic/extended', () => {
  const en = calendarsApi('en');
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: UnixEpochTime;

  d = unix(base, NEW_YORK);

  s = en.formatDateRaw(d, { pattern: 'Z' });
  expect(s).toEqual('+0400');

  s = en.formatDateRaw(d, { pattern: 'ZZZZ' }); // Same as 'OOOO'
  expect(s).toEqual('GMT+04:00');

  s = en.formatDateRaw(d, { pattern: 'ZZZZZ' });
  expect(s).toEqual('+04:00');
});

test('timezone short/long localized gmt', () => {
  const en = calendarsApi('en');
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: UnixEpochTime;

  d = unix(base, NEW_YORK);

  s = en.formatDateRaw(d, { pattern: 'O' });
  expect(s).toEqual('GMT+4');

  s = en.formatDateRaw(d, { pattern: 'OOOO' });
  expect(s).toEqual('GMT+04:00');
});

test('timezone short/long generic non-location format', () => {
  const en = calendarsApi('en');
  const es419 = calendarsApi('es-419');
  const de = calendarsApi('de');
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: UnixEpochTime;

  const short = { pattern: 'v' };
  const long = { pattern: 'vvvv' };

  d = unix(base, NEW_YORK);

  s = en.formatDateRaw(d, short);
  expect(s).toEqual('ET');

  s = en.formatDateRaw(d, long);
  expect(s).toEqual('Eastern Time');

  s = es419.formatDateRaw(d, short);
  expect(s).toEqual('GMT+4');

  s = es419.formatDateRaw(d, long);
  expect(s).toEqual('hora oriental');

  s = de.formatDateRaw(d, short);
  expect(s).toEqual('GMT+4');

  s = de.formatDateRaw(d, long);
  expect(s).toEqual('Nordamerikanische Ostküstenzeit');
});

test('timezone short/long zone id, exemplar city, generic location format', () => {
  const en = calendarsApi('en');
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: UnixEpochTime;

  d = unix(base, NEW_YORK);

  s = en.formatDateRaw(d, { pattern: 'V' });
  expect(s).toEqual('unk');

  s = en.formatDateRaw(d, { pattern: 'VV' });
  expect(s).toEqual('America/New_York');

  s = en.formatDateRaw(d, { pattern: 'VVV' });
  expect(s).toEqual('New York');

  s = en.formatDateRaw(d, { pattern: 'VVVV' });
  expect(s).toEqual('New York Time');
});

test('timezone iso8601 basic format', () => {
  const en = calendarsApi('en');
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: UnixEpochTime;

  d = unix(base, NEW_YORK);

  s = en.formatDateRaw(d, { pattern: 'x' });
  expect(s).toEqual('+04');
  s = en.formatDateRaw(d, { pattern: 'X' });
  expect(s).toEqual('+04');

  s = en.formatDateRaw(d, { pattern: 'xx' });
  expect(s).toEqual('+0400');
  s = en.formatDateRaw(d, { pattern: 'XX' });
  expect(s).toEqual('+0400');

  s = en.formatDateRaw(d, { pattern: 'xxx' });
  expect(s).toEqual('+04:00');
  s = en.formatDateRaw(d, { pattern: 'XXX' });
  expect(s).toEqual('+04:00');

  s = en.formatDateRaw(d, { pattern: 'xxxx' });
  expect(s).toEqual('+0400');
  s = en.formatDateRaw(d, { pattern: 'XXXX' });
  expect(s).toEqual('+0400');

  s = en.formatDateRaw(d, { pattern: 'xxxxx' });
  expect(s).toEqual('+04:00');
  s = en.formatDateRaw(d, { pattern: 'XXXXX' });
  expect(s).toEqual('+04:00');

  d = unix(base, LONDON);

  s = en.formatDateRaw(d, { pattern: 'x' });
  expect(s).toEqual('+00');
  s = en.formatDateRaw(d, { pattern: 'X' });
  expect(s).toEqual('+00Z');

  s = en.formatDateRaw(d, { pattern: 'xx' });
  expect(s).toEqual('+0000');
  s = en.formatDateRaw(d, { pattern: 'XX' });
  expect(s).toEqual('+0000Z');

  s = en.formatDateRaw(d, { pattern: 'xxx' });
  expect(s).toEqual('+00:00');
  s = en.formatDateRaw(d, { pattern: 'XXX' });
  expect(s).toEqual('+00:00Z');

  s = en.formatDateRaw(d, { pattern: 'xxxx' });
  expect(s).toEqual('+0000');
  s = en.formatDateRaw(d, { pattern: 'XXXX' });
  expect(s).toEqual('+0000Z');

  s = en.formatDateRaw(d, { pattern: 'xxxxx' });
  expect(s).toEqual('+00:00');
  s = en.formatDateRaw(d, { pattern: 'XXXXX' });
  expect(s).toEqual('+00:00Z');
});
