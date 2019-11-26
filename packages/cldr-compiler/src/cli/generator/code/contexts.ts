import { lineWrap, Code, HEADER, NOLINT_MAXLINE } from './util';

export const getContexts = (data: any): Code[] => {
  const result: Code[] = [];

  const transforms = data.contextTransforms;
  const _transforms = transforms.map((c: string) => `'${c}'`);

  let code = HEADER;
  code += `export type ContextTransformFieldType = (\n`;
  code += lineWrap(80, '|', _transforms);
  code += ');\n';

  result.push(Code.types(['autogen.context.ts'], code));

  code = HEADER;
  code += "import { ContextTransformFieldType } from '@phensley/cldr-types';\n\n";
  code += NOLINT_MAXLINE;
  code += `export const ContextTransformFieldValues: ContextTransformFieldType[] = ('`;
  code += transforms.join(' ');
  code += `').split(' ') as ContextTransformFieldType[];\n`;

  result.push(Code.schema(['schema', 'autogen.context.ts'], code));

  return result;
};
