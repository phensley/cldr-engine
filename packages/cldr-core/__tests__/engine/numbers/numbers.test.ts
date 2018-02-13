import { Plural } from '@phensley/cldr-schema';
import { languageBundle } from '../../_helpers/bundle';
import { buildSchema } from '../../../src/schema';
import { NumbersEngine, NumbersInternal } from '../../../src/engine/numbers';

const EN = languageBundle('en');
const EN_GB = languageBundle('en-GB');
const ES_419 = languageBundle('es-419');
const FR = languageBundle('fr');

const INTERNAL = new NumbersInternal(buildSchema());

const USD = 'USD';
const AUD = 'AUD';

test('basics', () => {
  let formatter = new NumbersEngine(INTERNAL, EN);
  let s = formatter.formatDecimal('1.234', {});
  // TODO
  console.log(s);
});

test('display names', () => {
  let formatter = new NumbersEngine(INTERNAL, EN);

  let s = formatter.getCurrencySymbol(USD);
  expect(s).toEqual('$');

  s = formatter.getCurrencySymbol(AUD);
  expect(s).toEqual('A$');

  s = formatter.getCurrencySymbol(AUD, true);
  expect(s).toEqual('$');

  s = formatter.getCurrencyDisplayName(USD);
  expect(s).toEqual('US Dollar');

  s = formatter.getCurrencyPluralName(USD, 'one');
  expect(s).toEqual('US dollar');

  s = formatter.getCurrencyPluralName(USD, 'other');
  expect(s).toEqual('US dollars');

  formatter = new NumbersEngine(INTERNAL, EN_GB);
  s = formatter.getCurrencyDisplayName(USD);
  expect(s).toEqual('US Dollar');

  formatter = new NumbersEngine(INTERNAL, ES_419);
  s = formatter.getCurrencyDisplayName(USD);
  expect(s).toEqual('dólar estadounidense');

  formatter = new NumbersEngine(INTERNAL, FR);
  s = formatter.getCurrencyDisplayName(USD);
  expect(s).toEqual('dollar des États-Unis');
});
