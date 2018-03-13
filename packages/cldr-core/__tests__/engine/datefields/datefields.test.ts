import { RelativeTimeFieldType, RelativeTimeWidthType } from '@phensley/cldr-schema';
import { EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { DateFieldsEngine, DateFieldsInternal, WrapperInternal } from '../../../src/engine';
import { Decimal, ZonedDateTime } from '../../../src/types';

const datetime = (e: number, z: string) => new ZonedDateTime(e, z);

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const DAY = 86400000;
const LOS_ANGELES = 'America/Los_Angeles';

const SCHEMA = buildSchema();
const WRAPPER = new WrapperInternal();
const INTERNAL = new DateFieldsInternal(SCHEMA, WRAPPER);

test('relative', () => {
  const engine = new DateFieldsEngine(INTERNAL, EN);
  let s: string;

  s = engine.formatRelativeTime(1, 'hour');
  expect(s).toEqual('in 1 hour');

  s = engine.formatRelativeTime(0, 'day');
  expect(s).toEqual('today');

  s = engine.formatRelativeTime('0', 'day');
  expect(s).toEqual('today');

  s = engine.formatRelativeTime(1, 'day');
  expect(s).toEqual('tomorrow');

  s = engine.formatRelativeTime(-1, 'day');
  expect(s).toEqual('yesterday');

  s = engine.formatRelativeTime('5', 'day');
  expect(s).toEqual('in 5 days');

  s = engine.formatRelativeTime('-6.3', 'day');
  expect(s).toEqual('6.3 days ago');

  s = engine.formatRelativeTime(4, 'sun');
  expect(s).toEqual('in 4 Sundays');

  s = engine.formatRelativeTime(-1, 'month');
  expect(s).toEqual('last month');

  s = engine.formatRelativeTime(-6, 'month');
  expect(s).toEqual('6 months ago');

  s = engine.formatRelativeTime('-6.3', 'year');
  expect(s).toEqual('6.3 years ago');

  s = engine.formatRelativeTime(1, 'year');
  expect(s).toEqual('next year');

  s = engine.formatRelativeTime(new Decimal('-3.2'), 'week');
  expect(s).toEqual('3.2 weeks ago');

  s = engine.formatRelativeTime(1, 'week', { width: 'short' });
  expect(s).toEqual('next wk.');

  s = engine.formatRelativeTime(-3, 'week', { width: 'narrow' });
  expect(s).toEqual('3 wk. ago');

  s = engine.formatRelativeTime(2, 'month', { width: 'narrow'});
  expect(s).toEqual('in 2 mo.');

  // Invalid field
  s = engine.formatRelativeTime(5, 'weekXX' as RelativeTimeFieldType);
  expect(s).toEqual('');

  // Invalid width
  s = engine.formatRelativeTime(5, 'week', { width: 'wideXX' as RelativeTimeWidthType });
  expect(s).toEqual('');
});
