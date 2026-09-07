import { calendarsApi } from '../../_helpers';

const EN = calendarsApi('en-US');

test('timezone identifiers', () => {
  const ids = EN.timeZoneIds();
  expect(ids).toContain('America/New_York');
  expect(ids).toContain('Europe/Rome');
  expect(ids).toContain('Pacific/Tarawa'); // Changed in 2022b See NEWS re: backzone
});

test('stability', () => {
  const date = { date: 1554263155000, zoneId: '' };
  let s: string;

  date.zoneId = 'America/New_York';
  s = EN.formatDateRaw(date, { pattern: 'zzzz' });
  expect(s).toEqual('Eastern Daylight Time');

  date.zoneId = 'America/Argentina/La_Rioja';
  s = EN.formatDateRaw(date, { pattern: 'zzzz' });
  expect(s).toEqual('Argentina Standard Time');

  s = EN.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('La Rioja');

  date.zoneId = 'America/Catamarca';
  s = EN.formatDateRaw(date, { pattern: 'zzzz' });
  expect(s).toEqual('Argentina Standard Time');

  s = EN.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('Catamarca');

  date.zoneId = 'America/Argentina/Catamarca';
  s = EN.formatDateRaw(date, { pattern: 'zzzz' });
  expect(s).toEqual('Argentina Standard Time');

  s = EN.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('Catamarca');

  date.zoneId = 'Europe/Isle_of_Man';
  s = EN.formatDateRaw(date, { pattern: 'zzzz' });
  expect(s).toEqual('GMT+01:00');

  s = EN.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('Isle of Man');

  date.zoneId = 'Europe/Jersey';
  s = EN.formatDateRaw(date, { pattern: 'zzzz' });
  expect(s).toEqual('GMT+01:00');

  date.zoneId = 'Europe/Jersey';
  s = EN.formatDateRaw(date, { pattern: 'ZZZZZ' });
  expect(s).toEqual('+01:00');

  s = EN.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('Jersey');

  date.zoneId = 'Asia/Harbin';
  s = EN.formatDateRaw(date, { pattern: 'zzzz' });
  expect(s).toEqual('China Standard Time');
});

test('iso8601 X/x offset formats (TR35)', () => {
  // ISO 8601 local time difference format (X family) per TR35. Expected cells
  // verified against ICU4J: 'Z' is the UTC indicator and is used only when the
  // offset is zero and the specifier is X* (uppercase) — for EVERY width 1..5.
  // Lowercase x* renders the numeric offset ('+00', '+0000', ...), never 'Z'.
  // Colon appears for XXX (extended) and XXXXX only; XXXX stays basic, and
  // width 1 (X) appends minutes whenever they are non-zero.
  const url = (zoneId: string, pattern: string): string =>
    EN.formatDateRaw({ date: 1554263155000, zoneId }, { pattern });

  // Zero offset (UTC).
  expect(url('UTC', 'X')).toEqual('Z');
  expect(url('UTC', 'XX')).toEqual('Z');
  expect(url('UTC', 'XXX')).toEqual('Z');
  expect(url('UTC', 'XXXX')).toEqual('Z');
  expect(url('UTC', 'XXXXX')).toEqual('Z');
  expect(url('UTC', 'x')).toEqual('+00');
  expect(url('UTC', 'xx')).toEqual('+0000');
  expect(url('UTC', 'xxx')).toEqual('+00:00');
  expect(url('UTC', 'xxxx')).toEqual('+0000');
  expect(url('UTC', 'xxxxx')).toEqual('+00:00');

  // Fractional offset +05:30 (Asia/Kolkata has no DST, so the offset holds
  // for any date).
  const tzid = 'Asia/Kolkata';
  expect(EN.timeZoneIds()).toContain(tzid);
  expect(url(tzid, 'X')).toEqual('+0530');
  expect(url(tzid, 'XX')).toEqual('+0530');
  expect(url(tzid, 'XXX')).toEqual('+05:30');
  expect(url(tzid, 'XXXX')).toEqual('+0530');
  expect(url(tzid, 'XXXXX')).toEqual('+05:30');
  expect(url(tzid, 'x')).toEqual('+0530');
  expect(url(tzid, 'xx')).toEqual('+0530');
  expect(url(tzid, 'xxx')).toEqual('+05:30');
  expect(url(tzid, 'xxxx')).toEqual('+0530');
  expect(url(tzid, 'xxxxx')).toEqual('+05:30');
});
