import { RelativeTimeFieldType, RelativeTimeWidthType } from '@phensley/cldr-schema';
import { EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Bundle, CalendarsImpl, InternalsImpl } from '../../../src';
import { Decimal, ZonedDateTime } from '../../../src/types';

const datetime = (e: number, z: string) => new ZonedDateTime(e, z);

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const DAY = 86400000;
const LOS_ANGELES = 'America/Los_Angeles';

const INTERNALS = new InternalsImpl();

const calendarsApi = (bundle: Bundle) => new CalendarsImpl(bundle, INTERNALS);

test('relative time', () => {
  const api = calendarsApi(EN);
  let s: string;

  s = api.formatRelativeTimeField(1, 'hour');
  expect(s).toEqual('in 1 hour');

  s = api.formatRelativeTimeField(0, 'day');
  expect(s).toEqual('today');

  s = api.formatRelativeTimeField('0', 'day');
  expect(s).toEqual('today');

  s = api.formatRelativeTimeField(1, 'day');
  expect(s).toEqual('tomorrow');

  s = api.formatRelativeTimeField(-1, 'day');
  expect(s).toEqual('yesterday');

  s = api.formatRelativeTimeField('5', 'day');
  expect(s).toEqual('in 5 days');

  s = api.formatRelativeTimeField('-6.3', 'day');
  expect(s).toEqual('6.3 days ago');

  s = api.formatRelativeTimeField(4, 'sun');
  expect(s).toEqual('in 4 Sundays');

  s = api.formatRelativeTimeField(-1, 'month');
  expect(s).toEqual('last month');

  s = api.formatRelativeTimeField(-6, 'month');
  expect(s).toEqual('6 months ago');

  s = api.formatRelativeTimeField('-6.3', 'year');
  expect(s).toEqual('6.3 years ago');

  s = api.formatRelativeTimeField(1, 'year');
  expect(s).toEqual('next year');
});

test('relative time 2', () => {
  // German for -2 and +2 days
  const api = calendarsApi(DE);
  let s: string;

  s = api.formatRelativeTimeField('-3', 'day');
  expect(s).toEqual('vor 3 Tagen');

  s = api.formatRelativeTimeField('-2', 'day');
  expect(s).toEqual('vorgestern');

  s = api.formatRelativeTimeField('-1', 'day');
  expect(s).toEqual('gestern');

  s = api.formatRelativeTimeField('0', 'day');
  expect(s).toEqual('heute');

  s = api.formatRelativeTimeField('1', 'day');
  expect(s).toEqual('morgen');

  s = api.formatRelativeTimeField('2', 'day');
  expect(s).toEqual('übermorgen');

  s = api.formatRelativeTimeField('3', 'day');
  expect(s).toEqual('in 3 Tagen');
});

test('relative time options', () => {
  const api = calendarsApi(EN);
  let s: string;

  s = api.formatRelativeTimeField(new Decimal('-3.2'), 'week');
  expect(s).toEqual('3.2 weeks ago');

  s = api.formatRelativeTimeField(1, 'week', {});
  expect(s).toEqual('next week');

  s = api.formatRelativeTimeField(1, 'week', { width: 'short' });
  expect(s).toEqual('next wk.');

  s = api.formatRelativeTimeField(-3, 'week', { width: 'narrow' });
  expect(s).toEqual('3 wk. ago');

  s = api.formatRelativeTimeField(2, 'month', { width: 'narrow'});
  expect(s).toEqual('in 2 mo.');

  // Invalid field
  s = api.formatRelativeTimeField(5, 'weekXX' as RelativeTimeFieldType);
  expect(s).toEqual('');

  // Invalid width
  s = api.formatRelativeTimeField(5, 'week', { width: 'wideXX' as RelativeTimeWidthType });
  expect(s).toEqual('');

  // Invalid number
  expect(() => api.formatRelativeTimeField('xyz', 'week')).toThrowError();
});

test('relative time locales', () => {
  let api = calendarsApi(ES);
  let s: string;

  s = api.formatRelativeTimeField(1, 'day');
  expect(s).toEqual('mañana');

  s = api.formatRelativeTimeField(-1, 'week');
  expect(s).toEqual('la semana pasada');

  api = calendarsApi(DE);
  s = api.formatRelativeTimeField(1, 'day');
  expect(s).toEqual('morgen');

  s = api.formatRelativeTimeField(-1, 'week');
  expect(s).toEqual('letzte Woche');
});
