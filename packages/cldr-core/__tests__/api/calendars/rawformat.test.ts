import { calendarsApi } from '../../_helpers';

import { DateRawFormatOptions, ZonedDateTime } from '../../../src';

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

// Jan 01, 2018 19:00:25 PM UTC
const JAN_01_2018_070025_UTC = 1514833225000;

const NEW_YORK = 'America/New_York';

test('raw formats', () => {
  const jan01 = unix(JAN_01_2018_070025_UTC, NEW_YORK);

  const api = calendarsApi('en');

  const widths = [1, 2, 3, 4, 5, 6];
  const format = (date: ZonedDateTime, ch: string, opts: DateRawFormatOptions = {}): string[] =>
    widths.map((_, i) => api.formatDateRaw(date, { pattern: ch.repeat(widths[i]), ...opts }));

  let res: string[];

  // GGGG
  res = format(jan01, 'G');
  expect(res).toEqual(['AD', 'AD', 'AD', 'Anno Domini', 'A', 'AD']);

  res = format(jan01, 'G', { alt: { era: 'sensitive' } });
  expect(res).toEqual(['CE', 'CE', 'CE', 'Common Era', 'CE', 'CE']);

  // aaaa
  res = format(jan01, 'a');
  expect(res).toEqual(['PM', 'PM', 'PM', 'PM', 'p', 'PM']);

  res = format(jan01, 'a', { alt: { dayPeriod: 'casing' } });
  expect(res).toEqual(['pm', 'pm', 'pm', 'pm', 'pm', 'pm']);

  // EEEE

  res = format(jan01, 'E');
  expect(res).toEqual(['Mon', 'Mon', 'Mon', 'Monday', 'M', 'Mo']);

  // cccc

  res = format(jan01, 'c');
  expect(res).toEqual(['2', '2', 'Mon', 'Monday', 'M', 'Mo']);

  const time = JAN_01_2018_070025_UTC;
  const utc = unix(time, 'UTC');
  const utc1 = unix(time, 'Etc/GMT+1');
  const abidjan = unix(time, 'Africa/Abidjan');
  const tarawa = unix(time, 'Pacific/Tarawa'); // Changed in 2022b See NEWS re: backzone
  const ny = unix(time, 'America/New_York');

  // zzzz

  res = format(utc, 'z');
  expect(res).toEqual(['GMT', 'GMT', 'GMT', 'Greenwich Mean Time', '', '']);

  // Note: 'Etc/GMT+1' is a POSIX-style zone id, and positive means
  // "west of Greenwich" and negative is "east of Greenwich".
  // So +1 corresponds to 1 hour west / behind GMT, so the offset is -1 hour.
  res = format(utc1, 'z');
  expect(res).toEqual(['GMT-1', '', '', 'GMT-01:00', '', '']);

  res = format(abidjan, 'z');
  expect(res).toEqual(['GMT', 'GMT', 'GMT', 'Greenwich Mean Time', '', '']);

  res = format(tarawa, 'z');
  expect(res).toEqual(['GMT+12', '', '', 'Wallis & Futuna Time', '', '']);

  res = format(ny, 'z');
  expect(res).toEqual(['EST', 'EST', 'EST', 'Eastern Standard Time', '', '']);

  // vvvv

  res = format(utc, 'v');
  expect(res).toEqual(['GMT', '', '', 'GMT', '', '']);

  res = format(tarawa, 'v');
  expect(res).toEqual(['GMT+12', '', '', 'GMT+12:00', '', '']);

  res = format(ny, 'v');
  expect(res).toEqual(['ET', '', '', 'Eastern Time', '', '']);

  // VVVV

  res = format(utc, 'V');
  expect(res).toEqual(['unk', 'Etc/UTC', 'Unknown City', 'GMT', '', '']);

  res = format(tarawa, 'V');
  expect(res).toEqual(['unk', 'Pacific/Tarawa', 'Tarawa', 'Tarawa Time', '', '']);

  res = format(ny, 'V');
  expect(res).toEqual(['unk', 'America/New_York', 'New York', 'New York Time', '', '']);

  // OOOO

  res = format(utc, 'O');
  expect(res).toEqual(['GMT', '', '', 'GMT', '', '']);

  res = format(tarawa, 'O');
  expect(res).toEqual(['GMT+12', '', '', 'GMT+12:00', '', '']);

  res = format(ny, 'O');
  expect(res).toEqual(['GMT-5', '', '', 'GMT-05:00', '', '']);

  // xxxx

  res = format(utc, 'x');
  expect(res).toEqual(['+00', '+0000', '+00:00', '+0000', '+00:00', '']);

  res = format(tarawa, 'x');
  expect(res).toEqual(['+12', '+1200', '+12:00', '+1200', '+12:00', '']);

  res = format(ny, 'x');
  expect(res).toEqual(['-05', '-0500', '-05:00', '-0500', '-05:00', '']);

  // TODO: cyclic year not yet implemented. here for coverage
  res = format(jan01, 'U');
  expect(res).toEqual(['', '', '', '', '', '']);
});
