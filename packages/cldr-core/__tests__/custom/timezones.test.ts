import { buildConfig, calendarsApi } from '../_helpers';

test('custom calendars', () => {
  const cfg = buildConfig({ 'timezone-id': ['America/New_York'] });
  const api = calendarsApi('en', cfg);
  let s: string;

  // The 'timezone-id' setting is used to pull in the exemplar city for each zone.
  // All metazones still work, so we get full timezone names.

  const date = { date: new Date(2019, 5, 10, 12, 34, 56), zoneId: 'America/New_York' };

  s = api.formatDateRaw(date, { pattern: 'VV' });
  expect(s).toEqual('America/New_York');

  s = api.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('New York');

  date.zoneId = 'UTC';
  s = api.formatDateRaw(date, { pattern: 'VV' });
  expect(s).toEqual('Etc/UTC');

  s = api.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('');

  date.zoneId = 'Europe/Paris';
  s = api.formatDateRaw(date, { pattern: 'VV' });
  expect(s).toEqual('Europe/Paris');

  s = api.formatDateRaw(date, { pattern: 'VVV' });
  expect(s).toEqual('');
});
