import { HEADER, Code, NOLINT_MAXLINE, lineWrap, sortSet } from './util';

export const getTerritories = (data: any): Code[] => {
  const temp = data.territories.map((s: string) => s.split('-')[0]);
  const symbols = sortSet(new Set(temp)).map((s: string) => `'${s}'`);

  let code = `${HEADER}import { makeEnum } from '../../types/enum';\n\n`;

  code += 'export const [ Territory, TerritoryValues ] = makeEnum([\n';
  code += lineWrap(80, ',', symbols);
  code += '\n]);\n\n';

  code += `export type TerritoryType = (\n`;
  code += lineWrap(80, '|', symbols);
  code += ');\n';

  return [
    Code.schema(['schema', 'territories', 'autogen.territories.ts'], code)
  ];
};
