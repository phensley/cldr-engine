import { EN, EN_GB, ES, ES_419, DE, FR, LT, SR, ZH } from '../../_helpers';
import { buildSchema } from '../../../src/schema';
import { NumbersInternal, UnitsEngine, UnitsInternal, WrapperInternal } from '../../../src/engine';

const SCHEMA = buildSchema();
const WRAPPER = new WrapperInternal();
const NUMBERS = new NumbersInternal(SCHEMA, WRAPPER);
const UNITS = new UnitsInternal(SCHEMA, NUMBERS, WRAPPER);

test('display name', () => {
  const units = new UnitsEngine(UNITS, EN);
  expect(units.getDisplayName('g-force')).toEqual('g-force');
  expect(units.getDisplayName('meter-per-second')).toEqual('meters per second');
});
