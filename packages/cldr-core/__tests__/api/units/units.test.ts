import { AR, EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Bundle, InternalsImpl, PrivateApiImpl, Quantity, UnitsImpl } from '../../../src';
import { Part } from '../../../src/types';

const INTERNALS = new InternalsImpl();

const unitsApi = (bundle: Bundle) =>
  new UnitsImpl(bundle, INTERNALS, new PrivateApiImpl(bundle, INTERNALS));

test('display name', () => {
  const api = unitsApi(EN);

  expect(api.getUnitDisplayName('g-force')).toEqual('g-force');
  expect(api.getUnitDisplayName('meter-per-second')).toEqual('meters per second');
});

test('significant', () => {
  const api = unitsApi(EN);
  let s: string;

  s = api.formatQuantity({ value: '12345.6789', unit: 'mile' }, { maximumSignificantDigits: 3 });
  expect(s).toEqual('12300 miles');
});

test('number systems', () => {
  let api = unitsApi(AR);
  let s: string;

  s = api.formatQuantity({ value: '123', unit: 'meter' });
  expect(s).toEqual('١٢٣ مترًا');

  s = api.formatQuantity({ value: '123', unit: 'meter' }, { nu: 'latn' });
  expect(s).toEqual('123 مترًا');

  api = unitsApi(ZH);

  s = api.formatQuantity({ value: '123', unit: 'meter' }, { nu: 'native' });
  expect(s).toEqual('一二三米');

  s = api.formatQuantity({ value: '12345', unit: 'kilometer' }, { group: true, nu: 'native' });
  expect(s).toEqual('一二,三四五公里');

  s = api.formatQuantity({ value: '123', unit: 'meter' });
  expect(s).toEqual('123米');

  s = api.formatQuantity({ value: '123', unit: 'meter' }, { nu: 'latn' });
  expect(s).toEqual('123米');

  s = api.formatQuantity({ value: '12345', unit: 'kilometer' }, { group: true, nu: 'latn' });
  expect(s).toEqual('12,345公里');
});

test('format string', () => {
  const api = unitsApi(EN);
  let s: string;

  s = api.formatQuantity({ value: '123', unit: 'meter'});
  expect(s).toEqual('123 meters');

  s = api.formatQuantity({ value: '12345', unit: 'meter'}, { style: 'long', minimumFractionDigits: 1 });
  expect(s).toEqual('12.3 thousand meters');

  s = api.formatQuantity({ value: '1', unit: 'pound'}, { style: 'long' });
  expect(s).toEqual('1 pound');

  s = api.formatQuantity({ value: '1', unit: 'pound'}, { style: 'long', minimumFractionDigits: 1 });
  expect(s).toEqual('1.0 pounds');

  s = api.formatQuantity({ value: '12345000', unit: 'pound'},
    { length: 'short', style: 'short', minimumFractionDigits: 1 });
  expect(s).toEqual('12.3M lb');
});

test('unit lengths', () => {
  const api = unitsApi(EN);
  let s: string;

  const q: Quantity = { value: '1', unit: 'meter' };

  s = api.formatQuantity(q);
  expect(s).toEqual('1 meter');

  s = api.formatQuantity(q, { length: 'long' });
  expect(s).toEqual('1 meter');

  s = api.formatQuantity(q, { length: 'short' });
  expect(s).toEqual('1 m');

  s = api.formatQuantity(q, { length: 'narrow' });
  expect(s).toEqual('1m');
});

test('format parts', () => {
  const api = unitsApi(EN);
  let p: Part[];

  p = api.formatQuantityToParts({ value: '123', unit: 'meter' });
  expect(p).toEqual([
    { type: 'digits', value: '123'},
    { type: 'literal', value: ' meters'}
  ]);

  p = api.formatQuantityToParts({ value: '12345000', unit: 'pound'},
    { length: 'short', style: 'short', minimumFractionDigits: 1 });
  expect(p).toEqual([
    { type: 'digits', value: '12'},
    { type: 'decimal', value: '.'},
    { type: 'digits', value: '3'},
    { type: 'literal', value: 'M'},
    { type: 'literal', value: ' lb'}
  ]);
});

test('format sequence string', () => {
  const api = unitsApi(EN);
  let s: string;
  let u: Quantity[];

  u = [{ value: '123', unit: 'meter'}, { value: '17.2', unit: 'centimeter' }];
  s = api.formatQuantitySequence(u);
  expect(s).toEqual('123 meters 17.2 centimeters');
});

test('format sequence parts', () => {
  const api = unitsApi(EN);
  let p: Part[];
  let u: Quantity[];

  u = [{ value: '123', unit: 'meter'}, { value: '17.2', unit: 'centimeter' }];
  p = api.formatQuantitySequenceToParts(u);
  expect(p).toEqual([
    { type: 'digits', value: '123' },
    { type: 'literal', value: ' meters'},
    { type: 'literal', value: ' '},
    { type: 'digits', value: '17' },
    { type: 'decimal', value: '.'},
    { type: 'digits', value: '2'},
    { type: 'literal', value: ' centimeters'}
  ]);
});
