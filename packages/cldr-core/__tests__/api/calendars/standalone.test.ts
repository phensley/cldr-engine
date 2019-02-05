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
  const e = en.eras();
  expect(e.names[0]).toEqual('Before Christ');
  expect(e.names[1]).toEqual('Anno Domini');
});

test('month', () => {
  const en = calendarsApi('en');
  let m = en.months();
  expect(m.wide[2]).toEqual('February');

  m = en.months('persian');
  expect(m.wide[2]).toEqual('Ordibehesht');
});

test('weekdays', () => {
  const en = calendarsApi('en');
  let w = en.weekdays();
  expect(w.wide[2]).toEqual('Monday');

  w = en.weekdays('persian');
  expect(w.wide[2]).toEqual('Monday');
});

test('day periods', () => {
  const en = calendarsApi('en');
  let d = en.dayPeriods();
  expect(d.wide.noon).toEqual('noon');

  d = en.dayPeriods('persian');
  expect(d.wide.noon).toEqual('noon');
});

test('quarter', () => {
  const en = calendarsApi('en');
  let q = en.quarters();
  expect(q.wide[2]).toEqual('2nd quarter');

  q = en.quarters('persian');
  expect(q.wide[2]).toEqual('2nd quarter');
});
