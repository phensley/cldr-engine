/// <reference path="../../../cldr-utils/__benchmarks__/typings.d.ts" />

import { join } from 'path';
import { makeSuite, readLines } from '../../../cldr-utils/__benchmarks__/util';
import { Decimal } from '../../src';

export const numberFormatBaselineSuite = makeSuite('Number Format Baseline');

const CASES = readLines(join(__dirname, './numbers.txt'));

CASES.forEach(n => {
  const parsed = new Decimal(n);
  const raw = parsed.toString().split('').reverse();

  // Benchmark baseline for append / reverse / join
  numberFormatBaselineSuite.add(`baseline append ${n}`, () => {
    const r: string[] = [];
    for (const c of raw) {
      r.push(c);
    }
    r.reverse().join('');
  });
});
