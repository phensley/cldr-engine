import * as fs from 'fs';
import { join } from 'path';
import { encoding } from '@phensley/cldr-core';
import { getSupplemental } from '../../../cldr';
import { HEADER, Code, lineWrap, escapeString, formatSource, enumName } from './util';

const { base100encode, bitarrayCreate } = encoding;

const buildZoneDST = (): [any, any, any] => {
  const path = join(__dirname, '..', '..', '..', '..', 'data', 'timezones', 'temp', 'tzdata.json');
  const raw = fs.readFileSync(path);
  const tzdata = JSON.parse(raw.toString());

  const untilsIndex: any = {};
  const untilsArray: string[] = [];
  let untilsSeq = 0;

  const indexUntil = (k: string) => {
    let id = untilsIndex[k];
    if (id === undefined) {
      id = base100encode(untilsSeq++);
      untilsArray.push(k);
      untilsIndex[k] = id;
    }
    return id;
  };

  const inverted: any = {};
  for (const row of tzdata) {
    const [ name, _indexed, _untils, _dsts ] = row;
    const [ _offsets, _index ] = _indexed;

    const offsets = _offsets.join(' ');
    const index = _index.join('');
    const untils = _untils.map(base100encode).map(indexUntil).join(' ');
    const dsts = bitarrayCreate(_dsts).map(base100encode).join(' ');

    const key = [offsets, index, untils, dsts].join('\t');
    const ids = inverted[key] || [];
    ids.push(name);
    inverted[key] = ids;
  }

  const zoneDST: any = {};
  const zoneLinks: any = {};
  Object.keys(inverted).forEach(info => {
    const keys = inverted[info];
    const first = keys[0];
    zoneDST[first] = info;
    keys.slice(1).forEach((k: string) => {
      zoneLinks[k] = first;
    });
  });
  return [zoneDST, zoneLinks, untilsArray];
};

export const getZones = (data: any): Code[] => {
  const result: Code[] = [];

  const [ zoneDST, zoneLinks, untilsArray ] = buildZoneDST();

  let code = HEADER + '/* tslint:disable:max-line-length */\n';
  code += `export const untilsIndex: string = '`;
  code += untilsArray.join(' ');
  code += `';\n\n`;

  code += `export const zoneDST: { [x: string]: string } = {\n`;
  Object.keys(zoneDST).forEach(k => {
    const str = escapeString(zoneDST[k]);
    code += `  '${k}': ${str},\n`;
  });
  code += '};\n\n';

  code += `export const zoneLinks: { [x: string]: string } = {\n`;
  Object.keys(zoneLinks).forEach(k => {
    const str = escapeString(zoneLinks[k]);
    code += `  '${k}': ${str},\n`;
  });
  code += '};\n\n';

  code += formatSource(`export const metazoneRanges: { [x: string]: [string, number, number][] } =` +
    JSON.stringify(data.metaZoneRanges) +
    ';\n'
  );

  result.push(Code.core(['types', 'autogen.zones.ts'], code));

  code = `${HEADER}import { makeEnum, makeKeyedEnum } from '../../types/enum';\n\n`;
  code += 'export const [ TimeZone, TimeZoneValues ] = makeKeyedEnum([';
  data.timeZoneIds.forEach((k: string) => {
    const name = enumName(k);
    code += `\n  ['${name}', '${k}'],`;
  });
  code += '\n]);\n\n';

  const timeZoneType = lineWrap(60, ' | ', data.timeZoneIds.map((k: string) => `'${k}'`));
  code += `export type TimeZoneType = ${timeZoneType};\n\n`;

  code += 'export const [ MetaZone, MetaZoneValues ] = makeEnum([';
  data.metaZoneIds.forEach((k: string) => {
    code += `\n  '${k}',`;
  });
  code += '\n]);\n\n';

  const metaZoneType = lineWrap(60, ' | ', data.metaZoneIds.map((k: string) => `'${k}'`));
  code += `export type MetaZoneType = ${metaZoneType};\n`;

  result.push(Code.schema(['schema', 'timezones', 'autogen.timezones.ts'], code));

  return result;
};
