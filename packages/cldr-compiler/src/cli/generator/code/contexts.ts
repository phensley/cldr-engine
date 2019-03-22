import { lineWrap, Code, HEADER } from './util';

export const getContexts = (data: any): Code[] => {
  let code = HEADER;

  const transforms = data.contextTransforms;
  const _transforms = data.contextTransforms.map((c: string) => `'${c}'`);
  code += `export type ContextTransformType = (\n`;
  code += lineWrap(80, '|', _transforms);
  code += ');\n\n';

  code += `export const ContextTransformValues: ContextTransformType[] = [\n`;
  code += lineWrap(80, ',', _transforms);
  code += '\n];\n\n';

  code += `export const enum ContextTransform {\n`;
  code += transforms.map((c: string) => {
    return `  ${c.replace(/-/g, '_').toUpperCase()} = '${c}'`;
  }).join(',\n');
  code += '\n}\n';

  return [
    Code.schema(['schema', 'general', 'autogen.context.ts'], code)
  ];

};
