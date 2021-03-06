import { calendarsApi } from '../../_helpers';

test('context transforms', () => {
  const date = { date: 123456666666, zoneId: 'America/New_York' };
  let s: string;

  let api = calendarsApi('es');

  s = api.formatDate(date, { date: 'full' });
  expect(s).toEqual('jueves, 29 de noviembre de 1973');

  s = api.formatDate(date, { date: 'full', context: 'standalone' });
  expect(s).toEqual('Jueves, 29 de noviembre de 1973');

  s = api.formatDate(date, { date: 'full', context: 'begin-sentence' });
  expect(s).toEqual('Jueves, 29 de noviembre de 1973');

  s = api.formatRelativeTimeField(2, 'day');
  expect(s).toEqual('pasado mañana');

  s = api.formatRelativeTimeField(2, 'day', { context: 'begin-sentence' });
  expect(s).toEqual('Pasado mañana');

  s = api.formatDate(date, { skeleton: 'LLLL' });
  expect(s).toEqual('noviembre');

  s = api.formatDate(date, { skeleton: 'LLLL', context: 'standalone' });
  expect(s).toEqual('Noviembre');

  api = calendarsApi('en');

  s = api.formatRelativeTimeField(12, 'day');
  expect(s).toEqual('in 12 days');

  s = api.formatRelativeTimeField(12, 'day', { context: 'begin-sentence' });
  expect(s).toEqual('In 12 days');

  s = api.formatDate(date, { skeleton: 'MMM' });
  expect(s).toEqual('Nov');
});
