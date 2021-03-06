import { numbersApi } from '../../_helpers';
import { CurrencyFormatOptions, DecimalFormatOptions } from '../../../src';

test('divisor magnitudes', () => {
  const api = numbersApi('en');
  let opts: DecimalFormatOptions;
  let s: string;

  opts = { style: 'short', divisor: 100 };
  s = api.formatDecimal(5000, opts);
  expect(s).toEqual('5,000');

  opts.divisor = 1000;
  s = api.formatDecimal(5000, opts);
  expect(s).toEqual('5K');

  opts.divisor = 10000;
  s = api.formatDecimal(5000, opts);
  expect(s).toEqual('5K');

  opts.divisor = 100000;
  s = api.formatDecimal(5000, opts);
  expect(s).toEqual('5K');

  opts.divisor = 1000000;
  s = api.formatDecimal(5000, opts);
  expect(s).toEqual('0.005M');

  opts.divisor = 10000000;
  s = api.formatDecimal(5000, opts);
  expect(s).toEqual('0.005M');
});

test('currency short divisors', () => {
  const api = numbersApi('en');
  let opts: CurrencyFormatOptions;
  let s: string;

  // divisor isn't large enough to match a compact pattern, so
  // we get the standard.
  opts = { style: 'short', divisor: 10 };

  s = api.formatCurrency('100', 'USD', opts);
  expect(s).toEqual('$100');

  opts = { style: 'short', divisor: 1000 };

  s = api.formatCurrency('100', 'USD', opts);
  expect(s).toEqual('$0.1K');

  s = api.formatCurrency('1234', 'USD', opts);
  expect(s).toEqual('$1.2K');

  s = api.formatCurrency('1234567', 'USD', opts);
  expect(s).toEqual('$1,235K');

  s = api.formatCurrency('123456789', 'USD', opts);
  expect(s).toEqual('$123,457K');

  opts.minimumFractionDigits = 2;
  s = api.formatCurrency('123456789', 'USD', opts);
  expect(s).toEqual('$123,456.79K');

  opts.minimumIntegerDigits = 3;
  s = api.formatCurrency('100', 'USD', opts);
  expect(s).toEqual('$000.10K');

  opts.minimumIntegerDigits = 0;
  s = api.formatCurrency('100', 'USD', opts);
  expect(s).toEqual('$.10K');

  opts.minimumIntegerDigits = -1;
  s = api.formatCurrency('100', 'USD', opts);
  expect(s).toEqual('$0.10K');
});

test('decimal long divisors', () => {
  const api = numbersApi('en');
  let opts: DecimalFormatOptions;
  let s: string;

  opts = { style: 'long', divisor: 10 };

  s = api.formatDecimal('100', opts);
  expect(s).toEqual('100');

  opts = { style: 'long', divisor: 1000 };

  s = api.formatDecimal('100', opts);
  expect(s).toEqual('0.1 thousand');

  s = api.formatDecimal('1234', opts);
  expect(s).toEqual('1.2 thousand');

  s = api.formatDecimal('12345', opts);
  expect(s).toEqual('12 thousand');

  s = api.formatDecimal('123456', opts);
  expect(s).toEqual('123 thousand');

  s = api.formatDecimal('1234567', opts);
  expect(s).toEqual('1,235 thousand');

  s = api.formatDecimal('123456789', opts);
  expect(s).toEqual('123,457 thousand');
});

test('significant digits', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('1256', { style: 'short', minimumSignificantDigits: 1 });
  expect(s).toEqual('1.3K');

  s = api.formatDecimal('1256', { style: 'short', minimumSignificantDigits: 2 });
  expect(s).toEqual('1.3K');

  s = api.formatDecimal('1256', { style: 'short', minimumSignificantDigits: 3 });
  expect(s).toEqual('1.26K');

  s = api.formatDecimal('12356', { style: 'short', minimumSignificantDigits: 1 });
  expect(s).toEqual('12K');

  s = api.formatDecimal('12356', { style: 'short', minimumSignificantDigits: 2 });
  expect(s).toEqual('12K');

  s = api.formatDecimal('12356', { style: 'short', minimumSignificantDigits: 3 });
  expect(s).toEqual('12.4K');

  s = api.formatDecimal('123456', { style: 'short', minimumSignificantDigits: 1 });
  expect(s).toEqual('123K');

  s = api.formatDecimal('123456', { style: 'short', minimumSignificantDigits: 2 });
  expect(s).toEqual('123K');

  s = api.formatDecimal('123456', { style: 'short', minimumSignificantDigits: 3 });
  expect(s).toEqual('123K');

  s = api.formatDecimal('123456', { style: 'short', minimumSignificantDigits: 4 });
  expect(s).toEqual('123.5K');
});
