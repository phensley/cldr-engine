import { getSupplemental } from '../../../cldr';
import { HEADER, NOLINT_MAXLINE, Code } from './util';

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

export const getSystems = (data: any): Code[] => {
  const supp = getSupplemental();

  let code = HEADER + NOLINT_MAXLINE;

  code += `export const numericNumberingDigits: { [x: string]: string[] } = {\n`;
  Object.keys(supp.NumberingSystems).forEach(k => {
    const o = supp.NumberingSystems[k];
    if (o._type === 'numeric') {
      const v: string[] = Array.from(o._digits);
      code += `  ${k}: [${escape(v)}],\n`;
    }
  });
  code += '};\n';

  return [
    Code.core(['systems', 'numbering', 'autogen.numeric.ts'], code)
  ];
};
