import { lineWrap, sortSet, Code, HEADER } from './util';

const process = (symbols: any): string[] => {
  const temp = symbols.map((s: string) => s.split('-')[0]);
  return sortSet(new Set(temp));
};

export const getIdentifiers = (data: any): Code[] => {
  const languages = process(data.languages);
  const scripts = process(data.scripts);
  const regions = process(data.territories);

  let code = `${HEADER}`;

  const _languages = languages.map((c: string) => `'${c}'`);

  code += 'export type LanguageIdType = (\n';
  code += lineWrap(80, '|', _languages);
  code += ');\n\n';

  // code += 'export const LanguageIdValues: LanguageIdType[] = [\n';
  // code += lineWrap(80, ',', _languages);
  // code += '\n];\n\n';

  const _scripts = scripts.map((c: string) => `'${c}'`);

  code += 'export type ScriptIdType = (\n';
  code += lineWrap(80, '|', _scripts);
  code += ');\n\n';

  // code += 'export const ScriptIdValues: ScriptIdType[] = [\n';
  // code += lineWrap(80, ',', _scripts);
  // code += '\n];\n\n';

  // code += `export const enum ScriptId {\n`;
  // code += scripts.map((c: string) => {
  //   const pfx = /^\d/.test(c) ? '_' : '';
  //   return `  ${pfx}${c} = '${c}'`;
  // }).join(',\n');
  // code += '\n}\n\n';

  const _regions = regions.map((c: string) => `'${c}'`);

  code += `export type RegionIdType = (\n`;
  code += lineWrap(80, '|', _regions);
  code += ');\n';

  // code += 'export const RegionIdValues: RegionIdType[] = [\n';
  // code += lineWrap(80, ',', _regions);
  // code += '\n];\n\n';

  // code += `export const enum RegionId {\n`;
  // code += regions.map((c: string) => {
  //   const pfx = /^\d/.test(c) ? '_' : '';
  //   return `  ${pfx}${c} = '${c}'`;
  // }).join(',\n');
  // code += '\n}\n';

  return [
    Code.schema(['schema', 'names', 'autogen.identifiers.ts'], code)
  ];
};
