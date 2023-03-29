import { buildConfig, numbersApi } from '../_helpers';

test('custom currencies', () => {
  const cfg = buildConfig({ 'number-system-name': [], 'currency-id': ['USD', 'JPY'] });
  const api = numbersApi('en', cfg);
  let s: string;

  s = api.formatCurrency('1234.56789', 'USD');
  expect(s).toEqual('$1,234.57');

  s = api.formatCurrency('1234.56789', 'JPY');
  expect(s).toEqual('¥1,235');

  // No way of knowing the currency symbol to use. CLDR now defaults
  // to using the code when the symbol is undefined.
  s = api.formatCurrency('1234.56789', 'GBP');
  expect(s).toEqual(' 1,234.57');
});
