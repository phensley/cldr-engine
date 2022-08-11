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

  s = EN.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('Jersey');

  date.zoneId = 'Asia/Harbin';
  s = EN.formatDateRaw(date, { pattern: 'zzzz' });
  expect(s).toEqual('China Standard Time');
});
