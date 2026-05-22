import { calendarsApi } from '../../_helpers';

test('best-fit cache is keyed by plural category', () => {
  const api = calendarsApi('fil');
  const jan1 = { date: Date.UTC(2024, 0, 1, 12), zoneId: 'UTC' };   // yw plural 'one'
  const jan22 = { date: Date.UTC(2024, 0, 22, 12), zoneId: 'UTC' }; // yw plural 'other'
  expect(api.formatDate(jan1, { skeleton: 'yw' })).toEqual('ika-1 linggo ng 2024');
  expect(api.formatDate(jan22, { skeleton: 'yw' })).toEqual('linggo 4 ng 2024');
});

test('best-fit cache is keyed by numbering system', () => {
  const api = calendarsApi('ar');
  const d = { date: Date.UTC(2024, 6, 15, 3, 0, 25, 123), zoneId: 'UTC' };
  expect(api.formatDate(d, { skeleton: 'hmsS', nu: 'latn' })).toEqual('3:00:25.1 ص');
  expect(api.formatDate(d, { skeleton: 'hmsS', nu: 'arab' })).toEqual('٣:٠٠:٢٥٫١ ص');
});
