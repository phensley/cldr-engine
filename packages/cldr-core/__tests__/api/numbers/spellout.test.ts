import { numbersApi } from '../../_helpers';
import { DecimalConstants, NumbersImpl } from '../../../src';

test('numbers defaulting', () => {
  let api: NumbersImpl;
  let s: string;

  api = numbersApi('en');

  s = api.formatSpellout('35');
  expect(s).toEqual('thirty-five');

  s = api.formatSpellout('157.9', { context: 'begin-sentence' });
  expect(s).toEqual('One hundred fifty-seven point nine');

  s = api.formatSpellout('-23.57');
  expect(s).toEqual('minus twenty-three point five seven');

  s = api.formatSpellout('1234567');
  expect(s).toEqual('one million two hundred thirty-four thousand five hundred sixty-seven');

  s = api.formatSpellout(DecimalConstants.PI, { maximumFractionDigits: 4 });
  expect(s).toEqual('three point one four one six');

  api = numbersApi('es');

  s = api.formatSpellout('35');
  expect(s).toEqual('treinta y cinco');

  s = api.formatSpellout('157.9', { context: 'begin-sentence' });
  expect(s).toEqual('Ciento cincuenta y siete punto nueve');

  s = api.formatSpellout('-23.57');
  expect(s).toEqual('menos veintitrés punto cinco siete');

  s = api.formatSpellout('1234567');
  expect(s).toEqual('un millón doscientos treinta y cuatro mil quinientos sesenta y siete');

  s = api.formatSpellout(DecimalConstants.PI, { maximumFractionDigits: 4 });
  expect(s).toEqual('tres punto uno cuatro uno seis');
});
