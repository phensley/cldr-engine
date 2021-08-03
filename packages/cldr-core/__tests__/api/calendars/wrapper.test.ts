import { calendarsApi } from '../../_helpers';
import { CalendarsImpl, Part } from '../../../src';

test('date wrapper string', () => {
  let api: CalendarsImpl;

  let s: string;

  api = calendarsApi('en');

  s = api.formatDateWrapper('DATE', 'TIME');
  expect(s).toEqual('DATE, TIME');

  s = api.formatDateWrapper('DATE', 'TIME', { width: 'full' });
  expect(s).toEqual('DATE at TIME');

  s = api.formatDateWrapper('DATE', 'TIME', { ca: 'persian' });
  expect(s).toEqual('DATE, TIME');

  api = calendarsApi('es-HN');

  s = api.formatDateWrapper('DATE', 'TIME', { width: 'full' });
  expect(s).toEqual('DATE, TIME');

  api = calendarsApi('fr-LU');

  s = api.formatDateWrapper('DATE', 'TIME', { width: 'full' });
  expect(s).toEqual('DATE à TIME');

  api = calendarsApi('vi');

  s = api.formatDateWrapper('DATE', 'TIME', { width: 'short' });
  expect(s).toEqual('TIME, DATE');

  s = api.formatDateWrapper('DATE', 'TIME', { width: 'full' });
  expect(s).toEqual('TIME DATE');

  api = calendarsApi('fa');

  s = api.formatDateWrapper('DATE', 'TIME', { ca: 'persian' });
  expect(s).toEqual('DATE،\u200f TIME');

  s = api.formatDateWrapper('DATE', 'TIME', { ca: 'persian', width: 'full' });
  expect(s).toEqual('DATE، ساعت TIME');
});

test('date wrapper parts', () => {
  let api: CalendarsImpl;

  let p: Part[];

  api = calendarsApi('en');

  p = api.formatDateWrapperToParts([{ type: 'date', value: 'DATE' }], [{ type: 'time', value: 'TIME' }]);
  expect(p).toEqual([
    { type: 'date', value: 'DATE' },
    { type: 'literal', value: ', ' },
    { type: 'time', value: 'TIME' },
  ]);

  p = api.formatDateWrapperToParts([{ type: 'date', value: 'DATE' }], [{ type: 'time', value: 'TIME' }], {
    width: 'full',
  });
  expect(p).toEqual([
    { type: 'date', value: 'DATE' },
    { type: 'literal', value: ' at ' },
    { type: 'time', value: 'TIME' },
  ]);
});
