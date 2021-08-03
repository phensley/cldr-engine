import * as fs from 'fs';
import * as filepath from 'path';
import { Decimal } from '@phensley/decimal';
import { pluralRules } from '../src';

const PATH = filepath.join(__dirname, 'samples.txt');
const SAMPLES = fs.readFileSync(PATH).toString('utf-8').split('\n');
const TESTCASES: { [lang: string]: Group[] } = {};

interface Group {
  lang: string;
  typ: string;
  category: string;
  samples: string[];
}

SAMPLES.forEach((line) => {
  line = line.trim();
  if (!line || line[0] === '#') {
    return;
  }
  const [typ, lang, category, _samples] = line.split(/\s+/);

  const samples = _samples.split(',');
  const key = `${lang} - ${typ}`;

  const cases = TESTCASES[key] || [];
  cases.push({ lang, typ, category, samples });
  TESTCASES[key] = cases;
});

expect.extend({
  toHaveCategory: (sample: string, typ: string, lang: string, expected: string) => {
    let n: Decimal;
    let c = 0;

    // Split off compact exponent syntax
    const parts = sample.split('c');
    if (parts.length == 1) {
      n = new Decimal(sample);
    } else {
      n = new Decimal(parts[0]);
      c = parseInt(parts[1], 10);
      n = n.shiftleft(c);
    }

    const [language, region] = lang.split('-');
    const rules = pluralRules.get(language, region);
    const actual = typ === 'cardinals' ? rules.cardinal(n, c) : rules.ordinal(n);
    const msg = (pass: boolean) => () =>
      `Expected language "${lang}" number "${sample}" ${pass ? 'not ' : ''}to have ` +
      `${typ} category "${expected}" but got "${actual}"`;

    const result = actual === expected;
    return { message: msg(result), pass: result };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R, T> {
      toHaveCategory(typ: string, lang: string, expected: string): R;
    }
  }
}

Object.keys(TESTCASES)
  .sort()
  .forEach((key) => {
    test(key, () => {
      for (const c of TESTCASES[key]) {
        for (let sample of c.samples) {
          expect(sample).toHaveCategory(c.typ, c.lang, c.category);
        }
      }
    });
  });
