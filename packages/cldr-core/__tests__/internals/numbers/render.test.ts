import { languageBundle, INTERNALS } from '../../_helpers';

import { Bundle, Decimal, NumberInternalsImpl, PrivateApiImpl } from '../../../src';
import { RE_DIGIT, RE_SYMBOL } from '../../../src/internals/numbers/render';
import { NumberPattern } from '../../../src/parsing/number';

const internals = INTERNALS();
const privateApi = (bundle: Bundle) => new PrivateApiImpl(bundle, internals);
const numbersImpl = (_lang: string) => new NumberInternalsImpl(internals, 5);

test('number renderer', () => {
  const en = languageBundle('en');
  const priv = privateApi(en);
  const impl = numbersImpl('en');

  const renderer = impl.stringRenderer(priv.getNumberParams('latn'));
  const raw = '+#0.0#;-#0.0#';
  const pattern = impl.getNumberPattern(raw, false);
  const s = renderer.render(new Decimal('12345.6789'), pattern, '', '', '.', 1, false);
  expect(s).toEqual('+12345.6789');
});

test('digits', () => {
  const is = (s: string) => RE_DIGIT.test(s);

  expect(is('5')).toEqual(true);
  expect(is('୨')).toEqual(true);
  expect(is('\u0b67')).toEqual(true);
  expect(is('\u1095')).toEqual(true);

  expect(is('$')).toEqual(false);
  expect(is('k')).toEqual(false);
});

test('secondary groupiing', () => {
  const en = languageBundle('en');
  const priv = privateApi(en);
  const impl = numbersImpl('en');

  const renderer = impl.stringRenderer(priv.getNumberParams('latn'));
  let s: string;
  let pattern: NumberPattern;

  pattern = impl.getNumberPattern('#,##,##0', false);
  s = renderer.render(new Decimal('123456789'), pattern, '', '', '.', 1, true);
  expect(s).toEqual('12,34,56,789');
});

test('symbols', () => {
  const is = (s: string) => RE_SYMBOL.test(s);

  expect(is('$')).toEqual(true);
  expect(is('☀')).toEqual(true);
  expect(is('\u2660')).toEqual(true);
  expect(is('♯')).toEqual(true);
  expect(is('\u266f')).toEqual(true);

  expect(is('9')).toEqual(false);
  expect(is('k')).toEqual(false);
});
