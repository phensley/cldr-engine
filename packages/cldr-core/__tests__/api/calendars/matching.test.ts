import { BE, EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { Bundle, CalendarsImpl, InternalsImpl } from '../../../src';
import { ZonedDateTime } from '../../../src/types/datetime';

const INTERNALS = new InternalsImpl();

const datetime = (e: number, z: string) => new ZonedDateTime(e, z);

// March 11, 2018 7:00:25 AM UTC
const MARCH_11_2018_070025_UTC = 1520751625000;

const DAY = 86400000;
const NEW_YORK = 'America/New_York';
const LOS_ANGELES = 'America/Los_Angeles';
const LONDON = 'Europe/London';

const calendarsApi = (bundle: Bundle) => new CalendarsImpl(bundle, INTERNALS);

test('best-fit skeleton matching', () => {
  const mar11 = datetime(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  let api = calendarsApi(EN);
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

  api = calendarsApi(DE);

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
