import { parseLanguageTag } from '@phensley/cldr-core';
import { Code, HEADER, NOLINT } from './util';

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

  let code = HEADER + NOLINT;
  code += 'export const timeData: { [x: string]: { [y: string]: string } } = {';
  Object.keys(timeData).forEach((language, i) => {
    if (i > 0) {
      code += ',';
    }
    code += language ? language : "''";
    code += ':{';
    Object.keys(timeData[language]).forEach((region, j) => {
      const s = timeData[language][region];
      if (j > 0) {
        code += ',';
      }
      region = /\d/.test(region[0]) ? `'${region}'` : region;
      code += `${region}:'${s}'`;
    });
    code += '}';
  });
  code += '};\n';

  return [
    Code.core(['internals', 'calendars', 'autogen.timedata.ts'], code)
  ];
};
