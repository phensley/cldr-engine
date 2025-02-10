import { calendarsApi } from '../../_helpers';
import { Calendars, TimeData } from '../../../src';

test('time data', () => {
  let api: Calendars = calendarsApi('en-US');
  let t: TimeData;

  const date = {
    date: 1579633019000,
    zoneId: 'America/New_York',
  };

  t = api.timeData();
  expect(t.preferred).toEqual('h');
  expect(t.allowed).toEqual(['h', 'hb', 'H', 'hB']);

  expect(api.formatDate(date, { skeleton: t.preferred })).toEqual('1 PM');
  expect(t.allowed.map((skeleton) => api.formatDate(date, { skeleton }))).toEqual([
    '1 PM',
    '1 PM',
    '13',
    '1 in the afternoon',
  ]);

  api = calendarsApi('es-ES');
  t = api.timeData();
  expect(t.preferred).toEqual('H');
  expect(t.allowed).toEqual(['H', 'h', 'hB', 'hb']);

  expect(api.formatDate(date, { skeleton: t.preferred })).toEqual('13');
  expect(t.allowed.map((skeleton) => api.formatDate(date, { skeleton }))).toEqual([
    '13',
    '1 p. m.',
    '1 de la tarde',
    '1 p. m.',
  ]);

  t = calendarsApi('es-419').timeData();
  expect(t.preferred).toEqual('h');
  expect(t.allowed).toEqual(['h', 'H', 'hB', 'hb']);

  t = calendarsApi('und-AR').timeData();
  expect(t.preferred).toEqual('h');
  expect(t.allowed).toEqual(['h', 'H', 'hB', 'hb']);

  t = calendarsApi('es-AR').timeData();
  expect(t.preferred).toEqual('h');
  expect(t.allowed).toEqual(['h', 'H', 'hB', 'hb']);

  t = calendarsApi('es-BR').timeData();
  expect(t.preferred).toEqual('H');
  expect(t.allowed).toEqual(['H', 'h', 'hB', 'hb']);

  t = calendarsApi('und-BR').timeData();
  expect(t.preferred).toEqual('H');
  expect(t.allowed).toEqual(['H', 'hB']);
});
