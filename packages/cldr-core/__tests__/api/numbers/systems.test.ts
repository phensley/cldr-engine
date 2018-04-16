import { languageBundle} from '../../_helpers';
import { buildSchema } from '../../../src/schema';

import {
  Bundle,
  CurrencyFormatOptions,
  DecimalFormatOptions,
  DecimalFormatStyleType,
  InternalsImpl,
  NumbersImpl,
  NumberSystemType,
  PrivateApiImpl
} from '../../../src';

const INTERNALS = new InternalsImpl();

const numbersApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new NumbersImpl(bundle, INTERNALS, new PrivateApiImpl(bundle, INTERNALS));
};

test('numbering systems', () => {
  let api = numbersApi('th');
  let s: string;

  s = api.formatDecimal('12345.678', { nu: 'thai', group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('๑๒,๓๔๕.๗');
  s = api.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('12,345.7');

  api = numbersApi('zh');
  s = api.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1, nu: 'native' });
  expect(s).toEqual('一二,三四五.七');
  s = api.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('12,345.7');

  api = numbersApi('ar');
  s = api.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('١٢٬٣٤٥٫٧');
  s = api.formatDecimal('12345.678', { nu: 'native', group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('١٢٬٣٤٥٫٧');
  s = api.formatDecimal('12345.678', { nu: 'latn', group: true, maximumFractionDigits: 1 });
  expect(s).toEqual('12,345.7');

  // Invalid number system names will use the default system.
  s = api.formatDecimal('12345.678', { nu: 'xxx' as NumberSystemType });
  expect(s).toEqual('١٢٣٤٥٫٦٧٨');
});
