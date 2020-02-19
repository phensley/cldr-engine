import { Decimal, DecimalConstants } from '@phensley/decimal';
import { DefaultMessageArgConverter, MessageArg } from '../src';

const CONVERTER = new DefaultMessageArgConverter();

const asstring = (arg: MessageArg | undefined) => CONVERTER.asString(arg);
const asdecimal = (arg: MessageArg | undefined) => CONVERTER.asDecimal(arg);

test('strings', () => {
  expect(asstring(false)).toEqual('false');
  expect(asstring(true)).toEqual('true');
  expect(asstring(1.2)).toEqual('1.2');
  expect(asstring(new Decimal('3.14159'))).toEqual('3.14159');
  expect(asstring({ foo: 'foo', bar: 'bar' })).toEqual('');
});

test('decimals', () => {
  expect(asdecimal(false)).toEqual(new Decimal(0));
  expect(asdecimal(true)).toEqual(new Decimal(1));
  expect(asdecimal(1.4)).toEqual(new Decimal('1.4'));
  expect(asdecimal('1.4')).toEqual(new Decimal('1.4'));
  expect(asdecimal(new Decimal('3.14159'))).toEqual(new Decimal('3.14159'));
  expect(asdecimal('infinity')).toEqual(DecimalConstants.POSITIVE_INFINITY);
  expect(asdecimal('abc')).toEqual(DecimalConstants.NAN);
  expect(asdecimal({ foo: 'foo', bar: 'bar' })).toEqual(DecimalConstants.NAN);
  expect(asdecimal(new Date())).toEqual(DecimalConstants.NAN);
});
