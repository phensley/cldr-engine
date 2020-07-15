import { CalendarsImpl } from '../../../src/api/calendars';
import { calendarsApi } from '../../_helpers';

test('timezone exemplar cities', () => {
  let api: CalendarsImpl;
  const utc = 'Etc/UTC';
  const unk = 'Factory';
  const invalid = 'Invalid';
  const newyork = 'America/New_York';
  let tz: any;

  api = calendarsApi('en');

  tz = api.timeZoneInfo(newyork);
  expect(tz.id).toEqual(newyork);
  expect(tz.city).toEqual({ name: 'New York' });
  expect(tz.metazone).toEqual('America_Eastern');
  expect(tz.latitude).toEqual(40.714167);
  expect(tz.longitude).toEqual(-74.006389);
  expect(tz.countries).toEqual(['US']);
  expect(tz.stdoffset).toEqual(-18000000);

  tz = api.timeZoneInfo(utc);
  expect(tz.id).toEqual(utc);
  expect(tz.city).toEqual({ name: 'Unknown City' });
  expect(tz.metazone).toEqual('GMT');
  expect(tz.latitude).toEqual(0);
  expect(tz.longitude).toEqual(0);
  expect(tz.countries).toEqual([]);
  expect(tz.stdoffset).toEqual(0);

  tz = api.timeZoneInfo(unk);
  expect(tz.id).toEqual(unk);
  expect(tz.city).toEqual({ name: 'Unknown City' });

  tz = api.timeZoneInfo(invalid);
  expect(tz.id).toEqual(unk);
  expect(tz.city).toEqual({ name: 'Unknown City' });

  api = calendarsApi('es');

  tz = api.timeZoneInfo(newyork);
  expect(tz.id).toEqual(newyork);
  expect(tz.city).toEqual({ name: 'Nueva York' });

  tz = api.timeZoneInfo(utc);
  expect(tz.id).toEqual(utc);
  expect(tz.city).toEqual({ name: 'ciudad desconocida' });

  tz = api.timeZoneInfo(unk);
  expect(tz.id).toEqual(unk);
  expect(tz.city).toEqual({ name: 'ciudad desconocida' });
});
