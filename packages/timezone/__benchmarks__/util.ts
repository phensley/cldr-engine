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
