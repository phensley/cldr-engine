import { Decimal, PartsDecimalFormatter, StringDecimalFormatter } from '../src';

const parse = (s: string) => new Decimal(s);

test('format', () => {
  expect(parse('-12.79').toString()).toEqual('-12.79');
});

test('string', () => {
  const f = new StringDecimalFormatter();
  const digits = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const n = new Decimal('123456789');
  n.format(f, '.', ',', 1, 1, 3, 3, true, digits);
  expect(f.render()).toEqual('bcd,efg,hij');
});

test('trailing zeros with group', () => {
  const f = new StringDecimalFormatter();
  const n = new Decimal('1.2e31');
  n.format(f, '.', ',', 1, 1, 3, 3, true);
  expect(f.render()).toEqual('12,000,000,000,000,000,000,000,000,000,000');
});

test('parts formatter edge case', () => {
  const f = new PartsDecimalFormatter('.', ',');
  expect(f.render()).toEqual([]);
  f.add('123');
  expect(f.render()).toEqual([
    { type: 'integer', value: '123' }
  ]);
});
