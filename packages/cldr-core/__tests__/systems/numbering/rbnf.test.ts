import { AlgorithmicNumberingSystem } from '../../../src/systems/numbering/algorithmic';
import { Decimal } from '@phensley/decimal';

test('bootstrapping', () => {
  const sys = new AlgorithmicNumberingSystem();
  const rbnf = sys.rbnf.get('root')!;
  const s = rbnf.format('en', 'roman-lower', 0, new Decimal('57'));
  expect(s).toEqual('lvii');
});
