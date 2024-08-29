import { getCLDR } from './_helpers';

test('units', () => {
  const framework = getCLDR();
  const api = framework.get('ja');
  let s: string;

  s = api.Units.formatQuantity({ value: 5, unit: 'hour' }, { length: 'long' });
  expect(s).toEqual('5時間');
});
