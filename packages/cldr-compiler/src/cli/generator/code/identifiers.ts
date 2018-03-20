import { HEADER, Code, NOLINT_MAXLINE, lineWrap, sortSet } from './util';

const process = (symbols: any): string[] => {
  const temp = symbols.map((s: string) => s.split('-')[0]);
  return sortSet(new Set(temp)).map((s: string) => `'${s}'`);
};

export const getIdentifiers = (data: any): Code[] => {
  const scripts = process(data.scripts);
  const territories = process(data.territories);

  let code = `${HEADER}import { makeEnum } from '../../types/enum';\n\n`;

  code += 'export const [ Script, ScriptValues ] = makeEnum([\n';
  code += lineWrap(80, ',', scripts);
  code += '\n]);\n\n';

  code += 'export type ScriptType = (\n';
  code += lineWrap(80, '|', scripts);
  code += ');\n\n';

  code += 'export const [ Territory, TerritoryValues ] = makeEnum([\n';
  code += lineWrap(80, ',', territories);
  code += '\n]);\n\n';

  code += `export type TerritoryType = (\n`;
  code += lineWrap(80, '|', territories);
  code += ');\n';

  return [
    Code.schema(['schema', 'names', 'autogen.identifiers.ts'], code)
  ];
};
