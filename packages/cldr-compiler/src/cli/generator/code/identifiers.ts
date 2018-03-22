import { HEADER, Code, NOLINT_MAXLINE, lineWrap, sortSet } from './util';

const process = (symbols: any): string[] => {
  const temp = symbols.map((s: string) => s.split('-')[0]);
  return sortSet(new Set(temp)).map((s: string) => `'${s}'`);
};

export const getIdentifiers = (data: any): Code[] => {
  const scripts = process(data.scripts);
  const regions = process(data.territories);

  let code = `${HEADER}import { makeEnum } from '../../types/enum';\n\n`;

  code += 'export const [ ScriptId, ScriptIdValues ] = makeEnum([\n';
  code += lineWrap(80, ',', scripts);
  code += '\n]);\n\n';

  code += 'export type ScriptIdType = (\n';
  code += lineWrap(80, '|', scripts);
  code += ');\n\n';

  code += 'export const [ RegionId, RegionIdValues ] = makeEnum([\n';
  code += lineWrap(80, ',', regions);
  code += '\n]);\n\n';

  code += `export type RegionIdType = (\n`;
  code += lineWrap(80, '|', regions);
  code += ');\n';

  return [
    Code.schema(['schema', 'names', 'autogen.identifiers.ts'], code)
  ];
};
