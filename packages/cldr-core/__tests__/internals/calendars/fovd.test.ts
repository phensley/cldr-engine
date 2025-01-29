import { DateTimePatternFieldType } from '@phensley/cldr-types';
import { CalendarsImpl, PrivateApiImpl } from '../../../src';
import { CalendarManager } from '../../../src/internals/calendars/manager';
import { INTERNALS, languageBundle } from '../../_helpers';
import { DateSkeleton } from '../../../src/internals/calendars/skeleton';

test('masked fovd', () => {
  const bundle = languageBundle('en');
  const internals = INTERNALS();
  const manager = new CalendarManager(bundle, internals);
  const patterns = manager.getCalendarPatterns('gregory');
  const _private = new PrivateApiImpl(bundle, internals);
  const api = new CalendarsImpl(bundle, internals, _private);
  let skeleton: DateSkeleton;
  let fovd: DateTimePatternFieldType;

  const date = api.newGregorianDate({ year: 2024, month: 3, day: 10, hour: 10, minute: 20, second: 30 });
  skeleton = patterns.parseSkeleton('yMMMd');

  fovd = manager.maskedFOVD(date, date.add({ hour: 3 }), skeleton);
  expect(fovd).toEqual('d'); // smallest field in skeleton

  fovd = manager.maskedFOVD(date, date.add({ day: 13 }), skeleton);
  expect(fovd).toEqual('d');

  fovd = manager.maskedFOVD(date, date.add({ day: 30 }), skeleton);
  expect(fovd).toEqual('M');

  fovd = manager.maskedFOVD(date, date.add({ day: 365 }), skeleton);
  expect(fovd).toEqual('y');

  // mask doesn't contain era, so choose year
  fovd = manager.maskedFOVD(date, date.subtract({ year: 2030 }), skeleton);
  expect(fovd).toEqual('y');

  skeleton = patterns.parseSkeleton('GyM');
  fovd = manager.maskedFOVD(date, date.subtract({ year: 2030 }), skeleton);
  expect(fovd).toEqual('G');

  skeleton = patterns.parseSkeleton('Km');

  // 12-hour cycle
  fovd = manager.maskedFOVD(date, date.add({ hour: 1 }), skeleton);
  expect(fovd).toEqual('h');

  fovd = manager.maskedFOVD(date, date.add({ second: 30 }), skeleton);
  expect(fovd).toEqual('m');

  skeleton = patterns.parseSkeleton('km');

  // 24-hour cycle
  fovd = manager.maskedFOVD(date, date.add({ hour: 1 }), skeleton);
  expect(fovd).toEqual('H');

  skeleton = patterns.parseSkeleton('Bj');

  // preferred hour cycle
  fovd = manager.maskedFOVD(date, date.add({ hour: 1 }), skeleton);
  expect(fovd).toEqual('h');

  fovd = manager.maskedFOVD(date, date.add({ hour: 7 }), skeleton);
  expect(fovd).toEqual('B');
});
