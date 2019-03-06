import * as fs from 'fs';
import { join } from 'path';
import { base100encode, bitarrayCreate } from '@phensley/cldr-utils';
import { enumName, escapeString, lineWrap, Code, HEADER } from './util';

class IdArray {

  readonly array: string[] = [];
  private index: any = {};
  private sequence: number = 0;

  add(key: string): string {
    let id = this.index[key];
    if (id === undefined) {
      id = base100encode(this.sequence++);
      this.index[key] = id;
      this.array.push(key);
    }
    return id;
  }
}

/**
 * Process tzdata and encode into a compact form.
 */
const buildZoneDST = (metazones: any): [any, any, any] => {
  const path = join(__dirname, '..', '..', '..', '..', 'data', 'timezones', 'temp', 'tzdata.json');
  const raw = fs.readFileSync(path);
  const tzdata = JSON.parse(raw.toString());

  const untilsIndex = new IdArray();
  const inverted: any = {};
  for (const row of tzdata) {
    const [ name, _indexed, _untils, _dsts ] = row;
    const metazone = metazones[name];
    if (metazone === undefined) {
      continue;
    }
    const [ _offsets, _index ] = _indexed;

    const offsets = _offsets.join(' ');
    const index = _index.join('');
    const untils = _untils.map(base100encode).map((k: string) => untilsIndex.add(k)).join(' ');
    const dsts = bitarrayCreate(_dsts).map(base100encode).join(' ');

    const key = [offsets, index, untils, dsts, metazone].join('\t');
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
  return [zoneDST, zoneLinks, untilsIndex.array];
};

/**
 * Process cldr metazone time ranges into a compact form.
 */
const buildMetaZones = (data: any): [any, any] => {
  const zoneIdIndex = new IdArray();
  const metazoneIndex = new IdArray();
  const metazones: any = {};
  Object.keys(data).forEach(zoneId => {
    const ranges = data[zoneId].reverse();
    const offsets: string[] = [];
    const untils: string[] = [];
    ranges.forEach((range: [string, number, number]) => {
      const [ metazoneId, from, to ] = range;
      const offset = metazoneIndex.add(metazoneId);
      offsets.push(offset);
      untils.push(base100encode(from));
    });
    metazones[zoneId] = [offsets.join(' '), untils.join(' ')].join('\t');
  });
  return [metazoneIndex.array.join(' '), metazones];
};

/**
 * Construct timezone source.
 */
export const getZones = (data: any): Code[] => {
  const result: Code[] = [];

  // Build autogen.zones.ts source
  const [metazoneIds, metazones] = buildMetaZones(data.metaZoneRanges);
  const [ zoneDST, zoneLinks, untilsArray ] = buildZoneDST(metazones);

  let code = HEADER + '/* tslint:disable:max-line-length */\n';
  code += `export const untilsLookup: string[] = '`;
  code += untilsArray.join(' ');
  code += `'.split(' ');\n\n`;

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

  code += `export const metaZoneIds: string[] = '${metazoneIds}'.split(' ');\n`;

  result.push(Code.core(['systems', 'calendars', 'autogen.zonedata.ts'], code));

  // Build autogen.timezones.ts source
  code = `${HEADER}`;

  const timeZoneType = lineWrap(60, ' | ', data.timeZoneIds.map((k: string) => `'${k}'`));
  code += `export type TimeZoneType = (\n${timeZoneType});\n\n`;

  code += 'export const TimeZoneValues: TimeZoneType[] = [\n';
  code += lineWrap(60, ',', data.timeZoneIds.map((id: string) => `'${id}'`));
  code += '\n];\n\n';

  code += 'export const enum TimeZone {';
  data.timeZoneIds.forEach((k: string) => {
    const name = enumName(k);
    code += `\n  ${name} = '${k}',`;
  });
  code += '\n}\n\n';

  const metaZoneType = lineWrap(60, ' | ', data.metaZoneIds.map((k: string) => `'${k}'`));
  code += `export type MetaZoneType = ${metaZoneType};\n\n`;

  code += 'export const MetaZoneValues: MetaZoneType[] = [';
  data.metaZoneIds.forEach((k: string) => {
    code += `\n  '${k}',`;
  });
  code += '\n];\n';

  result.push(Code.schema(['schema', 'timezones', 'autogen.timezones.ts'], code));

  return result;
};
