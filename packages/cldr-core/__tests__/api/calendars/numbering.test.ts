import { languageBundle } from '../../_helpers';

import {
  Bundle,
  CalendarDate,
  CalendarsImpl,
  GregorianDate,
  InternalsImpl,
  NumberSystemType,
  PrivateApiImpl,
  UnixEpochTime,
  DateRawFormatOptions
} from '../../../src';
import { CalendarConstants } from '../../../src/systems/calendars/constants';

const INTERNALS = new InternalsImpl();

const unix = (epoch: number, zoneId: string): UnixEpochTime => ({ epoch, zoneId });

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

test('decimals', () => {
  const mar11 = unix(MARCH_11_2018_070025_UTC, LOS_ANGELES);
  let api = calendarsApi('zh');
  let s: string;

  s = api.formatDate(mar11, { datetime: 'full' });
  expect(s).toEqual('2018年3月10日星期六 北美太平洋标准时间 下午11:00:25');

  s = api.formatDate(mar11, { datetime: 'full', nu: 'native' });
  expect(s).toEqual('二〇一八年三月一〇日星期六 北美太平洋标准时间 下午一一:〇〇:二五');

  s = api.formatDate(mar11, { datetime: 'full', nu: 'hanidec' });
  expect(s).toEqual('二〇一八年三月一〇日星期六 北美太平洋标准时间 下午一一:〇〇:二五');

  // TODO: algorithmic numbering not yet implemented
  s = api.formatDate(mar11, { datetime: 'full', nu: 'hans' as NumberSystemType });
  expect(s).toEqual('2018年3月10日星期六 北美太平洋标准时间 下午11:00:25');

  api = calendarsApi('my');
  s = api.formatDate(mar11, { datetime: 'full' });
  expect(s).toEqual('၂၀၁၈၊ မတ် ၁၀၊ စနေ မြောက်အမေရိက ပစိဖိတ်စံတော်ချိန် ၂၃:၀၀:၂၅');

  api = calendarsApi('mr');
  s = api.formatDate(mar11, { datetime: 'full' });
  expect(s).toEqual('शनिवार, १० मार्च, २०१८ रोजी ११:००:२५ म.उ. पॅसिफिक प्रमाण वेळ');

  api = calendarsApi('bn-IN');
  s = api.formatDate(mar11, { datetime: 'full' });
  expect(s).toEqual('শনিবার, ১০ মার্চ, ২০১৮ ১১:০০:২৫ PM প্রশান্ত মহাসাগরীয় অঞ্চলের মানক সময়');
});

test('padding', () => {
  const jan01 = unix(JAN_01_2018_070025_UTC, NEW_YORK);
  const mar11 = unix(MARCH_11_2018_070025_UTC, NEW_YORK);

  const api = calendarsApi('en');
  let s: string;

  s = api.formatDateRaw(mar11, { pattern: 'yyyyyy' });
  expect(s).toEqual('002018');

  s = api.formatDateRaw(mar11, { pattern: 'YYYYYY' });
  expect(s).toEqual('002018');

  s = api.formatDateRaw(mar11, { pattern: 'uuuuuu' });
  expect(s).toEqual('002018');

  s = api.formatDateRaw(mar11, { pattern: 'rrrrrr' });
  expect(s).toEqual('002018');

  s = api.formatDateRaw(mar11, { pattern: 'QQ' });
  expect(s).toEqual('01');

  s = api.formatDateRaw(mar11, { pattern: 'qq' });
  expect(s).toEqual('01');

  s = api.formatDateRaw(mar11, { pattern: 'MM' });
  expect(s).toEqual('03');

  s = api.formatDateRaw(mar11, { pattern: 'LL' });
  expect(s).toEqual('03');

  s = api.formatDateRaw(jan01, { pattern: 'ww' });
  expect(s).toEqual('01');

  s = api.formatDateRaw(mar11, { pattern: 'ww' });
  expect(s).toEqual('11');

  s = api.formatDateRaw(mar11, { pattern: 'WW' });
  expect(s).toEqual('3');

  s = api.formatDateRaw(jan01, { pattern: 'dd' });
  expect(s).toEqual('01');

  s = api.formatDateRaw(jan01, { pattern: 'ddddd' });
  expect(s).toEqual('01');

  s = api.formatDateRaw(jan01, { pattern: 'DDD' });
  expect(s).toEqual('001');

  s = api.formatDateRaw(jan01, { pattern: 'DDDDD' });
  expect(s).toEqual('001');

  s = api.formatDateRaw(jan01, { pattern: 'FFF' });
  expect(s).toEqual('1');

  s = api.formatDateRaw(jan01, { pattern: 'gggggggggg' });
  expect(s).toEqual('0002458120');

  s = api.formatDateRaw(jan01, { pattern: 'ee' });
  expect(s).toEqual('02');

  s = api.formatDateRaw(jan01, { pattern: 'h' });
  expect(s).toEqual('2');

  s = api.formatDateRaw(jan01, { pattern: 'hhh' });
  expect(s).toEqual('02');

  s = api.formatDateRaw(jan01, { pattern: 'H' });
  expect(s).toEqual('14');

  s = api.formatDateRaw(jan01, { pattern: 'HHH' });
  expect(s).toEqual('14');

  s = api.formatDateRaw(jan01, { pattern: 'K' });
  expect(s).toEqual('2');

  s = api.formatDateRaw(jan01, { pattern: 'KKK' });
  expect(s).toEqual('02');

  s = api.formatDateRaw(jan01, { pattern: 'mm' });
  expect(s).toEqual('00');

  s = api.formatDateRaw(jan01, { pattern: 'mmm' });
  expect(s).toEqual('00');

  s = api.formatDateRaw(jan01, { pattern: 'ss' });
  expect(s).toEqual('25');

  s = api.formatDateRaw(jan01, { pattern: 'sss' });
  expect(s).toEqual('25');

  s = api.formatDateRaw(jan01, { pattern: 'AA' });
  expect(s).toEqual('50425000');

  s = api.formatDateRaw(jan01, { pattern: 'AAAAAAAAAA' });
  expect(s).toEqual('0050425000');
});
