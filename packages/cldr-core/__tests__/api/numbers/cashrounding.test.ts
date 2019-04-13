import { numbersApi } from '../../_helpers';

test('cash rounding DKK', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('12345.67', 'DKK');
  expect(s).toEqual('DKK 12,345.67');

  s = api.formatCurrency('12345.67', 'DKK', { cash: true });
  expect(s).toEqual('DKK 12,345.50');

  s = api.formatCurrency('12345.76', 'DKK', { cash: true });
  expect(s).toEqual('DKK 12,346.00');

  s = api.formatCurrency('12345.99', 'DKK', { cash: true });
  expect(s).toEqual('DKK 12,346.00');

  s = api.formatCurrency('12345.67', 'DKK', { cash: true, round: 'down' });
  expect(s).toEqual('DKK 12,345.50');

  s = api.formatCurrency('12345.76', 'DKK', { cash: true, round: 'down' });
  expect(s).toEqual('DKK 12,345.50');

  s = api.formatCurrency('12345.99', 'DKK', { cash: true, round: 'down' });
  expect(s).toEqual('DKK 12,345.50');
});

test('cash rounding CAD', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatCurrency('12345.67', 'CAD');
  expect(s).toEqual('CA$12,345.67');

  s = api.formatCurrency('12345.67', 'CAD', { cash: true });
  expect(s).toEqual('CA$12,345.65');

  s = api.formatCurrency('12345.76', 'CAD', { cash: true });
  expect(s).toEqual('CA$12,345.75');

  s = api.formatCurrency('12345.99', 'CAD', { cash: true });
  expect(s).toEqual('CA$12,346.00');

  s = api.formatCurrency('12345.67', 'CAD', { cash: true, round: 'down' });
  expect(s).toEqual('CA$12,345.65');

  s = api.formatCurrency('12345.76', 'CAD', { cash: true, round: 'down' });
  expect(s).toEqual('CA$12,345.75');

  s = api.formatCurrency('12345.99', 'CAD', { cash: true, round: 'down' });
  expect(s).toEqual('CA$12,345.95');
});
