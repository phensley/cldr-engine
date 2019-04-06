import { join } from 'path';
import { makeSuite, readLines } from '../util';
import { Decimal } from '../../src';

export const numberParseSuite = makeSuite('Number Parse');

const CASES = readLines(join(__dirname, './numbers.txt'));

CASES.forEach(n => {
  numberParseSuite.add(`parse ${n}`, () => {
    new Decimal(n);
  });
});
