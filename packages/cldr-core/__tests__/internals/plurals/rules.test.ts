import { Decimal } from '@phensley/decimal';
import { PluralInternalsImpl } from '../../../src/internals/plurals';

test('missing rules', () => {
  const op = new Decimal('12345.678').operands();

  const impl = new PluralInternalsImpl();
  let cat = impl.cardinal('xyz', op);
  expect(cat).toEqual('other');

  cat = impl.ordinal('xyz', op);
  expect(cat).toEqual('other');
});
