import { Decimal, DecimalConstants } from '@phensley/decimal';
import { formatSource, Code, HEADER } from './util';

const generate = (sample: string): string[] => {
  if (sample.indexOf('~') === -1) {
    return [sample];
  }
  const res: string[] = [];
  const [_s, _e] = sample.split('~');
  let s = new Decimal(_s);
  const e = new Decimal(_e);
  let incr = DecimalConstants.ONE;
  if (s.scale() > 0) {
    incr = incr.movePoint(-s.scale());
  }
  while (s.compare(e) !== 0) {
    res.push(s.toString());
    s = s.add(incr);
  }
  // console.log(`${s.toString()} ${e.toString()} incr ${incr.toString()}`;
  return res;
};

export const getPlurals = (data: any): Code[] => {
  const result: Code[] = [];

  const { cardinals, ordinals, expressions, samples } = data;

  let code = HEADER;
  code += "import { Expr, Rule } from './types';\n\n";

  const type = '{ [x: string]: Rule[] }';
  code += formatSource(`export const cardinalRules: ${type} = ${JSON.stringify(cardinals)};\n\n`);
  code += formatSource(`export const ordinalRules: ${type} = ${JSON.stringify(ordinals)};\n\n`);
  code += formatSource(`export const expressions: Expr[] = ${JSON.stringify(expressions)};\n`);

  result.push(Code.plurals(['autogen.rules.ts'], code));

  // Generate test cases from rule samples
  code = '';
  Object.keys(samples).forEach(typ => {
    const langs = samples[typ];
    Object.keys(langs).forEach(lang => {
      for (const group of langs[lang]) {
        const [category, cases] = group;
        // console.log(category, cases, '!');
        const r: string[] = [];
        for (const c of cases) {
          for (const s of generate(c)) {
            r.push(s);
          }
        }
        code += `${typ}  ${lang.padEnd(3)}  ${category.padEnd(6)}  ${r.join(',')}\n`;
      }
      code += '\n';
    });
  });

  result.push(Code.plurals(['..', '__tests__', 'samples.txt'], code));

  return result;
};
