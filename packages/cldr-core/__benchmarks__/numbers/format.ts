import { join } from 'path';
import { makeSuite, readLines } from '../util';
import { Decimal } from '../../src';

export const numberFormatSuite = makeSuite('Number Format');

const CASES = readLines(join(__dirname, './numbers.txt'));

CASES.forEach(n => {
  const parsed = new Decimal(n);
  numberFormatSuite.add(`format ${n}`, () => {
    parsed.toString();
  });
});
