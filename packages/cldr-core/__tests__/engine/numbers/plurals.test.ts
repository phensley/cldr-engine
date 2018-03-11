import { AZ, EN, EN_GB, ES_419, FR, DE, KM } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import {
  NumbersEngine,
  NumbersInternal,
  WrapperInternal
} from '../../../src/engine';

const INTERNAL = new NumbersInternal(buildSchema(), new WrapperInternal());

test('plurals', () => {

  // Main test cases are under engine/plurals. These are here to confirm
  // the public interface is covered.

  let engine = new NumbersEngine(INTERNAL, EN);
  expect(engine.getPluralCardinal('0')).toEqual('other');
  expect(engine.getPluralCardinal('1')).toEqual('one');
  expect(engine.getPluralCardinal('2')).toEqual('other');

  expect(engine.getPluralCardinal('1.0')).toEqual('other');
  expect(engine.getPluralCardinal('1.5')).toEqual('other');

  engine = new NumbersEngine(INTERNAL, FR);
  expect(engine.getPluralCardinal('0')).toEqual('one');
  expect(engine.getPluralCardinal('1')).toEqual('one');
  expect(engine.getPluralCardinal('2')).toEqual('other');
  expect(engine.getPluralCardinal('10')).toEqual('other');

  expect(engine.getPluralCardinal('1.2')).toEqual('one');
  expect(engine.getPluralCardinal('1.7')).toEqual('one');

  engine = new NumbersEngine(INTERNAL, AZ);
  expect(engine.getPluralCardinal('1')).toEqual('one');
  for (const n of ['0', '2', '3', '4', '5']) {
    expect(engine.getPluralCardinal(n)).toEqual('other');
  }
});

test('ordinals', () => {
  let engine = new NumbersEngine(INTERNAL, EN);
  expect(engine.getPluralOrdinal('0')).toEqual('other');
  expect(engine.getPluralOrdinal('1')).toEqual('one');
  expect(engine.getPluralOrdinal('2')).toEqual('two');
  expect(engine.getPluralOrdinal('3')).toEqual('few');
  expect(engine.getPluralOrdinal('4')).toEqual('other');

  engine = new NumbersEngine(INTERNAL, FR);
  expect(engine.getPluralOrdinal('1')).toEqual('one');
  for (const n of ['0', '2', '3', '4']) {
    expect(engine.getPluralOrdinal(n)).toEqual('other');
  }

  engine = new NumbersEngine(INTERNAL, AZ);
  for (const n of ['1', '2', '5', '7', '8']) {
    expect(engine.getPluralOrdinal(n)).toEqual('one');
  }
  for (const n of ['3', '4']) {
    expect(engine.getPluralOrdinal(n)).toEqual('few');
  }
  for (const n of ['0', '6', '16', '26']) {
    expect(engine.getPluralOrdinal(n)).toEqual('many');
  }
  for (const n of ['9', '10', '19', '29']) {
    expect(engine.getPluralOrdinal(n)).toEqual('other');
  }
});
