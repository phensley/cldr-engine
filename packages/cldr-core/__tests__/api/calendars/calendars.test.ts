import { BE, EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { Bundle, CalendarsImpl, InternalsImpl, PrivateApiImpl } from '../../../src';
import { ZonedDateTime } from '../../../src/types/datetime';

const INTERNALS = new InternalsImpl();

const datetime = (e: number, z: string) => new ZonedDateTime(e, z);

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const DAY = 86400000;
const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (bundle: Bundle) => new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));

test('formats', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = datetime(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const api = calendarsApi(EN);
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

test('skeletons', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC + 123, LOS_ANGELES);
  const mar14 = datetime(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);
  const jun09 = datetime(MARCH_11_2018_070025_UTC + (DAY * 90), LOS_ANGELES);
  const sep07 = datetime(MARCH_11_2018_070025_UTC + (DAY * 180), LOS_ANGELES);
  const api = calendarsApi(EN);
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

  // TODO: implement 'W' field
  // s = api.formatDate(mar11, { skeleton: 'MMMMW' });
  // expect(s).toEqual('week 10 of 2018');

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

  const nyMar11 = datetime(MARCH_11_2018_070025_UTC + 123, NEW_YORK);
  s = api.formatDate(nyMar11, { skeleton: 'yMMMMdjmsSSSVVVV' });
  expect(s).toEqual('March 11, 2018 at 3:00:25.123 AM New York Time');
});

