import { languageBundle } from '../../_helpers';
import {
  Bundle,
  CalendarsImpl,
  InternalsImpl,
  PrivateApiImpl
} from '../../../src';

const INTERNALS = new InternalsImpl();

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

test('era', () => {
  const en = calendarsApi('en');
  let e = en.eras();

  expect(e[0]).toEqual('Before Christ');
  expect(e[1]).toEqual('Anno Domini');

  const es = calendarsApi('es');
  e = es.eras();
  expect(e[0]).toEqual('antes de Cristo');

  e = es.eras({ context: 'begin-sentence' });
  expect(e[0]).toEqual('Antes de Cristo');
});

test('month', () => {
  const en = calendarsApi('en');
  let m = en.months();
  expect(m[2]).toEqual('February');

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
  expect(d.noon).toEqual('noon');

  d = api.dayPeriods({ ca: 'persian' });
  expect(d.noon).toEqual('noon');

  api = calendarsApi('es');

  d = api.dayPeriods();
  expect(d.noon).toEqual('mediodía');

  d = api.dayPeriods({ context: 'begin-sentence' });
  expect(d.noon).toEqual('Mediodía');

  d = api.dayPeriods({ context: 'ui-list-or-menu' });
  expect(d.noon).toEqual('mediodía');
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
