import * as fs from 'fs';
import * as filepath from 'path';
import { Decimal } from'@phensley/decimal';
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

SAMPLES.forEach(line => {
  line = line.trim();
  if (!line) {
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
    const ops = pluralRules.operands(new Decimal(sample));
    const actual = typ === 'cardinals' ? pluralRules.cardinal(lang, ops) : pluralRules.ordinal(lang, ops);
    const msg = (pass: boolean) => () =>
      `Expected language "${lang}" number "${sample}" ${pass ? 'not ' : ''}to have ${typ} category "${expected}" but got "${actual}"`;

    const result = actual === expected;
    return { message: msg(result), pass: result };
  }
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveCategory(typ: string, lang: string, expected: string): R;
    }
  }
}

Object.keys(TESTCASES).sort().forEach(key => {
  test(key, () => {
    for (const c of TESTCASES[key]) {
      for (const sample of c.samples) {
        expect(sample).toHaveCategory(c.typ, c.lang, c.category);
      }
    }
  });
});
