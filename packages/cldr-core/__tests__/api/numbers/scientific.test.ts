import { numbersApi } from '../../_helpers';
import { DecimalFormatOptions } from '../../../src';

test('decimal scientific', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('5', { style: 'scientific' });
  expect(s).toEqual('5');

  s = api.formatDecimal('5', { style: 'scientific', minimumSignificantDigits: 2 });
  expect(s).toEqual('5.0');

  s = api.formatDecimal('123.456', { style: 'scientific', minimumSignificantDigits: 3 });
  expect(s).toEqual('1.23E+2');

  s = api.formatDecimal('21', { style: 'scientific', minimumSignificantDigits: 2 });
  expect(s).toEqual('2.1E+1');

  s = api.formatDecimal('1578000', { style: 'scientific', minimumSignificantDigits: 2 });
  expect(s).toEqual('1.6E+6');

  s = api.formatDecimal('-1.234567', { style: 'scientific', minimumSignificantDigits: 4 });
  expect(s).toEqual('-1.235');

  s = api.formatDecimal('-0.00012345', { style: 'scientific', minimumSignificantDigits: 3 });
  expect(s).toEqual('-1.23E-4');

  // minimum integer digits
  let opts: DecimalFormatOptions = { style: 'scientific', minimumSignificantDigits: 5 };
  s = api.formatDecimal('1.2345', opts);
  expect(s).toEqual('1.2345');

  opts.minimumIntegerDigits = 2;
  s = api.formatDecimal('1.2345', opts);
  expect(s).toEqual('12.345E-1');

  opts.minimumIntegerDigits = 3;
  s = api.formatDecimal('1.2345', opts);
  expect(s).toEqual('123.45E-2');

  opts.minimumIntegerDigits = 4;
  s = api.formatDecimal('1.2345', opts);
  expect(s).toEqual('1234.5E-3');

  opts.minimumIntegerDigits = 5;
  s = api.formatDecimal('1.2345', opts);
  expect(s).toEqual('12345E-4');

  opts.minimumIntegerDigits = 6;
  s = api.formatDecimal('1.2345', opts);
  expect(s).toEqual('123450E-5');

  // specify fractions + scientific
  opts = { style: 'scientific', minimumFractionDigits: 4 };
  s = api.formatDecimal('12345', opts);
  expect(s).toEqual('1.2345E+4');

  opts = { style: 'scientific', minimumFractionDigits: 3 };
  s = api.formatDecimal('12.3456', opts);
  expect(s).toEqual('1.235E+1');
});

test('decimal scientific negative zero', () => {
  const api = numbersApi('en');
  let s: string;

  s = api.formatDecimal('-0', { style: 'scientific' });
  expect(s).toEqual('-0');

  s = api.formatDecimal('-0', { style: 'scientific', negativeZero: false });
  expect(s).toEqual('0');
});
