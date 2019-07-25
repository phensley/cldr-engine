import { numbersApi } from '../../_helpers';
import { DecimalConstants, NumbersImpl } from '../../../src';

test('numbers defaulting', () => {
  let api: NumbersImpl;
  let s: string;

  api = numbersApi('en');

  s = api.formatRuleBased('35');
  expect(s).toEqual('thirty-five');

  s = api.formatRuleBased('157.9', { context: 'begin-sentence' });
  expect(s).toEqual('One hundred fifty-seven point nine');

  s = api.formatRuleBased('-23.57');
  expect(s).toEqual('minus twenty-three point five seven');

  s = api.formatRuleBased('1234567');
  expect(s).toEqual('one million two hundred thirty-four thousand five hundred sixty-seven');

  s = api.formatRuleBased(DecimalConstants.PI, { maximumFractionDigits: 4 });
  expect(s).toEqual('three point one four one six');

  // TODO:
  // s = api.formatRuleBased(3, { rule: 'digits-ordinal' });
  // expect(s).toEqual('3rd');

  // s = api.formatRuleBased(15, { rule: 'digits-ordinal' });
  // expect(s).toEqual('15th');

  api = numbersApi('es');

  s = api.formatRuleBased('35');
  expect(s).toEqual('treinta y cinco');

  s = api.formatRuleBased('157.9', { context: 'begin-sentence' });
  expect(s).toEqual('Ciento cincuenta y siete punto nueve');

  s = api.formatRuleBased('-23.57');
  expect(s).toEqual('menos veintitrés punto cinco siete');

  s = api.formatRuleBased('1234567');
  expect(s).toEqual('un millón doscientos treinta y cuatro mil quinientos sesenta y siete');

  s = api.formatRuleBased(DecimalConstants.PI, { maximumFractionDigits: 4 });
  expect(s).toEqual('tres punto uno cuatro uno seis');
});

test('rule names', () => {
  let names: string[];

  names = numbersApi('en').ruleBasedFormatNames();
  expect(names).toContain('roman-upper');
  expect(names).toContain('digits-ordinal');
  expect(names).toContain('spellout-numbering');

  names = numbersApi('pl').ruleBasedFormatNames();
  expect(names).toContain('roman-upper');
  expect(names).toContain('spellout-cardinal-masculine');

  names = numbersApi('fi').ruleBasedFormatNames();
  expect(names).toContain('roman-upper');
  expect(names).toContain('spellout-ordinal-translative-plural');
});
