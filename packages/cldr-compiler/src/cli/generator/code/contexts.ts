import { lineWrap, Code, HEADER, NOLINT_MAXLINE } from './util';

export const getContexts = (data: any): Code[] => {
  const result: Code[] = [];

  const transforms = data.contextTransforms;
  const _transforms = transforms.map((c: string) => `'${c}'`);

  let code = HEADER;
  code += '/** @public */\n';
  code += `export type ContextTransformFieldType = (\n`;
  code += lineWrap(80, '|', _transforms);
  code += ');\n';

  result.push(Code.types(['autogen.context.ts'], code));

  code = NOLINT_MAXLINE + HEADER;
  code += "import { ContextTransformFieldType } from '@phensley/cldr-types';\n\n";

  code += '/** @public */\n';
  code += `export const ContextTransformFieldValues: ContextTransformFieldType[] = ('`;
  code += transforms.join(' ');
  code += `').split(' ') as ContextTransformFieldType[];\n`;

  result.push(Code.core(['schema', 'schema', 'autogen.context.ts'], code));

  return result;
};
