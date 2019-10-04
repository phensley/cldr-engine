import { getSupplemental } from '../../../cldr';
import { Code, HEADER, NOLINT_MAXLINE } from './util';

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

  let code = HEADER + NOLINT_MAXLINE;

  code += `export const decimalNumberingDigits: { [x: string]: string[] } = {\n`;
  Object.keys(supp.NumberingSystems).forEach(k => {
    const o = supp.NumberingSystems[k];
    if (o._type === 'numeric') {
      const v: string[] = Array.from(o._digits);
      code += `  ${k}: [${escape(increasing(v) ? v.slice(0, 1) : v)}],\n`;
    }
  });
  code += '};\n';

  return [
    Code.core(['systems', 'numbering', 'autogen.decimal.ts'], code)
  ];
};
