import { Decimal } from '../src';

const parse = (s: string) => new Decimal(s);

test('format', () => {
  expect(parse('-12.79').toString()).toEqual('-12.79');
});
