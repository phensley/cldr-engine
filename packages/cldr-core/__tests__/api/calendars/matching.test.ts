import { languageBundle } from '../../_helpers';
import { Bundle, CalendarsImpl, InternalsImpl, PrivateApiImpl, UnixEpochTime } from '../../../src';
import { CalendarManager } from '../../../src/internals/calendars/manager';

const INTERNALS = new InternalsImpl();

const unix = (epoch: number, zoneId: string): UnixEpochTime => ({ epoch, zoneId });

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const DAY = 86400000;
const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, INTERNALS);
const calendarsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new CalendarsImpl(bundle, INTERNALS, privateApi(bundle));
};

test('best-fit skeleton matching', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  let api = calendarsApi('en');
  let s: string;

  s = api.formatDate(mar11, { skeleton: 'hmmssv' });
  expect(s).toEqual('11:00:25 PM PT');

  s = api.formatDate(mar11, { skeleton: 'yMMdhmms' });
  expect(s).toEqual('03/10/2018, 11:00:25 PM');

  s = api.formatDate(mar11, { skeleton: 'yMMdhm' });
  expect(s).toEqual('03/10/2018, 11:00 PM');

  s = api.formatDate(mar11, { skeleton: 'yMMdhmmsv' });
  expect(s).toEqual('03/10/2018, 11:00:25 PM PT');

  s = api.formatDate(mar11, { skeleton: 'yMMMM' });
  expect(s).toEqual('March 2018');

  s = api.formatDate(mar11, { skeleton: 'yMME' });
  expect(s).toEqual('Sat, 03/10/2018');

  s = api.formatDate(mar11, { skeleton: 'yMMME' });
  expect(s).toEqual('Sat, Mar 10, 2018');

  api = calendarsApi('de');

  s = api.formatDate(mar11, { skeleton: 'hmmssv' });
  expect(s).toEqual('11:00:25 PM GMT+8');

  s = api.formatDate(mar11, { skeleton: 'yMMdhmms' });
  expect(s).toEqual('10.03.2018, 11:00:25 PM');

  s = api.formatDate(mar11, { skeleton: 'yMMdhm' });
  expect(s).toEqual('10.03.2018, 11:00 PM');

  s = api.formatDate(mar11, { skeleton: 'yMMdhmmsv' });
  expect(s).toEqual('10.03.2018, 11:00:25 PM GMT+8');

  s = api.formatDate(mar11, { skeleton: 'yMMMM' });
  expect(s).toEqual('März 2018');

  s = api.formatDate(mar11, { skeleton: 'yMME' });
  expect(s).toEqual('Sa., 10.03.2018');

  s = api.formatDate(mar11, { skeleton: 'yMMME' });
  expect(s).toEqual('Sa., 10. März 2018');
});

test('matching skeletons', () => {
  const en = languageBundle('en');
  const params = privateApi(en).getNumberParams('latn');

  const m = new CalendarManager(en, INTERNALS);
  const d = calendarsApi('en').toGregorianDate({
    epoch: MARCH_11_2018_070025_UTC, zoneId: 'America/New_York' });

  let r = m.getDateFormatRequest(d, { skeleton: 'Yw' }, params);
  expect(r.date).toEqual(['week ', ['w', 1], ' of ', ['Y', 1]]);
  expect(r.time).toEqual(undefined);

  // TODO: append individual missing fields to pattern

  r = m.getDateFormatRequest(d, { skeleton: 'Ywd' }, params);
  expect(r.date).toEqual(['week ', ['w', 1], ' of ', ['Y', 1]]);
  expect(r.time).toEqual(undefined);

  r = m.getDateFormatRequest(d, { skeleton: 'MMMMW' }, params);
  expect(r.date).toEqual(['week ', ['W', 1], ' of ', ['M', 4]]);
  expect(r.time).toEqual(undefined);

  r = m.getDateFormatRequest(d, { skeleton: 'yQQQQQd' }, params);
  expect(r.date).toEqual([['Q', 5], ' ', ['y', 1]]);
  expect(r.time).toEqual(undefined);

  r = m.getDateFormatRequest(d, { skeleton: 'yMMMdhmsv' }, params);
  expect(r.date).toEqual([['M', 3], ' ', ['d', 1], ', ', ['y', 1]]);
  expect(r.time).toEqual([['h', 1], ':', ['m', 2], ':', ['s', 2], ' ', ['a', 1], ' ', ['v', 1]]);

  r = m.getDateFormatRequest(d, { date: 'full' }, params);
  expect(r.date).toEqual([['E', 4], ', ', ['M', 4], ' ', ['d', 1], ', ', ['y', 1]]);
  expect(r.time).toEqual(undefined);

  r = m.getDateFormatRequest(d, { skeleton: 'hmsVVV' }, params);
  expect(r.date).toEqual(undefined);
  expect(r.time).toEqual([['h', 1], ':', ['m', 2], ':', ['s', 2], ' ', ['a', 1], ' ', ['V', 3]]);
});
