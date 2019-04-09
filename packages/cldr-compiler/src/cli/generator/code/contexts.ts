import { lineWrap, Code, HEADER } from './util';

export const getContexts = (data: any): Code[] => {
  let code = HEADER;

  const transforms = data.contextTransforms;
  const _transforms = transforms.map((c: string) => `'${c}'`);
  code += `export type ContextTransformFieldType = (\n`;
  code += lineWrap(80, '|', _transforms);
  code += ');\n\n';

  code += `export const ContextTransformFieldValues: ContextTransformFieldType[] = [\n`;
  code += lineWrap(80, ',', _transforms);
  code += '\n];\n\n';

  // code += `export const enum ContextTransformField {\n`;
  // code += transforms.map((c: string) => {
  //   return `  ${c.replace(/-/g, '_').toUpperCase()} = '${c}'`;
  // }).join(',\n');
  // code += '\n}\n';

  return [
    Code.schema(['schema', 'general', 'autogen.context.ts'], code)
  ];

};
