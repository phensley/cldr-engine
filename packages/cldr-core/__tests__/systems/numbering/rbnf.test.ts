import { AlgorithmicNumberingSystems } from '../../../src/systems/numbering/algorithmic';
import { Decimal } from '@phensley/decimal';
import { languageBundle } from '../../_helpers/bundle';

test('numbering systems', () => {
  const en = languageBundle('en');
  const systems = new AlgorithmicNumberingSystems(en.spellout());
  let s: string;

  const sys = systems.system('romanlow')!;
  s = sys.format(new Decimal('1234'));
  expect(s).toEqual('mccxxxiv');

  s = sys.format(new Decimal('57'));
  expect(s).toEqual('lvii');
});

test('spellout english', () => {
  const en = languageBundle('en');
  const systems = new AlgorithmicNumberingSystems(en.spellout());
  let s: string;

  const sys = systems.spellout('en-Latn', 'spellout-numbering')!;
  s = sys.format(new Decimal('1234'));
  expect(s).toEqual('one thousand two hundred thirty-four');

  s = sys.format(new Decimal('57'));
  expect(s).toEqual('fifty-seven');
});
