import { formatSource, Code, HEADER } from './util';

const encode = (data: any) => {
  if (typeof data === 'number') {
    return data;
  }
  return Object.keys(data).map(lang => {
    const group = data[lang];
    let s = `"${lang}":`;
    if (typeof group === 'number') {
      return s + group;
    }
    s += '{' + Object.keys(group).map(k => `${k}:${group[k]}`).join(',') + '}';
    return s;
  }).join(',');
};

export const getPluralRanges = (data: any): Code[] => {
  const { pluralranges } = data;

  let code = HEADER;
  code += formatSource(`export const pluralRanges: any = {${encode(pluralranges)}}`);
  return [
    Code.plurals(['autogen.ranges.ts'], code)
  ];
};