test('skeleton wrapper width', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC + 123, LOS_ANGELES);
  const api = calendarsApi(EN);
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
  let api = calendarsApi(EN);
  let s: string;
  let date: ZonedDateTime;

  date = datetime(base, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsS' });
  expect(s).toEqual('11:00:25.0 PM');

  date = datetime(base, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSS' });
  expect(s).toEqual('11:00:25.00 PM');

  date = datetime(base, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSSS' });
  expect(s).toEqual('11:00:25.000 PM');

  date = datetime(base + 567, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsS' });
  expect(s).toEqual('11:00:25.5 PM');

  date = datetime(base + 567, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSS' });
  expect(s).toEqual('11:00:25.56 PM');

  date = datetime(base + 567, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSSS' });
  expect(s).toEqual('11:00:25.567 PM');

  date = datetime(base + 567, LOS_ANGELES);
  s = api.formatDate(date, { skeleton: 'hmsSSSS' });
  expect(s).toEqual('11:00:25.5670 PM');

  api = calendarsApi(FR);
  s = api.formatDate(date, { skeleton: 'hmsSSSS' });
  expect(s).toEqual('11:00:25,5670 PM');
});

test('skeleton metacharacters', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  let s: string;

  let api = calendarsApi(EN);
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

  api = calendarsApi(DE);
  s = api.formatDate(mar11, { skeleton: 'J' });
  expect(s).toEqual('23 Uhr');

  s = api.formatDate(mar11, { skeleton: 'Jmm' });
  expect(s).toEqual('23:00');
});

test('parts', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = datetime(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const api = calendarsApi(EN);
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

test('intervals', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = datetime(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  let api = calendarsApi(EN);
  let s = api.formatDateInterval(mar11, mar14, 'yMMMd');
  expect(s).toEqual('Mar 10 – 14, 2018');

  api = calendarsApi(EN_GB);
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('Saturday, 10 March 2018');

  s = api.formatDateInterval(mar11, mar14, 'yMMMd');
  expect(s).toEqual('10–14 Mar 2018');

  api = calendarsApi(ES);
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('sábado, 10 de marzo de 2018');

  api = calendarsApi(ES_419);
  s = api.formatDate(mar11, { date: 'medium' });
  expect(s).toEqual('10 mar. 2018');

  api = calendarsApi(FR);
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('samedi 10 mars 2018');

  api = calendarsApi(LT);
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('2018 m. kovo 10 d., šeštadienis');

  api = calendarsApi(SR);
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('субота, 10. март 2018.');

  api = calendarsApi(ZH);
  s = api.formatDate(mar11, { date: 'full' });
  expect(s).toEqual('2018年3月10日星期六');
});

test('interval parts', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = datetime(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const api = calendarsApi(EN);
  const p = api.formatDateIntervalToParts(mar11, mar14, 'yMMMd');
  expect(p).toEqual([
    { type: 'month', value: 'Mar' },
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
  const losangeles = (n: number) => datetime(base + n, LOS_ANGELES);
  const london = (n: number) => datetime(base + n, LONDON);

  const api = calendarsApi(EN);

  let d = losangeles(0);
  expect(api.formatDateRaw(d, 'a')).toEqual('PM');
  expect(api.formatDateRaw(d, 'aaaa')).toEqual('PM');
  expect(api.formatDateRaw(d, 'aaaaa')).toEqual('p');
  expect(api.formatDateRaw(d, 'b')).toEqual('PM');
  expect(api.formatDateRaw(d, 'bbbb')).toEqual('PM');
  expect(api.formatDateRaw(d, 'bbbbb')).toEqual('p');

  d = london(0);
  expect(api.formatDateRaw(d, 'a')).toEqual('AM');
  expect(api.formatDateRaw(d, 'aaaa')).toEqual('AM');
  expect(api.formatDateRaw(d, 'aaaaa')).toEqual('a');
  expect(api.formatDateRaw(d, 'b')).toEqual('AM');
  expect(api.formatDateRaw(d, 'bbbb')).toEqual('AM');
  expect(api.formatDateRaw(d, 'bbbbb')).toEqual('a');

  d = london(-(7 * 3600 * 1000));
  expect(api.formatDateRaw(d, 'b')).toEqual('midnight');
  expect(api.formatDateRaw(d, 'bbbb')).toEqual('midnight');
  expect(api.formatDateRaw(d, 'bbbbb')).toEqual('mi');

  d = london(5 * 3600 * 1000);
  expect(api.formatDateRaw(d, 'b')).toEqual('noon');
  expect(api.formatDateRaw(d, 'bbbb')).toEqual('noon');
  expect(api.formatDateRaw(d, 'bbbbb')).toEqual('n');

  expect(api.formatDateRawToParts(d, 'b')).toEqual([
    { type: 'dayperiod', value: 'noon'}
  ]);
});

test('iso week', () => {
  // Week number verification using raw pattern
  const api = calendarsApi(EN);
  let d: ZonedDateTime;

  d = datetime(1451624400000, LOS_ANGELES);
  expect(api.formatDateRaw(d, 'ww YYYY')).toEqual('53 2015');

  d = datetime(1451624400000, NEW_YORK);
  expect(api.formatDateRaw(d, 'ww YYYY')).toEqual('53 2015');

  d = datetime(1546318800000, LOS_ANGELES);
  expect(api.formatDateRaw(d, 'ww YYYY')).toEqual('01 2019');

  d = datetime(1546318800000, NEW_YORK);
  expect(api.formatDateRaw(d, 'ww YYYY')).toEqual('01 2019');
});

test('flexible day periods', () => {
  const base = MARCH_11_2018_070025_UTC;
  const losangeles = (n: number) => datetime(base + n, LOS_ANGELES);
  const london = (n: number) => datetime(base + n, LONDON);

  const hour = 3600 * 1000;

  let api = calendarsApi(EN);
  let d: ZonedDateTime;

  // 11 pm
  d = losangeles(0);
  expect(api.formatDateRaw(d, 'B')).toEqual('at night');

  // 8 pm
  d = losangeles(-3 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('in the evening');

  // 5 pm
  d = losangeles(-6 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('in the afternoon');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('noon');

  // 10 am
  d = losangeles(-13 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('in the morning');

  // 3 am
  d = losangeles(-20 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('at night');

  // 12 am
  d = losangeles(-23 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('midnight');

  api = calendarsApi(ES);

  // 11 pm
  d = losangeles(0);
  expect(api.formatDateRaw(d, 'B')).toEqual('de la noche');

  // 7 pm
  d = losangeles(-4 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('de la tarde');

  // 3 pm
  d = losangeles(-8 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('de la tarde');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('del mediodía');

  // 10 am
  d = losangeles(-13 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('de la mañana');

  // 3 am
  d = losangeles(-20 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('de la madrugada');

  // 12 am
  d = losangeles(-23 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('de la madrugada');

  // "be" has no explicit rules so falls back to extended, but
  // only has basic am/pm keys.
  api = calendarsApi(BE);

  // 11 pm
  d = losangeles(0);
  expect(api.formatDateRaw(d, 'B')).toEqual('PM');

  // 7 pm
  d = losangeles(-4 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('PM');

  // 3 pm
  d = losangeles(-8 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('PM');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('PM');

  // 10 am
  d = losangeles(-13 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('AM');

  // 3 am
  d = losangeles(-20 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('AM');

  // 12 am
  d = losangeles(-23 * hour);
  expect(api.formatDateRaw(d, 'B')).toEqual('AM');
});

test('weekday firstday raw', () => {
  const calendars = INTERNALS.calendars;
  const base = MARCH_11_2018_070025_UTC;

  // March 11 NY
  let d = datetime(base, NEW_YORK);
  expect(d.getDayOfWeek()).toEqual(7);
  expect(d.getUTCDayOfWeek()).toEqual(7);

  // US firstDay = sun
  let s = calendars.formatDateRaw(EN, d, 'e');
  expect(s).toEqual('1');

  // DE firstDay = mon
  s = calendars.formatDateRaw(DE, d, 'e');
  expect(s).toEqual('7');

  // March 12 NY
  d = datetime(base + DAY, NEW_YORK);
  expect(d.getDayOfWeek()).toEqual(1);
  expect(d.getUTCDayOfWeek()).toEqual(1);

  s = calendars.formatDateRaw(EN, d, 'e');
  expect(s).toEqual('2');

  s = calendars.formatDateRaw(DE, d, 'e');
  expect(s).toEqual('1');

  // March 10 LA
  d = datetime(base, LOS_ANGELES);
  expect(d.getDayOfWeek()).toEqual(6); // saturday local
  expect(d.getUTCDayOfWeek()).toEqual(7); // sunday utc

  s = calendars.formatDateRaw(EN, d, 'e');
  expect(s).toEqual('7'); // sat is last day of week

  s = calendars.formatDateRaw(DE, d, 'e');
  expect(s).toEqual('6'); // sat is next to last day of week
});

test('timezone short/long specific non-location format', () => {
  const calendars = INTERNALS.calendars;
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = calendars.formatDateRaw(EN, d, 'z');
  expect(s).toEqual('EDT');

  s = calendars.formatDateRaw(EN, d, 'zzzz');
  expect(s).toEqual('Eastern Daylight Time');
});

test('timezone iso8601 basic/extended', () => {
  const calendars = INTERNALS.calendars;
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = calendars.formatDateRaw(EN, d, 'Z');
  expect(s).toEqual('+0400');

  s = calendars.formatDateRaw(EN, d, 'ZZZZ'); // Same as 'OOOO'
  expect(s).toEqual('GMT+04:00');

  s = calendars.formatDateRaw(EN, d, 'ZZZZZ');
  expect(s).toEqual('+04:00');
});

test('iso week', () => {
  const api = calendarsApi(EN);
  const base = MARCH_11_2018_070025_UTC;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);
  expect(d.getDayOfYear()).toEqual(70);
  expect(api.getCompactISOWeekDate(d)).toEqual('2018W107');
  expect(api.getExtendedISOWeekDate(d)).toEqual('2018-W10-7');

  d = datetime(base + (10 * DAY), NEW_YORK);
  expect(d.getDayOfYear()).toEqual(80);
  expect(api.getCompactISOWeekDate(d)).toEqual('2018W123');
  expect(api.getExtendedISOWeekDate(d)).toEqual('2018-W12-3');

  d = datetime(base + (90 * DAY), NEW_YORK);
  expect(d.getDayOfYear()).toEqual(160);
  expect(api.getCompactISOWeekDate(d)).toEqual('2018W236');
  expect(api.getExtendedISOWeekDate(d)).toEqual('2018-W23-6');
});

test('timezone short/long localized gmt', () => {
  const calendars = INTERNALS.calendars;
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = calendars.formatDateRaw(EN, d, 'O');
  expect(s).toEqual('GMT+4');

  s = calendars.formatDateRaw(EN, d, 'OOOO');
  expect(s).toEqual('GMT+04:00');
});

test('timezone short/long generic non-location format', () => {
  const calendars = INTERNALS.calendars;
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = calendars.formatDateRaw(EN, d, 'v');
  expect(s).toEqual('ET');

  s = calendars.formatDateRaw(EN, d, 'vvvv');
  expect(s).toEqual('Eastern Time');

  s = calendars.formatDateRaw(ES_419, d, 'v');
  expect(s).toEqual('GMT+4');

  s = calendars.formatDateRaw(ES_419, d, 'vvvv');
  expect(s).toEqual('hora oriental');

  s = calendars.formatDateRaw(DE, d, 'v');
  expect(s).toEqual('GMT+4');

  s = calendars.formatDateRaw(DE, d, 'vvvv');
  expect(s).toEqual('Nordamerikanische Ostküstenzeit');
});

test('timezone short/long zone id, exemplar city, generic location format', () => {
  const calendars = INTERNALS.calendars;
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = calendars.formatDateRaw(EN, d, 'V');
  expect(s).toEqual('unk');

  s = calendars.formatDateRaw(EN, d, 'VV');
  expect(s).toEqual('America/New_York');

  s = calendars.formatDateRaw(EN, d, 'VVV');
  expect(s).toEqual('New York');

  s = calendars.formatDateRaw(EN, d, 'VVVV');
  expect(s).toEqual('New York Time');
});

test('timezone iso8601 basic format', () => {
  const calendars = INTERNALS.calendars;
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = calendars.formatDateRaw(EN, d, 'x');
  expect(s).toEqual('+04');
  s = calendars.formatDateRaw(EN, d, 'X');
  expect(s).toEqual('+04');

  s = calendars.formatDateRaw(EN, d, 'xx');
  expect(s).toEqual('+0400');
  s = calendars.formatDateRaw(EN, d, 'XX');
  expect(s).toEqual('+0400');

  s = calendars.formatDateRaw(EN, d, 'xxx');
  expect(s).toEqual('+04:00');
  s = calendars.formatDateRaw(EN, d, 'XXX');
  expect(s).toEqual('+04:00');

  s = calendars.formatDateRaw(EN, d, 'xxxx');
  expect(s).toEqual('+0400');
  s = calendars.formatDateRaw(EN, d, 'XXXX');
  expect(s).toEqual('+0400');

  s = calendars.formatDateRaw(EN, d, 'xxxxx');
  expect(s).toEqual('+04:00');
  s = calendars.formatDateRaw(EN, d, 'XXXXX');
  expect(s).toEqual('+04:00');

  d = datetime(base, LONDON);

  s = calendars.formatDateRaw(EN, d, 'x');
  expect(s).toEqual('+00');
  s = calendars.formatDateRaw(EN, d, 'X');
  expect(s).toEqual('+00Z');

  s = calendars.formatDateRaw(EN, d, 'xx');
  expect(s).toEqual('+0000');
  s = calendars.formatDateRaw(EN, d, 'XX');
  expect(s).toEqual('+0000Z');

  s = calendars.formatDateRaw(EN, d, 'xxx');
  expect(s).toEqual('+00:00');
  s = calendars.formatDateRaw(EN, d, 'XXX');
  expect(s).toEqual('+00:00Z');

  s = calendars.formatDateRaw(EN, d, 'xxxx');
  expect(s).toEqual('+0000');
  s = calendars.formatDateRaw(EN, d, 'XXXX');
  expect(s).toEqual('+0000Z');

  s = calendars.formatDateRaw(EN, d, 'xxxxx');
  expect(s).toEqual('+00:00');
  s = calendars.formatDateRaw(EN, d, 'XXXXX');
  expect(s).toEqual('+00:00Z');
});
