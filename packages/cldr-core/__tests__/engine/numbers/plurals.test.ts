import { EN, EN_GB, ES_419, FR, DE, KM } from '../../_helpers';
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
});
