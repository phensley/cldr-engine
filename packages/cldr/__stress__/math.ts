import { Decimal, DecimalConstants, MathContext, RoundingModeType } from '../src';
import { Timer } from './timer';

const { PI, E } = DecimalConstants;

const RAW_NUMBERS: string = `
  infinity nan 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20
  0.000 0.00001 0.0000001 0.0000000000001
  1e-10 1e-20 1e-30
  9e-10 9e-20 9e-30
  1e10 1e20 1e30
  9e10 9e20 9e30
  333 3333 33333 333333 3333333 33333333 3333333333
  666 6666 66666 666666 6666666 66666666 6666666666
  999 3333 99999 999999 9999999 99999999 9999999999

  ${PI.toString()}
  ${E.toString()}

  # bell primes
  2 3 877 27644437 35742549198872617291353508656626642567 359334085968622831041960188598043661065388726959079837
`;

const NUMBERS: Decimal[] = [];

RAW_NUMBERS.split(/\n/)
  .map((s) => s.trim())
  .filter((s) => s[0] !== '#')
  .map((s) => s.split(/\s+/))
  .forEach((r) => r.filter((s) => s.length).forEach((s) => NUMBERS.push(new Decimal(s))));

const ROUNDING: RoundingModeType[] = ['ceiling', 'up', 'down', 'floor', 'half-down', 'half-up', 'half-even'];

const CONTEXTS: MathContext[] = [{}];
for (const round of ROUNDING) {
  for (let i = 0; i < 40; i++) {
    CONTEXTS.push({ precision: i, round });
  }
  for (let i = -10; i < 11; i++) {
    CONTEXTS.push({ scale: i, round });
  }
}

const VERBOSE = false;

export const mathStress = (): void => {
  let add: Decimal;
  let sub: Decimal;
  let mul: Decimal;
  let div: Decimal;
  let total = 0;

  const numbers: Decimal[] = NUMBERS.concat(NUMBERS.map((n) => n.negate()));
  const timer = new Timer();
  timer.start();

  const cases = numbers.length * numbers.length * CONTEXTS.length;
  const operations = cases * 4;
  console.log(`[math] total cases: ${cases}`);
  console.log(`[math] total operations: ${operations}`);

  for (const n of numbers) {
    for (const m of numbers) {
      for (const c of CONTEXTS) {
        add = n.add(m);
        sub = n.subtract(m);
        mul = n.multiply(m, c);
        div = n.divide(m, c);

        if (VERBOSE) {
          let s = `${total}: n=${n.toString()} m=${m.toString()}\n`;
          s += `  CONTEXT ${JSON.stringify(c)}\n`;
          s += `      ADD ${add.toString()}\n`;
          s += ` SUBTRACT ${sub.toString()}\n`;
          s += ` MULTIPLY ${mul.toString()}\n`;
          s += `   DIVIDE ${div.toString()}\n`;
          console.log(s);
        } else if (total % 10000 === 0) {
          const pct = Math.round((total / cases) * 100);
          console.log(`[math] processed ${total} cases.. (${pct}%)`);
        }
        total++;
      }
    }
  }
  const elapsed = timer.micros();
  console.log(`[math] ${total} cases evaluated`);
  console.log(`[math] elapsed ${elapsed}`);
};
