import { AZ, EN, EN_GB, ES_419, FR, DE, KM } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { Bundle, InternalsImpl, NumbersImpl, PrivateApiImpl } from '../../../src';

const INTERNALS = new InternalsImpl();

const numbersApi = (bundle: Bundle) =>
  new NumbersImpl(bundle, INTERNALS, new PrivateApiImpl(bundle, INTERNALS));

test('plurals', () => {

  // Main test cases are under engine/plurals. These are here to confirm
  // the public interface is covered.

  let api = numbersApi(EN);
  expect(api.getPluralCardinal('0')).toEqual('other');
  expect(api.getPluralCardinal('1')).toEqual('one');
  expect(api.getPluralCardinal('2')).toEqual('other');

  expect(api.getPluralCardinal('1.0')).toEqual('other');
  expect(api.getPluralCardinal('1.5')).toEqual('other');

  api = numbersApi(FR);
  expect(api.getPluralCardinal('0')).toEqual('one');
  expect(api.getPluralCardinal('1')).toEqual('one');
  expect(api.getPluralCardinal('2')).toEqual('other');
  expect(api.getPluralCardinal('10')).toEqual('other');

  expect(api.getPluralCardinal('1.2')).toEqual('one');
  expect(api.getPluralCardinal('1.7')).toEqual('one');

  api = numbersApi(AZ);
  expect(api.getPluralCardinal('1')).toEqual('one');
  for (const n of ['0', '2', '3', '4', '5']) {
    expect(api.getPluralCardinal(n)).toEqual('other');
  }
});

test('ordinals', () => {
  let api = numbersApi(EN);
  expect(api.getPluralOrdinal('0')).toEqual('other');
  expect(api.getPluralOrdinal('1')).toEqual('one');
  expect(api.getPluralOrdinal('2')).toEqual('two');
  expect(api.getPluralOrdinal('3')).toEqual('few');
  expect(api.getPluralOrdinal('4')).toEqual('other');

  api = numbersApi(FR);
  expect(api.getPluralOrdinal('1')).toEqual('one');
  for (const n of ['0', '2', '3', '4']) {
    expect(api.getPluralOrdinal(n)).toEqual('other');
  }

  api = numbersApi(AZ);
  for (const n of ['1', '2', '5', '7', '8']) {
    expect(api.getPluralOrdinal(n)).toEqual('one');
  }
  for (const n of ['3', '4']) {
    expect(api.getPluralOrdinal(n)).toEqual('few');
  }
  for (const n of ['0', '6', '16', '26']) {
    expect(api.getPluralOrdinal(n)).toEqual('many');
  }
  for (const n of ['9', '10', '19', '29']) {
    expect(api.getPluralOrdinal(n)).toEqual('other');
  }
});
