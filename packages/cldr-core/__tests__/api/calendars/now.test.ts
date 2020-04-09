import { calendarsApi } from '../../_helpers';
import { CalendarsImpl, CalendarDate } from '../../../src';

test('now', () => {
  const zone = 'America/New_York';
  let api: CalendarsImpl;
  let d: CalendarDate;

  api = calendarsApi('en');

  d = api.now();
  expect(d.toString()).toContain('Gregorian');
  expect(d.toString()).toContain('Etc/UTC');

  d = api.now(zone);
  expect(d.toString()).toContain('Gregorian');
  expect(d.toString()).toContain(zone);

  d = api.nowGregorian();
  expect(d.toString()).toContain('Gregorian');
  expect(d.toString()).toContain('Etc/UTC');

  d = api.nowGregorian(zone);
  expect(d.toString()).toContain('Gregorian');
  expect(d.toString()).toContain(zone);

  d = api.nowBuddhist();
  expect(d.toString()).toContain('Buddhist');
  expect(d.toString()).toContain('Etc/UTC');

  d = api.nowBuddhist(zone);
  expect(d.toString()).toContain('Buddhist');
  expect(d.toString()).toContain(zone);

  d = api.nowISO8601();
  expect(d.toString()).toContain('ISO8601');
  expect(d.toString()).toContain('Etc/UTC');

  d = api.nowISO8601(zone);
  expect(d.toString()).toContain('ISO8601');
  expect(d.toString()).toContain(zone);

  d = api.nowJapanese();
  expect(d.toString()).toContain('Japanese');
  expect(d.toString()).toContain('Etc/UTC');

  d = api.nowJapanese(zone);
  expect(d.toString()).toContain('Japanese');
  expect(d.toString()).toContain(zone);

  d = api.nowPersian();
  expect(d.toString()).toContain('Persian');
  expect(d.toString()).toContain('Etc/UTC');

  d = api.nowPersian(zone);
  expect(d.toString()).toContain('Persian');
  expect(d.toString()).toContain(zone);
});
