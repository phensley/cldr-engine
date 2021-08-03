import { getSupplemental } from '../../../cldr';
import { Code, HEADER, NOLINT } from './util';

const DIGIT = /\d/g;

const key = (k: string): string => (DIGIT.test(k[0]) ? `'${k}'` : k);

const encode = (map: { [x: string]: number[] }): string => {
  let raw = '';
  Object.keys(map).forEach((k) => {
    if (raw.length > 0) {
      raw += ',';
    }
    raw += `${key(k)}:${JSON.stringify(map[k])}`;
  });
  return raw;
};

export const getCalendarPrefs = (_data: any): Code[] => {
  const supplemental = getSupplemental();
  const prefsData = supplemental.CalendarPreferences;

  let seq = 0;
  const calendarIdMap: { [x: string]: number } = {};
  const calendarIds: string[] = [];
  const getId = (s: string) => {
    let r = calendarIdMap[s];
    if (r === undefined) {
      calendarIdMap[s] = r = seq++;
      calendarIds.push(s);
    }
    return r;
  };

  const calendarPrefs: { [x: string]: number[] } = {};
  Object.keys(prefsData).forEach((id) => {
    const prefs = prefsData[id].map(getId);
    calendarPrefs[id] = prefs;
  });

  let code = HEADER + NOLINT;
  code += `export const calendarIds: string[] = [${calendarIds.map((c) => `'${c}'`).join(', ')}];\n\n`;

  code += NOLINT;
  code += `export const calendarPrefData: { [x: string]: number[] } = {${encode(calendarPrefs)}};\n`;

  return [Code.core(['internals', 'calendars', 'autogen.calprefs.ts'], code)];
};
