import { lineWrap, sortSet, Code, HEADER } from './util';

const process = (symbols: any): string[] => {
  const temp = symbols.map((s: string) => s.split('-')[0]);
  return sortSet(new Set(temp));
};

export const getIdentifiers = (data: any): Code[] => {
  const languages = sortSet(new Set(data.languages));
  const scripts = sortSet(new Set(data.scripts));
  const regions = process(data.territories);

  let code = `${HEADER}`;

  const _languages = languages.map((c: string) => `'${c}'`);

  code += '/** @public */\n';
  code += 'export type LanguageIdType = (\n';
  code += lineWrap(80, '|', _languages);
  code += ');\n\n';

  const _scripts = scripts.map((c: string) => `'${c}'`);

  code += '/** @public */\n';
  code += 'export type ScriptIdType = (\n';
  code += lineWrap(80, '|', _scripts);
  code += ');\n\n';

  const _regions = regions.map((c: string) => `'${c}'`);

  code += '/** @public */\n';
  code += `export type RegionIdType = (\n`;
  code += lineWrap(80, '|', _regions);
  code += ');\n';

  return [
    Code.types(['autogen.identifiers.ts'], code)
  ];
};
