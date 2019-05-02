import { getSupplemental } from '../../../cldr';
import { Code, HEADER, NOLINT_MAXLINE } from './util';
import { LanguageResolver } from '@phensley/cldr-core';

const increasing = (s: string[]): boolean => {
  for (let i = 1; i < s.length; i++) {
    const prev = s[i - 1].codePointAt(0)!;
    const curr = s[i].codePointAt(0)!;
    if (curr !== prev + 1) {
      console.log('[informational] non-sequential digits', prev, curr, s);
      return false;
    }
  }
  return true;
};

const escape = (digits: string[]): string => {
  let r = '';
  for (const d of digits) {
    if (r.length > 0) {
      r += ', ';
    }
    const c = d.codePointAt(0);
    if (c === undefined) {
      throw new Error(`invalid digit found in: ${digits}`);
    }
    // Use Typescript Unicode code point escapes where needed
    r += c >= 0x10000 ? "'\\u{" + c.toString(16) + "}'" : `'${d}'`;
  }
  return r;
};

export const getSystems = (_data: any): Code[] => {
  const supp = getSupplemental();

  // Public numbering system names like 'beng' and 'hansfin', pointers to the
  // digits or public algorithmic rule name they use.
  let numeric = '';
  let algorithmic = '';

  Object.keys(supp.NumberingSystems).forEach(k => {
    const o = supp.NumberingSystems[k];
    if (o._type === 'numeric') {
      const v: string[] = Array.from(o._digits);
      numeric += `  ${k}: [${escape(increasing(v) ? v.slice(0, 1) : v)}],\n`;
    } else if (o._type === 'algorithmic') {
      const v = o._rules;
      let parts = ['root', v];
      if (v.indexOf('/SpelloutRules') !== -1) {
        const tmp = v.split('/');
        const tag = LanguageResolver.resolve(tmp[0]);
        const id = `${tag.language()}-${tag.script()}`;
        parts = [id, tmp[2]];
      }
      algorithmic += `  ${k}: ${JSON.stringify(parts)},\n`;
    }
  });

  const result: Code[] = [];

  let code = HEADER + NOLINT_MAXLINE;
  code += `export const decimalNumberingDigits: { [x: string]: string[] } = {\n`;
  code += numeric;
  code += '};\n\n';

  code += `export const algorithmicNumbering: { [x: string]: [string, string] } = {\n`;
  code += algorithmic;
  code += '};\n';

  result.push(Code.core(['systems', 'numbering', 'autogen.names.ts'], code));

  return result;
};
