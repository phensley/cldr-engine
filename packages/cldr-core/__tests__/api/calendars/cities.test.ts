import { calendarsApi } from '../../_helpers';

test('timezone exemplar cities', () => {
  const utc = 'Etc/UTC';
  const unk = 'Factory';
  const newyork = 'America/New_York';
  let tz: any;

  const find = (lang: string, id: string) =>
    calendarsApi(lang).timeZoneInfo(id);

  tz = find('en', newyork);
  expect(tz.id).toEqual(newyork);
  expect(tz.city).toEqual({ name: 'New York' });

  tz = find('en', utc);
  expect(tz.id).toEqual(utc);
  expect(tz.city).toEqual({ name: 'Unknown City' });

  tz = find('en', unk);
  expect(tz.id).toEqual(unk);
  expect(tz.city).toEqual({ name: 'Unknown City' });

  tz = find('es', newyork);
  expect(tz.id).toEqual(newyork);
  expect(tz.city).toEqual({ name: 'Nueva York' });

  tz = find('es', utc);
  expect(tz.id).toEqual(utc);
  expect(tz.city).toEqual({ name: 'ciudad desconocida' });

  tz = find('es', unk);
  expect(tz.id).toEqual(unk);
  expect(tz.city).toEqual({ name: 'ciudad desconocida' });
});
