import { getCLDR } from './_helpers';

test('framework', () => {
  const framework = getCLDR();
  const api = framework.get('en');
  expect(api.Numbers.formatDecimal('12345.6789')).toEqual('12,345.679');
});
