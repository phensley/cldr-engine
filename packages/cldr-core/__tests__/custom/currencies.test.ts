import { buildConfig, numbersApi } from '../_helpers';

test('custom currencies', () => {
  const cfg = buildConfig({ 'number-system-name': [], 'currency-id': ['USD', 'JPY'] });
  const api = numbersApi('en', cfg);
  let s: string;

  s = api.formatCurrency('1234.56789', 'USD');
  expect(s).toEqual('$1,234.57');

  s = api.formatCurrency('1234.56789', 'JPY');
  expect(s).toEqual('¥1,235');

  // no way of knowing the currency symbol to use.
  // TODO: should probably fall back to 'code' style
  s = api.formatCurrency('1234.56789', 'GBP');
  expect(s).toEqual(' 1,234.57');
});
