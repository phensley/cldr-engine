import { HEADER, Code, lineWrap } from './util';

export const getCurrencies = (data: any): Code[] => {
  let code = `${HEADER}import { makeEnum } from '../../types/enum';\n\n`;
  const currencies = data.currencies.map((c: string) => `'${c}'`);

  code += 'export const [ Currency, CurrencyValues ] = makeEnum([\n';
  code += lineWrap(80, ',', currencies);
  code += '\n]);\n\n';

  code += 'export type CurrencyType = (\n';
  code += lineWrap(80, '|', currencies);
  code += ');\n';

  return [
    Code.schema(['schema', 'currencies', 'autogen.currencies.ts'], code)
  ];
};
