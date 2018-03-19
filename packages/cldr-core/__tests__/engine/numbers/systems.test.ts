import { AR, EN, TH, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';

import {
  CurrencyFormatOptions,
  DecimalFormatOptions,
  DecimalFormatStyleType,
  NumbersEngine,
  NumbersInternal,
  NumberSystemType,
  WrapperInternal
} from '../../../src/engine';

const INTERNAL = new NumbersInternal(buildSchema(), new WrapperInternal());

test('numbering systems', () => {
  let actual: string;
  let engine = new NumbersEngine(INTERNAL, TH);

  actual = engine.formatDecimal('12345.678', { nu: 'thai', group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('๑๒,๓๔๕.๗');
  actual = engine.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('12,345.7');

  engine = new NumbersEngine(INTERNAL, ZH);
  actual = engine.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1, nu: 'native' });
  expect(actual).toEqual('一二,三四五.七');
  actual = engine.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('12,345.7');

  engine = new NumbersEngine(INTERNAL, AR);
  actual = engine.formatDecimal('12345.678', { group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('١٢٬٣٤٥٫٧');
  actual = engine.formatDecimal('12345.678', { nu: 'native', group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('١٢٬٣٤٥٫٧');
  actual = engine.formatDecimal('12345.678', { nu: 'latn', group: true, maximumFractionDigits: 1 });
  expect(actual).toEqual('12,345.7');

  // Invalid number system names will use the default system.
  actual = engine.formatDecimal('12345.678', { nu: 'xxx' as NumberSystemType });
  expect(actual).toEqual('١٢٣٤٥٫٦٧٨');
});
