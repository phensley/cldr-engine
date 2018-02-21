import { HEADER, Code, lineWrap, formatSource } from './util';

const DEFAULT_DIGITS = '2';
const DEFAULT_ROUNDING = '0';

const DEFAULT = {
  _digits: '2',
  _rounding: '0',
  _cashDigits: '2',
  _cashRounding: '0'
};

const convert = (s: any): string[] => {
  const digits = s._digits || DEFAULT_DIGITS;
  const rounding = s._rounding || DEFAULT_ROUNDING;
  const cashDigits = s._cashDigits || digits;
  const cashRounding = s._cashRounding || rounding;
  return [digits, rounding, cashDigits, cashRounding];
};

export const getCurrencies = (data: any): Code[] => {
  const result: Code[] = [];

  let code = `${HEADER}import { makeEnum } from '../../types/enum';\n\n`;
  const currencies = data.currencies.map((c: string) => `'${c}'`);

  code += 'export const [ Currency, CurrencyValues ] = makeEnum([\n';
  code += lineWrap(80, ',', currencies);
  code += '\n]);\n\n';

  code += 'export type CurrencyType = (\n';
  code += lineWrap(80, '|', currencies);
  code += ');\n';

  result.push(Code.schema(['schema', 'currencies', 'autogen.currencies.ts'], code));

  code = '';
  const fractions = data.currencies
    .filter((c: string) => data.currencyFractions[c] !== undefined)
    .map((c: string) => {
      const frac = convert(data.currencyFractions[c]).join(' ');
      return `${c}:${frac}`;
    }).join('|');

  code += '/* tslint:disable-next-line:max-line-length */\n';
  code += `export const currencyFractionsRaw = '${fractions}';\n`;

  result.push(Code.core(['engine', 'numbers', 'autogen.currencies.ts'], code));

  return result;
};
