import { AR_IL, EN } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { GeneralEngine, GeneralInternal } from '../../../src/engine';

const SCHEMA = buildSchema();
const INTERNAL = new GeneralInternal(SCHEMA);

test('character order', () => {
  let engine = new GeneralEngine(INTERNAL, EN);
  expect(engine.characterOrder()).toEqual('ltr');

  engine = new GeneralEngine(INTERNAL, AR_IL);
  expect(engine.characterOrder()).toEqual('rtl');
});

test('line order', () => {
  let engine = new GeneralEngine(INTERNAL, EN);
  expect(engine.lineOrder()).toEqual('ttb');

  engine = new GeneralEngine(INTERNAL, AR_IL);
  expect(engine.lineOrder()).toEqual('ttb');
});
