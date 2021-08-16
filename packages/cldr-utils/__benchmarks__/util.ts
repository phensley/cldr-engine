/// <reference path="./typings.d.ts" />

import * as fs from 'fs';
import { Event, Suite } from 'benchmark';
import * as beautify from 'beautify-benchmark';
import chalk from 'chalk';

/**
 * Constructs a benchmark suite, setting a few lifecycle handlers.
 */
export const makeSuite = (name: string): Suite => {
  const suite = new Suite(name);
  suite.on('cycle', (e: Event) => beautify.add(e.target));
  suite.on('complete', () => {
    beautify.log();
    const fastest = suite.filter('fastest').map('name');
    const slowest = suite.filter('slowest').map('name');
    console.log(`Fastest is: ${chalk.green(...fastest)}`);
    console.log(`Slowest is: ${chalk.red(...slowest)}`);
  });
  return suite;
};

/**
 * Pad a string to length n using the replacement string.
 */
export const pad = (n: number, str: string, repl: string): string => {
  if (n < str.length) {
    throw new Error(`String is longer than the padding amount ${n}`);
  }
  if (n === str.length) {
    return str;
  }

  let res = str;
  let i = 0;
  while (res.length < n) {
    res += repl[i++ % repl.length];
  }
  return res;
};

export const readLines = (path: string): string[] => {
  return fs
    .readFileSync(path, 'utf-8')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};
