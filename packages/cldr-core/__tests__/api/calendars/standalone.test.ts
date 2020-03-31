import { calendarsApi } from '../../_helpers';
import {
  EraWidthType,
  FieldWidthType,
} from '../../../src';

test('era', () => {
  const en = calendarsApi('en');
  let e = en.eras();

  expect(e[0]).toEqual({ none: 'Before Christ', sensitive: 'Before Common Era' });
  expect(e[1]).toEqual({ none: 'Anno Domini', sensitive: 'Common Era' });

  e = en.eras({ width: 'abbr' });
  expect(e[0]).toEqual({ none: 'BC', sensitive: 'BCE' });
  expect(e[1]).toEqual({ none: 'AD', sensitive: 'CE' });

  e = en.eras({ width: 'narrow' });
  expect(e[0]).toEqual({ none: 'B', sensitive: 'BCE' });
  expect(e[1]).toEqual({ none: 'A', sensitive: 'CE' });

  e = en.eras({ width: 'names' });
  expect(e[0]).toEqual({ none: 'Before Christ', sensitive: 'Before Common Era' });
  expect(e[1]).toEqual({ none: 'Anno Domini', sensitive: 'Common Era' });

  e = en.eras({ width: 'invalid' as EraWidthType });
  expect(e[0]).toEqual(undefined);
  expect(e[1]).toEqual(undefined);

  const es = calendarsApi('es');
  e = es.eras();
  expect(e[0]).toEqual({ none: 'antes de Cristo', sensitive: 'antes de la era común' });

  e = es.eras({ context: 'begin-sentence' });
  expect(e[0]).toEqual({ none: 'Antes de Cristo', sensitive: 'Antes de la era común' });
});

test('month', () => {
  const en = calendarsApi('en');
  let m = en.months();

  m = en.months({ width: 'narrow' });
  expect(m[1]).toEqual('J');
  expect(m[10]).toEqual('O');

  // short same as narrow for months
  m = en.months({ width: 'short' });
  expect(m[1]).toEqual('J');
  expect(m[10]).toEqual('O');

  m = en.months({ width: 'abbreviated' });
  expect(m[1]).toEqual('Jan');
  expect(m[10]).toEqual('Oct');

  m = en.months({ width: 'wide' });
  expect(m[1]).toEqual('January');
  expect(m[10]).toEqual('October');

  m = en.months({ width: 'invalid' as FieldWidthType });
  expect(m[1]).toEqual(undefined);
  expect(m[10]).toEqual(undefined);

  m = en.months({ ca: 'persian' });
  expect(m[2]).toEqual('Ordibehesht');
});

test('weekdays', () => {
  const en = calendarsApi('en');
  let w = en.weekdays();
  expect(w[2]).toEqual('Monday');

  // fetch twice to exercise caching
  w = en.weekdays({ width: 'short' });
  expect(w[6]).toEqual('Fr');

  w = en.weekdays({ width: 'narrow' });
  expect(w[6]).toEqual('F');

  w = en.weekdays({ width: 'wide' });
  expect(w[6]).toEqual('Friday');

  w = en.weekdays({ ca: 'persian' });
  expect(w[2]).toEqual('Monday');

  const es = calendarsApi('es');

  w = es.weekdays();
  expect(w[6]).toEqual('viernes');

  w = es.weekdays({ context: 'middle-of-text' });
  expect(w[6]).toEqual('viernes');

  w = es.weekdays({ context: 'standalone' });
  expect(w[6]).toEqual('Viernes');

  w = es.weekdays({ context: 'ui-list-or-menu' });
  expect(w[6]).toEqual('Viernes');

  w = es.weekdays({ context: 'begin-sentence' });
  expect(w[6]).toEqual('Viernes');
});

test('day periods', () => {
  let api = calendarsApi('en');

  let d = api.dayPeriods();
  expect(d.am).toEqual({ none: 'AM', casing: 'am' });
  expect(d.noon).toEqual({ none: 'noon' });

  d = api.dayPeriods({ ca: 'persian' });
  expect(d.noon).toEqual({ none: 'noon' });

  api = calendarsApi('es');

  d = api.dayPeriods();
  expect(d.noon).toEqual({ none: 'mediodía' });

  d = api.dayPeriods({ context: 'begin-sentence' });
  expect(d.noon).toEqual({ none: 'Mediodía' });

  d = api.dayPeriods({ context: 'ui-list-or-menu' });
  expect(d.noon).toEqual({ none: 'mediodía' });
});

test('quarter', () => {
  let api = calendarsApi('en');

  let q = api.quarters();
  expect(q[2]).toEqual('2nd quarter');

  q = api.quarters({ ca: 'persian' });
  expect(q[2]).toEqual('2nd quarter');

  api = calendarsApi('es');

  q = api.quarters();
  expect(q[2]).toEqual('2.º trimestre');

  q = api.quarters({ context: 'standalone' });
  expect(q[2]).toEqual('2.º trimestre');
});
