import { DateFieldWidthType, RelativeTimeFieldType } from '@phensley/cldr-types';
import { Decimal } from '@phensley/decimal';

import { calendarsApi } from '../../_helpers';

test('display name', () => {
  let api = calendarsApi('en');
  let s: string;

  s = api.dateField('era');
  expect(s).toEqual('era');

  s = api.dateField('era', { context: 'middle-of-text' });
  expect(s).toEqual('era');

  s = api.dateField('era', { context: 'standalone' });
  expect(s).toEqual('Era');

  s = api.dateField('era', { context: 'begin-sentence' });
  expect(s).toEqual('Era');

  s = api.dateField('year');
  expect(s).toEqual('year');

  s = api.dateField('year', { context: 'middle-of-text' });
  expect(s).toEqual('year');

  s = api.dateField('year', { context: 'standalone' });
  expect(s).toEqual('Year');

  // Spanish

  api = calendarsApi('es');

  s = api.dateField('era');
  expect(s).toEqual('era');

  s = api.dateField('era', { context: 'middle-of-text' });
  expect(s).toEqual('era');

  s = api.dateField('era', { context: 'standalone' });
  expect(s).toEqual('era');

  s = api.dateField('era', { context: 'begin-sentence' });
  expect(s).toEqual('Era');

  s = api.dateField('year');
  expect(s).toEqual('año');

  s = api.dateField('year', { context: 'middle-of-text' });
  expect(s).toEqual('año');

  s = api.dateField('year', { context: 'standalone' });
  expect(s).toEqual('año');

  s = api.dateField('year', { context: 'begin-sentence' });
  expect(s).toEqual('Año');
});

test('relative time', () => {
  const api = calendarsApi('en');
  let s: string;

  s = api.formatRelativeTimeField(1, 'hour');
  expect(s).toEqual('in 1 hour');

  s = api.formatRelativeTimeField(2, 'hour');
  expect(s).toEqual('in 2 hours');

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
  expect(s).toEqual('6 days ago');

  s = api.formatRelativeTimeField('-6.3', 'day', { maximumFractionDigits: 1 });
  expect(s).toEqual('6.3 days ago');

  s = api.formatRelativeTimeField(1, 'sun');
  expect(s).toEqual('next Sunday');

  s = api.formatRelativeTimeField(4, 'sun');
  expect(s).toEqual('in 4 Sundays');

  s = api.formatRelativeTimeField(-1, 'month');
  expect(s).toEqual('last month');

  s = api.formatRelativeTimeField(-6, 'month');
  expect(s).toEqual('6 months ago');

  s = api.formatRelativeTimeField('-6.6', 'year');
  expect(s).toEqual('7 years ago');

  s = api.formatRelativeTimeField('-6.6', 'year', { maximumFractionDigits: 1 });
  expect(s).toEqual('6.6 years ago');

  s = api.formatRelativeTimeField(1, 'year');
  expect(s).toEqual('next year');
});

test('relative time 2', () => {
  // German for -2 and +2 days
  let api = calendarsApi('de');
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

  // English
  api = calendarsApi('en-CC');
  s = api.formatRelativeTimeField('-3', 'day');
  expect(s).toEqual('3 days ago');

  s = api.formatRelativeTimeField('-2', 'day');
  expect(s).toEqual('2 days ago');

  s = api.formatRelativeTimeField('-1', 'day');
  expect(s).toEqual('yesterday');

  s = api.formatRelativeTimeField('0', 'day');
  expect(s).toEqual('today');

  s = api.formatRelativeTimeField('1', 'day');
  expect(s).toEqual('tomorrow');

  s = api.formatRelativeTimeField('2', 'day');
  expect(s).toEqual('in 2 days');

  s = api.formatRelativeTimeField('3', 'day');
  expect(s).toEqual('in 3 days');
});

test('relative time options', () => {
  const api = calendarsApi('en');
  let s: string;

  s = api.formatRelativeTimeField(new Decimal('-3.2'), 'week');
  expect(s).toEqual('3 weeks ago');

  s = api.formatRelativeTimeField(new Decimal('-1.2'), 'week');
  expect(s).toEqual('last week');

  s = api.formatRelativeTimeField(new Decimal('-1.2'), 'week', { maximumFractionDigits: 1 });
  expect(s).toEqual('1.2 weeks ago');

  s = api.formatRelativeTimeField(1, 'week', {});
  expect(s).toEqual('next week');

  s = api.formatRelativeTimeField(1, 'week', { width: 'short' });
  expect(s).toEqual('next wk.');

  s = api.formatRelativeTimeField(-3, 'week', { width: 'narrow' });
  expect(s).toEqual('3w ago');

  s = api.formatRelativeTimeField(2, 'month', { width: 'narrow' });
  expect(s).toEqual('in 2mo');

  s = api.formatRelativeTimeField(-70, 'sun', { width: 'short' });
  expect(s).toEqual('70 Sun. ago');

  s = api.formatRelativeTimeField(-70, 'sun', { width: 'narrow' });
  expect(s).toEqual('70 Su ago');

  s = api.formatRelativeTimeField(-70, 'sun', { width: 'wide' });
  expect(s).toEqual('70 Sundays ago');

  // Invalid field
  s = api.formatRelativeTimeField(5, 'weekXX' as RelativeTimeFieldType);
  expect(s).toEqual('');

  // Invalid width defaults to wide
  s = api.formatRelativeTimeField(5, 'week', { width: 'wideXX' as DateFieldWidthType });
  expect(s).toEqual('in 5 weeks');

  // Invalid number
  expect(() => api.formatRelativeTimeField('xyz', 'week')).toThrowError();
});

test('relative time locales', () => {
  let api = calendarsApi('es');
  let s: string;

  s = api.formatRelativeTimeField(1, 'day');
  expect(s).toEqual('mañana');

  s = api.formatRelativeTimeField(-1, 'week');
  expect(s).toEqual('la semana pasada');

  api = calendarsApi('de');
  s = api.formatRelativeTimeField(1, 'day');
  expect(s).toEqual('morgen');

  s = api.formatRelativeTimeField(-1, 'week');
  expect(s).toEqual('letzte Woche');
});

test('numbering', () => {
  const api = calendarsApi('en');
  let s: string;

  s = api.formatRelativeTimeField(3, 'week', { width: 'short', nu: 'arab' });
  expect(s).toEqual('in ٣ wk.');
});

test('numeric only', () => {
  const api = calendarsApi('en');
  let s: string;

  s = api.formatRelativeTimeField(0, 'day', { numericOnly: true });
  expect(s).toEqual('in 0 days');

  s = api.formatRelativeTimeField(0, 'day', { numericOnly: true, alwaysNow: true });
  expect(s).toEqual('today');

  s = api.formatRelativeTimeField(1, 'day', { numericOnly: true });
  expect(s).toEqual('in 1 day');

  s = api.formatRelativeTimeField(1, 'day', { numericOnly: true, alwaysNow: true });
  expect(s).toEqual('in 1 day');

  s = api.formatRelativeTimeField(-1, 'day');
  expect(s).toEqual('yesterday');

  s = api.formatRelativeTimeField(-1, 'day', { numericOnly: true });
  expect(s).toEqual('1 day ago');

  s = api.formatRelativeTimeField(-1, 'day', { numericOnly: true, alwaysNow: true });
  expect(s).toEqual('1 day ago');
});
