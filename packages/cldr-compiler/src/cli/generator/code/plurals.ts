import { formatSource, Code, HEADER } from './util';

export const getPlurals = (data: any): Code[] => {
  const { cardinals, ordinals, expressions } = data;
  const type = '{ [x: string]: string }';

  let code = HEADER;
  code += formatSource(`export const cardinalRules: ${type} = ${JSON.stringify(cardinals)};\n\n`);
  code += formatSource(`export const ordinalRules: ${type} = ${JSON.stringify(ordinals)};\n\n`);
  code += formatSource(`export const expressions: string[] = ${JSON.stringify(expressions)};\n`);

  return [
    Code.core(['systems', 'plurals', 'autogen.rules.ts'], code)
  ];
};
