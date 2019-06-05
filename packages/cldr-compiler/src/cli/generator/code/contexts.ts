import { lineWrap, Code, HEADER, NOLINT_MAXLINE } from './util';

export const getContexts = (data: any): Code[] => {
  let code = HEADER;

  const transforms = data.contextTransforms;
  const _transforms = transforms.map((c: string) => `'${c}'`);
  code += `export type ContextTransformFieldType = (\n`;
  code += lineWrap(80, '|', _transforms);
  code += ');\n\n';

  code += NOLINT_MAXLINE;
  code += `export const ContextTransformFieldValues: ContextTransformFieldType[] = ('`;
  code += transforms.join(' ');
  code += `').split(' ') as ContextTransformFieldType[];\n`;

  return [
    Code.schema(['schema', 'general', 'autogen.context.ts'], code)
  ];

};
