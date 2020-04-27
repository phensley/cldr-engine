import { lineWrap, Code, HEADER, NOLINT_MAXLINE } from './util';

const DEFAULT_DIGITS = '2';
const DEFAULT_ROUNDING = '0';

const convert = (s: any): string[] => {
  const digits = s._digits || DEFAULT_DIGITS;
  const rounding = s._rounding || DEFAULT_ROUNDING;
  const cashDigits = s._cashDigits || digits;
  const cashRounding = s._cashRounding || rounding;
  return [digits, rounding, cashDigits, cashRounding];
};

export const getCurrencies = (data: any): Code[] => {
  const result: Code[] = [];

  let code = NOLINT_MAXLINE + HEADER;
  const currencies = data.currencies.map((c: string) => `'${c}'`);

  code += '/** @public */\n';
  code += 'export type CurrencyType = (\n';
  code += lineWrap(80, '|', currencies);
  code += ');\n';

  result.push(Code.types(['autogen.currencies.ts'], code));

  code = NOLINT_MAXLINE + HEADER;
  const fractions = data.currencies
    .filter((c: string) => data.currencyFractions[c] !== undefined)
    .map((c: string) => {
      const frac = convert(data.currencyFractions[c]).join(' ');
      return `${c}:${frac}`;
    }).join('|');

  code += `export const currencyFractionsRaw = '${fractions}';\n\n`;

  const regions = Object.keys(data.currencyRegions)
    .map((r: string) => `${r}:${data.currencyRegions[r]}`)
    .join('|');

  code += `export const currencyRegionsRaw = '${regions}';\n`;

  result.push(Code.core(['internals', 'numbers', 'autogen.currencies.ts'], code));

  return result;
};
