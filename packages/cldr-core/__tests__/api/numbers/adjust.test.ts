import { numbersApi } from '../../_helpers';
import { DecimalAdjustOptions } from '../../../src';

const API = numbersApi('en');

const adjust = (s: string, opts?: DecimalAdjustOptions): string =>
  API.adjustDecimal(s, opts).toString();

test('adjust fractions', () => {
  let s: string;

  s = adjust('1.0');
  expect(s).toEqual('1');

  s = adjust('1.0', { minimumFractionDigits: 1 });
  expect(s).toEqual('1.0');

  s = adjust('1.0', { maximumFractionDigits: 1 });
  expect(s).toEqual('1');

  s = adjust('1.1', { maximumFractionDigits: 1 });
  expect(s).toEqual('1.1');

  s = adjust('1.1', { maximumFractionDigits: 0 });
  expect(s).toEqual('1');

  s = adjust('1.5', { maximumFractionDigits: 0 });
  expect(s).toEqual('2');

  s = adjust('1.5', { maximumFractionDigits: 0, round: 'down' });
  expect(s).toEqual('1');
});

test('adjust significant', () => {
  let s: string;

  s = adjust('1.00', { minimumSignificantDigits: 1 });
  expect(s).toEqual('1');

  s = adjust('1.00', { minimumSignificantDigits: 2 });
  expect(s).toEqual('1.0');

  s = adjust('1.00', { minimumSignificantDigits: 3 });
  expect(s).toEqual('1.00');

  s = adjust('1.00', { minimumSignificantDigits: 4 });
  expect(s).toEqual('1.000');

  // minimum overrides maximum
  s = adjust('1.00', { minimumSignificantDigits: 4, maximumSignificantDigits: 1 });
  expect(s).toEqual('1.000');

  s = adjust('1.00', { minimumSignificantDigits: 4, maximumSignificantDigits: 5 });
  expect(s).toEqual('1.000');

  s = adjust('1.00006', { minimumSignificantDigits: 4, maximumSignificantDigits: 5 });
  expect(s).toEqual('1.0001');
});

test('adjust significant', () => {
  let s: string;

  s = adjust('1.05');
  expect(s).toEqual('1');

  s = adjust('1.05', { maximumSignificantDigits: 2 });
  expect(s).toEqual('1.0');

  s = adjust('1.06', { maximumSignificantDigits: 2 });
  expect(s).toEqual('1.1');

  s = adjust('1.05', { maximumSignificantDigits: 2, round: 'ceiling' });
  expect(s).toEqual('1.1');

  s = adjust('1.05', { maximumSignificantDigits: 2, round: 'down' });
  expect(s).toEqual('1.0');

  s = adjust('1.05', { maximumSignificantDigits: 3 });
  expect(s).toEqual('1.05');

  s = adjust('1.05', { maximumSignificantDigits: 4 });
  expect(s).toEqual('1.050');
});
