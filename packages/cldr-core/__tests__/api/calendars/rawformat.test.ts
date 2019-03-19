import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarsImpl,
  InternalsImpl,
  PrivateApiImpl,
  ZonedDateTime
} from '../../../src';

const INTERNALS = new InternalsImpl();

const unix = (date: number, zoneId: string): ZonedDateTime => ({ date, zoneId });

// Jan 01, 2018 19:00:25 PM UTC
const JAN_01_2018_070025_UTC = 1514833225000;

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

test('raw formats', () => {
  const jan01 = unix(JAN_01_2018_070025_UTC, NEW_YORK);
  const mar11 = unix(MARCH_11_2018_070025_UTC, NEW_YORK);

  const api = calendarsApi('en');

  const widths = [1, 2, 3, 4, 5, 6];
  const format = (date: ZonedDateTime, ch: string): string[] =>
    widths.map((w, i) => api.formatDateRaw(date, { pattern: ch.repeat(widths[i]) }));

  // EEEE

  let res = format(jan01, 'E');
  expect(res).toEqual([
    'Mon', 'Mon', 'Mon', 'Monday', 'M', 'Mo'
  ]);

  // cccc

  res = format(jan01, 'c');
  expect(res).toEqual([
    '2', '2', 'Mon', 'Monday', 'M', 'Mo'
  ]);

  const time = JAN_01_2018_070025_UTC;
  const utc = unix(time, 'UTC');
  const wallis = unix(time, 'Pacific/Wallis');
  const ny = unix(time, 'America/New_York');

  // zzzz

  res = format(utc, 'z');
  expect(res).toEqual([
    'GMT', 'GMT', 'GMT', 'Greenwich Mean Time', '', ''
  ]);

  res = format(wallis, 'z');
  expect(res).toEqual([
    'GMT+12', '', '', 'Wallis & Futuna Time', '', ''
  ]);

  res = format(ny, 'z');
  expect(res).toEqual([
    'EST', 'EST', 'EST', 'Eastern Standard Time', '', ''
  ]);

  // vvvv

  res = format(utc, 'v');
  expect(res).toEqual([
    'GMT', '', '', 'GMT', '', ''
  ]);

  res = format(wallis, 'v');
  expect(res).toEqual([
    'GMT+12', '', '', 'GMT+12:00', '', ''
  ]);

  res = format(ny, 'v');
  expect(res).toEqual([
    'ET', '', '', 'Eastern Time', '', ''
  ]);

  // VVVV

  res = format(utc, 'V');
  expect(res).toEqual([
    'unk', 'UTC', 'Unknown City', 'GMT', '', ''
  ]);

  res = format(wallis, 'V');
  expect(res).toEqual([
    'unk', 'Pacific/Wallis', 'Wallis', 'Wallis Time', '', ''
  ]);

  res = format(ny, 'V');
  expect(res).toEqual([
    'unk', 'America/New_York', 'New York', 'New York Time', '', ''
  ]);

  // OOOO

  res = format(utc, 'O');
  expect(res).toEqual([
    'GMT', '', '', 'GMT', '', ''
  ]);

  res = format(wallis, 'O');
  expect(res).toEqual([
    'GMT+12', '', '', 'GMT+12:00', '', ''
  ]);

  res = format(ny, 'O');
  expect(res).toEqual([
    'GMT-5', '', '', 'GMT-05:00', '', ''
  ]);

  // xxxx

  res = format(utc, 'x');
  expect(res).toEqual([
    '+00', '+0000', '+00:00', '+0000', '+00:00', ''
  ]);

  res = format(wallis, 'x');
  expect(res).toEqual([
    '+12', '+1200', '+12:00', '+1200', '+12:00', ''
  ]);

  res = format(ny, 'x');
  expect(res).toEqual([
    '-05', '-0500', '-05:00', '-0500', '-05:00', ''
  ]);

  // TODO: cyclic year not yet implemented. here for coverage
  res = format(jan01, 'U');
  expect(res).toEqual([
    '', '', '', '', '', ''
  ]);

});