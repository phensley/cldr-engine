import { parseLanguageTag } from '@phensley/cldr-core';
import { escapeString, Code, HEADER, NOLINT } from './util';

export const getTimeData = (data: any): Code[] => {
  const timeData: { [x: string]: { [y: string]: string } } = {};

  Object.keys(data.timeData).forEach(k => {
    let tag = parseLanguageTag(k);
    if (!tag.hasRegion()) {
      tag = parseLanguageTag(`und-${k}`);
    }

    const { _allowed, _preferred } = data.timeData[k];
    const language = tag.hasLanguage() ? tag.language() : '';
    const region = tag.region();
    const record: { [y: string]: string } = timeData[language] || {};
    record[region] = `${_allowed}|${_preferred}`;
    timeData[language] = record;
  });

  const strings: string[] = [];

  let code = HEADER + NOLINT;
  code += 'export const timeData: { [x: string]: { [y: string]: number } } = {';
  Object.keys(timeData).forEach((language, i) => {
    if (i > 0) {
      code += ',';
    }
    code += language ? language : "''";
    code += ':{';
    Object.keys(timeData[language]).forEach((region, j) => {
      const s = timeData[language][region];

      let k = strings.indexOf(s);
      if (k === -1) {
        k = strings.length;
        strings.push(s);
      }

      if (j > 0) {
        code += ',';
      }
      region = /\d/.test(region[0]) ? `'${region}'` : region;
      code += `${region}:${k}`;
    });
    code += '}';
  });
  code += '};\n\n';

  code += NOLINT;
  code += `export const timeStrings: string[] = [`;
  code += `  ${strings.map(s => escapeString(s, "'")).join(',')}`;
  code += `];\n`;

  return [
    Code.core(['internals', 'calendars', 'autogen.timedata.ts'], code)
  ];
};
