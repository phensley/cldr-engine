import { BE, EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { GregorianEngine, GregorianInternal, WrapperInternal } from '../../../src/engine';
import { ZonedDateTime } from '../../../src/types/datetime';

const SCHEMA = buildSchema();
const INTERNAL = new GregorianInternal(SCHEMA, new WrapperInternal());

const datetime = (e: number, z: string) => new ZonedDateTime(e, z);

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const DAY = 86400000;
const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

test('formats', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = datetime(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const engine = new GregorianEngine(INTERNAL, EN);
  let s = engine.format(mar11, { date: 'full' });
  expect(s).toEqual('Saturday, March 10, 2018');

  s = engine.format(mar11, { date: 'long' });
  expect(s).toEqual('March 10, 2018');

  s = engine.format(mar11, { date: 'medium' });
  expect(s).toEqual('Mar 10, 2018');

  s = engine.format(mar11, { date: 'short' });
  expect(s).toEqual('3/10/18');

  s = engine.format(mar11, { time: 'full' });
  expect(s).toEqual('11:00:25 PM Pacific Standard Time');

  s = engine.format(mar11, { time: 'long' });
  expect(s).toEqual('11:00:25 PM PST');

  s = engine.format(mar11, { time: 'medium' });
  expect(s).toEqual('11:00:25 PM');

  s = engine.format(mar11, { time: 'short' });
  expect(s).toEqual('11:00 PM');

  s = engine.format(mar11, { datetime: 'full' });
  expect(s).toEqual('Saturday, March 10, 2018 at 11:00:25 PM Pacific Standard Time');

  s = engine.format(mar11, { datetime: 'long' });
  expect(s).toEqual('March 10, 2018 at 11:00:25 PM PST');

  s = engine.format(mar11, { datetime: 'medium' });
  expect(s).toEqual('Mar 10, 2018, 11:00:25 PM');

  s = engine.format(mar11, { datetime: 'short' });
  expect(s).toEqual('3/10/18, 11:00 PM');

  s = engine.format(mar11, { date: 'yMMMd', time: 'hms', wrap: 'full' });
  expect(s).toEqual('Mar 10, 2018 at 11:00:25 PM');

  s = engine.format(mar11, { date: 'yMMMd', time: 'hms', wrap: 'long' });
  expect(s).toEqual('Mar 10, 2018 at 11:00:25 PM');

  s = engine.format(mar11, { date: 'yMMMd', time: 'hms', wrap: 'medium' });
  expect(s).toEqual('Mar 10, 2018, 11:00:25 PM');

  s = engine.format(mar11, { date: 'yMMMd', time: 'hms', wrap: 'short' });
  expect(s).toEqual('Mar 10, 2018, 11:00:25 PM');
});

test('parts', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = datetime(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const engine = new GregorianEngine(INTERNAL, EN);
  let s = engine.formatParts(mar11, { date: 'full' });
  expect(s).toEqual([
    { type: 'weekday', value: 'Saturday'},
    { type: 'literal', value: ', '},
    { type: 'month', value: 'March'},
    { type: 'literal', value: ' '},
    { type: 'day', value: '10'},
    { type: 'literal', value: ', '},
    { type: 'year', value: '2018'}
  ]);

  s = engine.formatParts(mar11, { date: 'short' });
  expect(s).toEqual([
    { type: 'month', value: '3'},
    { type: 'literal', value: '/'},
    { type: 'day', value: '10'},
    { type: 'literal', value: '/'},
    { type: 'year', value: '18'}
  ]);

  s = engine.formatParts(mar11, { time: 'full' });
  expect(s).toEqual([
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

  s = engine.formatParts(mar11, { time: 'medium' });
  expect(s).toEqual([
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

  let engine = new GregorianEngine(INTERNAL, EN);
  let s = engine.formatInterval(mar11, mar14, 'yMMMd');
  expect(s).toEqual('Mar 10 – 14, 2018');

  engine = new GregorianEngine(INTERNAL, EN_GB);
  s = engine.format(mar11, { date: 'full' });
  expect(s).toEqual('Saturday, 10 March 2018');

  s = engine.formatInterval(mar11, mar14, 'yMMMd');
  expect(s).toEqual('10–14 Mar 2018');

  engine = new GregorianEngine(INTERNAL, ES);
  s = engine.format(mar11, { date: 'full' });
  expect(s).toEqual('sábado, 10 de marzo de 2018');

  engine = new GregorianEngine(INTERNAL, ES_419);
  s = engine.format(mar11, { date: 'medium' });
  expect(s).toEqual('10 mar. 2018');

  engine = new GregorianEngine(INTERNAL, FR);
  s = engine.format(mar11, { date: 'full' });
  expect(s).toEqual('samedi 10 mars 2018');

  engine = new GregorianEngine(INTERNAL, LT);
  s = engine.format(mar11, { date: 'full' });
  expect(s).toEqual('2018 m. kovo 10 d., šeštadienis');

  engine = new GregorianEngine(INTERNAL, SR);
  s = engine.format(mar11, { date: 'full' });
  expect(s).toEqual('субота, 10. март 2018.');

  engine = new GregorianEngine(INTERNAL, ZH);
  s = engine.format(mar11, { date: 'full' });
  expect(s).toEqual('2018年3月10日星期六');
});

test('interval parts', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  const mar14 = datetime(MARCH_11_2018_070025_UTC + (DAY * 3), LOS_ANGELES);

  const engine = new GregorianEngine(INTERNAL, EN);
  const res = engine.formatIntervalParts(mar11, mar14, 'yMMMd');
  expect(res).toEqual([
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

  const engine = new GregorianEngine(INTERNAL, EN);

  let d = losangeles(0);
  expect(engine.formatRaw(d, 'a')).toEqual('PM');
  expect(engine.formatRaw(d, 'aaaa')).toEqual('PM');
  expect(engine.formatRaw(d, 'aaaaa')).toEqual('p');
  expect(engine.formatRaw(d, 'b')).toEqual('PM');
  expect(engine.formatRaw(d, 'bbbb')).toEqual('PM');
  expect(engine.formatRaw(d, 'bbbbb')).toEqual('p');

  d = london(0);
  expect(engine.formatRaw(d, 'a')).toEqual('AM');
  expect(engine.formatRaw(d, 'aaaa')).toEqual('AM');
  expect(engine.formatRaw(d, 'aaaaa')).toEqual('a');
  expect(engine.formatRaw(d, 'b')).toEqual('AM');
  expect(engine.formatRaw(d, 'bbbb')).toEqual('AM');
  expect(engine.formatRaw(d, 'bbbbb')).toEqual('a');

  d = london(-(7 * 3600 * 1000));
  expect(engine.formatRaw(d, 'b')).toEqual('midnight');
  expect(engine.formatRaw(d, 'bbbb')).toEqual('midnight');
  expect(engine.formatRaw(d, 'bbbbb')).toEqual('mi');

  d = london(5 * 3600 * 1000);
  expect(engine.formatRaw(d, 'b')).toEqual('noon');
  expect(engine.formatRaw(d, 'bbbb')).toEqual('noon');
  expect(engine.formatRaw(d, 'bbbbb')).toEqual('n');

  expect(engine.formatRawParts(d, 'b')).toEqual([
    { type: 'dayperiod', value: 'noon'}
  ]);
});

test('flexible day periods', () => {
  const base = MARCH_11_2018_070025_UTC;
  const losangeles = (n: number) => datetime(base + n, LOS_ANGELES);
  const london = (n: number) => datetime(base + n, LONDON);

  const hour = 3600 * 1000;

  let engine = new GregorianEngine(INTERNAL, EN);
  let d: ZonedDateTime;

  // 11 pm
  d = losangeles(0);
  expect(engine.formatRaw(d, 'B')).toEqual('at night');

  // 8 pm
  d = losangeles(-3 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('in the evening');

  // 5 pm
  d = losangeles(-6 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('in the afternoon');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('noon');

  // 10 am
  d = losangeles(-13 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('in the morning');

  // 3 am
  d = losangeles(-20 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('at night');

  // 12 am
  d = losangeles(-23 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('midnight');

  engine = new GregorianEngine(INTERNAL, ES);

  // 11 pm
  d = losangeles(0);
  expect(engine.formatRaw(d, 'B')).toEqual('de la noche');

  // 7 pm
  d = losangeles(-4 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('de la tarde');

  // 3 pm
  d = losangeles(-8 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('de la tarde');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('del mediodía');

  // 10 am
  d = losangeles(-13 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('de la mañana');

  // 3 am
  d = losangeles(-20 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('de la madrugada');

  // 12 am
  d = losangeles(-23 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('de la madrugada');

  // "be" has no explicit rules so falls back to extended, but
  // only has basic am/pm keys.
  engine = new GregorianEngine(INTERNAL, BE);

  // 11 pm
  d = losangeles(0);
  expect(engine.formatRaw(d, 'B')).toEqual('PM');

  // 7 pm
  d = losangeles(-4 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('PM');

  // 3 pm
  d = losangeles(-8 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('PM');

  // 12 pm
  d = losangeles(-11 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('PM');

  // 10 am
  d = losangeles(-13 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('AM');

  // 3 am
  d = losangeles(-20 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('AM');

  // 12 am
  d = losangeles(-23 * hour);
  expect(engine.formatRaw(d, 'B')).toEqual('AM');
});

test('weekday firstday raw', () => {
  const base = MARCH_11_2018_070025_UTC;

  // March 11 NY
  let d = datetime(base, NEW_YORK);
  expect(d.getDayOfWeek()).toEqual(7);
  expect(d.getUTCDayOfWeek()).toEqual(7);

  // US firstDay = sun
  let s = INTERNAL.formatRaw(EN, d, 'e');
  expect(s).toEqual('1');

  // DE firstDay = mon
  s = INTERNAL.formatRaw(DE, d, 'e');
  expect(s).toEqual('7');

  // March 12 NY
  d = datetime(base + DAY, NEW_YORK);
  expect(d.getDayOfWeek()).toEqual(1);
  expect(d.getUTCDayOfWeek()).toEqual(1);

  s = INTERNAL.formatRaw(EN, d, 'e');
  expect(s).toEqual('2');

  s = INTERNAL.formatRaw(DE, d, 'e');
  expect(s).toEqual('1');

  // March 10 LA
  d = datetime(base, LOS_ANGELES);
  expect(d.getDayOfWeek()).toEqual(6); // saturday local
  expect(d.getUTCDayOfWeek()).toEqual(7); // sunday utc

  s = INTERNAL.formatRaw(EN, d, 'e');
  expect(s).toEqual('7'); // sat is last day of week

  s = INTERNAL.formatRaw(DE, d, 'e');
  expect(s).toEqual('6'); // sat is next to last day of week
});

test('timezone short/long specific non-location format', () => {
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = INTERNAL.formatRaw(EN, d, 'z');
  expect(s).toEqual('EDT');

  s = INTERNAL.formatRaw(EN, d, 'zzzz');
  expect(s).toEqual('Eastern Daylight Time');
});

test('timezone iso8601 basic/extended', () => {
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = INTERNAL.formatRaw(EN, d, 'Z');
  expect(s).toEqual('+0400');

  s = INTERNAL.formatRaw(EN, d, 'ZZZZ'); // Same as 'OOOO'
  expect(s).toEqual('GMT+04:00');

  s = INTERNAL.formatRaw(EN, d, 'ZZZZZ');
  expect(s).toEqual('+04:00');
});

test('iso week', () => {
  const e = new GregorianEngine(INTERNAL, EN);
  const base = MARCH_11_2018_070025_UTC;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);
  expect(d.getDayOfYear()).toEqual(70);
  expect(e.getCompactISOWeekDate(d)).toEqual('2018W107');
  expect(e.getExtendedISOWeekDate(d)).toEqual('2018-W10-7');

  d = datetime(base + (10 * DAY), NEW_YORK);
  expect(d.getDayOfYear()).toEqual(80);
  expect(e.getCompactISOWeekDate(d)).toEqual('2018W123');
  expect(e.getExtendedISOWeekDate(d)).toEqual('2018-W12-3');

  d = datetime(base + (90 * DAY), NEW_YORK);
  expect(d.getDayOfYear()).toEqual(160);
  expect(e.getCompactISOWeekDate(d)).toEqual('2018W236');
  expect(e.getExtendedISOWeekDate(d)).toEqual('2018-W23-6');
});

test('timezone short/long localized gmt', () => {
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = INTERNAL.formatRaw(EN, d, 'O');
  expect(s).toEqual('GMT+4');

  s = INTERNAL.formatRaw(EN, d, 'OOOO');
  expect(s).toEqual('GMT+04:00');
});

test('timezone short/long generic non-location format', () => {
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = INTERNAL.formatRaw(EN, d, 'v');
  expect(s).toEqual('ET');

  s = INTERNAL.formatRaw(EN, d, 'vvvv');
  expect(s).toEqual('Eastern Time');

  s = INTERNAL.formatRaw(ES_419, d, 'v');
  expect(s).toEqual('GMT+4');

  s = INTERNAL.formatRaw(ES_419, d, 'vvvv');
  expect(s).toEqual('hora oriental');

  s = INTERNAL.formatRaw(DE, d, 'v');
  expect(s).toEqual('GMT+4');

  s = INTERNAL.formatRaw(DE, d, 'vvvv');
  expect(s).toEqual('Nordamerikanische Ostküstenzeit');
});

test('timezone short/long zone id, exemplar city, generic location format', () => {
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = INTERNAL.formatRaw(EN, d, 'V');
  expect(s).toEqual('unk');

  s = INTERNAL.formatRaw(EN, d, 'VV');
  expect(s).toEqual('America/New_York');

  s = INTERNAL.formatRaw(EN, d, 'VVV');
  expect(s).toEqual('New York');

  s = INTERNAL.formatRaw(EN, d, 'VVVV');
  expect(s).toEqual('New York Time');
});

test('timezone iso8601 basic format', () => {
  const base = MARCH_11_2018_070025_UTC;
  let s: string;
  let d: ZonedDateTime;

  d = datetime(base, NEW_YORK);

  s = INTERNAL.formatRaw(EN, d, 'x');
  expect(s).toEqual('+04');
  s = INTERNAL.formatRaw(EN, d, 'X');
  expect(s).toEqual('+04');

  s = INTERNAL.formatRaw(EN, d, 'xx');
  expect(s).toEqual('+0400');
  s = INTERNAL.formatRaw(EN, d, 'XX');
  expect(s).toEqual('+0400');

  s = INTERNAL.formatRaw(EN, d, 'xxx');
  expect(s).toEqual('+04:00');
  s = INTERNAL.formatRaw(EN, d, 'XXX');
  expect(s).toEqual('+04:00');

  s = INTERNAL.formatRaw(EN, d, 'xxxx');
  expect(s).toEqual('+0400');
  s = INTERNAL.formatRaw(EN, d, 'XXXX');
  expect(s).toEqual('+0400');

  s = INTERNAL.formatRaw(EN, d, 'xxxxx');
  expect(s).toEqual('+04:00');
  s = INTERNAL.formatRaw(EN, d, 'XXXXX');
  expect(s).toEqual('+04:00');

  d = datetime(base, LONDON);

  s = INTERNAL.formatRaw(EN, d, 'x');
  expect(s).toEqual('+00');
  s = INTERNAL.formatRaw(EN, d, 'X');
  expect(s).toEqual('+00Z');

  s = INTERNAL.formatRaw(EN, d, 'xx');
  expect(s).toEqual('+0000');
  s = INTERNAL.formatRaw(EN, d, 'XX');
  expect(s).toEqual('+0000Z');

  s = INTERNAL.formatRaw(EN, d, 'xxx');
  expect(s).toEqual('+00:00');
  s = INTERNAL.formatRaw(EN, d, 'XXX');
  expect(s).toEqual('+00:00Z');

  s = INTERNAL.formatRaw(EN, d, 'xxxx');
  expect(s).toEqual('+0000');
  s = INTERNAL.formatRaw(EN, d, 'XXXX');
  expect(s).toEqual('+0000Z');

  s = INTERNAL.formatRaw(EN, d, 'xxxxx');
  expect(s).toEqual('+00:00');
  s = INTERNAL.formatRaw(EN, d, 'XXXXX');
  expect(s).toEqual('+00:00Z');
});
