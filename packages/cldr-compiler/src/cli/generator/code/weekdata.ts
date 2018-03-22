import { Code, HEADER, NOLINT } from './util';

type MapType = { [x: string]: number };

const DIGIT = /\d/g;

const key = (k: string): string => DIGIT.test(k[0]) ? `'${k}'` : k;

const encode = (map: MapType): string => {
  let raw = '';
  Object.keys(map).forEach(k => {
    if (raw.length > 0) {
      raw += ',';
    }
    raw += `${key(k)}:${map[k]}`;
  });
  return raw;
};

const DAYS: MapType = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 };

export const getWeekData = (data: any): Code[] => {
  const minDays: MapType = {};
  Object.keys(data.minDays).forEach(k => {
    minDays[k] = Number(data.minDays[k]);
  });

  const firstDay: MapType = {};
  Object.keys(data.firstDay).forEach(k => {
    if (k.indexOf('-alt-variant') !== -1) {
      return;
    }
    const name = data.firstDay[k];
    firstDay[k] = DAYS[name];
  });

  let code = HEADER + NOLINT;
  code += `export const weekFirstDay: { [x: string]: number } = {${encode(firstDay)}};\n\n`;

  code += NOLINT;
  code += `export const weekMinDays: { [x: string]: number } = {${encode(minDays)}};\n`;

  return [
    Code.core(['internals', 'calendars', 'autogen.weekdata.ts'], code)
  ];
};
