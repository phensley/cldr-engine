import { languageBundle } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Bundle, InternalsImpl, PrivateApiImpl, Quantity, UnitsImpl } from '../../../src';
import { Part } from '../../../src/types';

const INTERNALS = new InternalsImpl();

const unitsApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new UnitsImpl(bundle, INTERNALS, new PrivateApiImpl(bundle, INTERNALS));
};

test('display name', () => {
  const api = unitsApi('en');

  expect(api.getUnitDisplayName('g-force')).toEqual('g-force');
  expect(api.getUnitDisplayName('meter-per-second')).toEqual('meters per second');
});

test('significant', () => {
  const api = unitsApi('en');
  let s: string;

  s = api.formatQuantity({ value: '12345.6789', unit: 'mile' }, { maximumSignificantDigits: 3 });
  expect(s).toEqual('12300 miles');
});

test('number systems', () => {
  let api = unitsApi('ar');
  let s: string;

  s = api.formatQuantity({ value: '123', unit: 'meter' });
  expect(s).toEqual('١٢٣ مترًا');

  s = api.formatQuantity({ value: '123', unit: 'meter' }, { nu: 'latn' });
  expect(s).toEqual('123 مترًا');

  api = unitsApi('zh');

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
  const api = unitsApi('en');
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
  const api = unitsApi('en');
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

test('no unit', () => {
  const api = unitsApi('en');
  let s: string;
  let q: Quantity;

  q = { value: '1' };
  s = api.formatQuantity(q, { length: 'long', minimumFractionDigits: 2 });
  expect(s).toEqual('1.00');
});

test('format parts', () => {
  const api = unitsApi('en');
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
  const api = unitsApi('en');
  let s: string;
  let u: Quantity[];

  u = [{ value: '123', unit: 'meter'}, { value: '17.2', unit: 'centimeter' }];
  s = api.formatQuantitySequence(u);
  expect(s).toEqual('123 meters, 17.2 centimeters');

  s = api.formatQuantitySequence(u, { length: 'short' });
  expect(s).toEqual('123 m, 17.2 cm');

  s = api.formatQuantitySequence(u, { length: 'narrow' });
  expect(s).toEqual('123m 17.2cm');

  u = [
    { value: '312', unit: 'degree' },
    { value: '1', unit: 'arc-minute' },
    { value: '17', unit: 'arc-second' }
  ];

  s = api.formatQuantitySequence(u);
  expect(s).toEqual('312 degrees, 1 arcminute, 17 arcseconds');

  s = api.formatQuantitySequence(u, { length: 'short' });
  expect(s).toEqual('312 deg, 1 arcmin, 17 arcsecs');

  s = api.formatQuantitySequence(u, { length: 'narrow' });
  expect(s).toEqual('312° 1′ 17″');

  u = [{ value: '312', unit: 'foot' }, { value: '59', unit: 'inch' }];
  s = api.formatQuantitySequence(u);
  expect(s).toEqual('312 feet, 59 inches');

  s = api.formatQuantitySequence(u, { length: 'short' });
  expect(s).toEqual('312 ft, 59 in');

  s = api.formatQuantitySequence(u, { length: 'narrow' });
  expect(s).toEqual('312′ 59″');
});

test('format sequence parts', () => {
  const api = unitsApi('en');
  let p: Part[];
  let u: Quantity[];

  u = [{ value: '123', unit: 'meter'}, { value: '17.2', unit: 'centimeter' }];
  p = api.formatQuantitySequenceToParts(u);
  expect(p).toEqual([
    { type: 'digits', value: '123' },
    { type: 'literal', value: ' meters'},
    { type: 'literal', value: ', '},
    { type: 'digits', value: '17' },
    { type: 'decimal', value: '.'},
    { type: 'digits', value: '2'},
    { type: 'literal', value: ' centimeters'}
  ]);

  u = [{ value: '312', unit: 'foot' }, { value: '59', unit: 'inch' }];
  p = api.formatQuantitySequenceToParts(u, { length: 'narrow' });
  expect(p).toEqual([
    { type: 'digits', value: '312' },
    { type: 'literal', value: '′' },
    { type: 'literal', value: ' '},
    { type: 'digits', value: '59' },
    { type: 'literal', value: '″' }
  ]);
});
