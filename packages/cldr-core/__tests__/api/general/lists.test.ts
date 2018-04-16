import { languageBundle } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Bundle, GeneralImpl, InternalsImpl } from '../../../src';

const INTERNALS = new InternalsImpl();

const generalApi = (tag: string) => {
  const bundle = languageBundle(tag);
  return new GeneralImpl(bundle, INTERNALS);
};

const ZERO: string[] = [];
const ONE = ['1'];
const TWO = ONE.concat(['2']);
const THREE = TWO.concat(['3']);
const FOUR = THREE.concat(['4']);
const FIVE = FOUR.concat(['5']);
const SIX = FIVE.concat(['6']);

test('list patterns and', () => {
  let api = generalApi('en');

  expect(api.formatList(ZERO)).toEqual('');
  expect(api.formatList(ONE)).toEqual('1');
  expect(api.formatList(TWO)).toEqual('1 and 2');
  expect(api.formatList(THREE)).toEqual('1, 2, and 3');
  expect(api.formatList(FOUR)).toEqual('1, 2, 3, and 4');
  expect(api.formatList(FIVE)).toEqual('1, 2, 3, 4, and 5');
  expect(api.formatList(SIX)).toEqual('1, 2, 3, 4, 5, and 6');

  api = generalApi('fr');

  expect(api.formatList(ZERO)).toEqual('');
  expect(api.formatList(ONE)).toEqual('1');
  expect(api.formatList(TWO)).toEqual('1 et 2');
  expect(api.formatList(THREE)).toEqual('1, 2 et 3');
  expect(api.formatList(FOUR)).toEqual('1, 2, 3 et 4');
  expect(api.formatList(FIVE)).toEqual('1, 2, 3, 4 et 5');
  expect(api.formatList(SIX)).toEqual('1, 2, 3, 4, 5 et 6');

  api = generalApi('th');

  expect(api.formatList(ZERO)).toEqual('');
  expect(api.formatList(ONE)).toEqual('1');
  expect(api.formatList(TWO)).toEqual('1และ2');
  expect(api.formatList(THREE)).toEqual('1 2 และ3');
  expect(api.formatList(FOUR)).toEqual('1 2 3 และ4');
  expect(api.formatList(FIVE)).toEqual('1 2 3 4 และ5');
  expect(api.formatList(SIX)).toEqual('1 2 3 4 5 และ6');
});

test('list patterns and parts', () => {
  const api = generalApi('en');

  expect(api.formatListToParts(ONE)).toEqual([
    { type: 'item', value: '1' }
  ]);

  expect(api.formatListToParts(TWO)).toEqual([
    { type: 'item', value: '1' },
    { type: 'literal', value: ' and '},
    { type: 'item', value: '2' }
  ]);

  expect(api.formatListToParts(THREE)).toEqual([
    { type: 'item', value: '1' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '2' },
    { type: 'literal', value: ', and '},
    { type: 'item', value: '3' }
  ]);

  expect(api.formatListToParts(FOUR)).toEqual([
    { type: 'item', value: '1' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '2' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '3' },
    { type: 'literal', value: ', and '},
    { type: 'item', value: '4' }
  ]);

  expect(api.formatListToParts(FIVE)).toEqual([
    { type: 'item', value: '1' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '2' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '3' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '4' },
    { type: 'literal', value: ', and '},
    { type: 'item', value: '5' }
  ]);

  expect(api.formatListToParts(SIX)).toEqual([
    { type: 'item', value: '1' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '2' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '3' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '4' },
    { type: 'literal', value: ', '},
    { type: 'item', value: '5' },
    { type: 'literal', value: ', and '},
    { type: 'item', value: '6' }
  ]);
});

test('list patterns and-short', () => {
  let api = generalApi('en');

  expect(api.formatList(ZERO, 'and-short')).toEqual('');
  expect(api.formatList(ONE, 'and-short')).toEqual('1');
  expect(api.formatList(TWO, 'and-short')).toEqual('1 and 2');
  expect(api.formatList(THREE, 'and-short')).toEqual('1, 2, and 3');
  expect(api.formatList(FOUR, 'and-short')).toEqual('1, 2, 3, and 4');
  expect(api.formatList(FIVE, 'and-short')).toEqual('1, 2, 3, 4, and 5');
  expect(api.formatList(SIX, 'and-short')).toEqual('1, 2, 3, 4, 5, and 6');

  api = generalApi('fr');

  expect(api.formatList(ZERO, 'and-short')).toEqual('');
  expect(api.formatList(ONE, 'and-short')).toEqual('1');
  expect(api.formatList(TWO, 'and-short')).toEqual('1 et 2');
  expect(api.formatList(THREE, 'and-short')).toEqual('1, 2 et 3');
  expect(api.formatList(FOUR, 'and-short')).toEqual('1, 2, 3 et 4');
  expect(api.formatList(FIVE, 'and-short')).toEqual('1, 2, 3, 4 et 5');
  expect(api.formatList(SIX, 'and-short')).toEqual('1, 2, 3, 4, 5 et 6');

  api = generalApi('th');

  expect(api.formatList(ZERO, 'and-short')).toEqual('');
  expect(api.formatList(ONE, 'and-short')).toEqual('1');
  expect(api.formatList(TWO, 'and-short')).toEqual('1 และ 2');
  expect(api.formatList(THREE, 'and-short')).toEqual('1 2 และ3');
  expect(api.formatList(FOUR, 'and-short')).toEqual('1 2 3 และ4');
  expect(api.formatList(FIVE, 'and-short')).toEqual('1 2 3 4 และ5');
  expect(api.formatList(SIX, 'and-short')).toEqual('1 2 3 4 5 และ6');
});

test('list patterns or', () => {
  let api = generalApi('en');

  expect(api.formatList(ZERO, 'or')).toEqual('');
  expect(api.formatList(ONE, 'or')).toEqual('1');
  expect(api.formatList(TWO, 'or')).toEqual('1 or 2');
  expect(api.formatList(THREE, 'or')).toEqual('1, 2, or 3');
  expect(api.formatList(FOUR, 'or')).toEqual('1, 2, 3, or 4');
  expect(api.formatList(FIVE, 'or')).toEqual('1, 2, 3, 4, or 5');
  expect(api.formatList(SIX, 'or')).toEqual('1, 2, 3, 4, 5, or 6');

  api = generalApi('fr');

  expect(api.formatList(ZERO, 'or')).toEqual('');
  expect(api.formatList(ONE, 'or')).toEqual('1');
  expect(api.formatList(TWO, 'or')).toEqual('1 ou 2');
  expect(api.formatList(THREE, 'or')).toEqual('1, 2 ou 3');
  expect(api.formatList(FOUR, 'or')).toEqual('1, 2, 3 ou 4');
  expect(api.formatList(FIVE, 'or')).toEqual('1, 2, 3, 4 ou 5');
  expect(api.formatList(SIX, 'or')).toEqual('1, 2, 3, 4, 5 ou 6');

  api = generalApi('th');

  expect(api.formatList(ZERO, 'or')).toEqual('');
  expect(api.formatList(ONE, 'or')).toEqual('1');
  expect(api.formatList(TWO, 'or')).toEqual('1 หรือ 2');
  expect(api.formatList(THREE, 'or')).toEqual('1, 2 หรือ 3');
  expect(api.formatList(FOUR, 'or')).toEqual('1, 2, 3 หรือ 4');
  expect(api.formatList(FIVE, 'or')).toEqual('1, 2, 3, 4 หรือ 5');
  expect(api.formatList(SIX, 'or')).toEqual('1, 2, 3, 4, 5 หรือ 6');
});
