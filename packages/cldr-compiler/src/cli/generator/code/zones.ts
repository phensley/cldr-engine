import { TZ } from '@phensley/timezone';
import { lineWrap, Code, HEADER, NOLINT_MAXLINE } from './util';
import chalk from 'chalk';

class IdArray {

  readonly array: string[] = [];
  private index: any = {};
  private sequence: number = 0;

  add(key: string): number {
    let id = this.index[key];
    if (id === undefined) {
      id = this.sequence++;
      this.index[key] = id;
      this.array.push(key);
    }
    return id;
  }
}

// TODO: move this or remove it
// class FrequencySet<T> {

//   private elems: T[] = [];
//   private freq: Map<T, number> = new Map();

//   /**
//    * Add an element to the set or update its frequency.
//    */
//   add(elem: T): void {
//     const freq = this.freq.get(elem) || 0;
//     if (freq === 0) {
//       this.elems.push(elem);
//     }
//     this.freq.set(elem, freq + 1);
//   }

//   /**
//    * Return the elements, sorted by frequency MOST to LEAST.
//    */
//   sort(): T[] {
//     const res = this.elems.slice();
//     res.sort((a: T, b: T) => {
//       const fa = this.freq.get(a) || -1;
//       const fb = this.freq.get(b) || -1;
//       return fb < fa ? -1 : fa === fb ? 0 : 1;
//     });
//     return res;
//   }
// }

interface Metazones {
  zoneindex: string;
  metazoneids: string;
  index: string;
  offsets: string;
  untils: string;
}

// These zones have no metazone mapping intentionally.
const IGNORED_ZONES = new Set<string>([
  'Etc/GMT+1',
  'Etc/GMT+2',
  'Etc/GMT+3',
  'Etc/GMT+4',
  'Etc/GMT+5',
  'Etc/GMT+6',
  'Etc/GMT+7',
  'Etc/GMT+8',
  'Etc/GMT+9',
  'Etc/GMT+10',
  'Etc/GMT+11',
  'Etc/GMT+12',
  'Etc/GMT-1',
  'Etc/GMT-2',
  'Etc/GMT-3',
  'Etc/GMT-4',
  'Etc/GMT-5',
  'Etc/GMT-6',
  'Etc/GMT-7',
  'Etc/GMT-8',
  'Etc/GMT-9',
  'Etc/GMT-10',
  'Etc/GMT-11',
  'Etc/GMT-12',
  'Etc/GMT-13',
  'Etc/GMT-14',
]);

const base36 = (n: number) => n.toString(36);

const buildMetaZones2 = (data: any): Metazones => {
  const metazoneIndex = new IdArray();

  const offsets: number[] = [];
  const untils: number[] = [];
  const index: number[] = [];

  const zonemap = new Map<number, number>();

  // Array of canonical time zone ids
  const zoneids = TZ.zoneIds();

  Object.keys(data).forEach((id, mi) => {
    // Map the metazone id to the index of the time zone id in the TZ data.
    let zi = zoneids.indexOf(id);
    if (zi === -1) {
      // We have an alias, e.g. Africa/Addis_Ababa, so follow the link to
      // get the correct tzdb id.
      const zid = TZ.resolveId(id);
      if (zid === undefined) {
        throw new Error(`${chalk.red('Error')} tzdb / cldr mismatch. zone id failed ${id}`);
      }
      zi = zoneids.indexOf(zid);
    }

    zonemap.set(zi, mi);
  });

  const zoneindex: number[] = [];
  zoneids.forEach((id, zi) => {
    let mi = zonemap.get(zi);
    if (mi === undefined) {
      // Special case, map this to Etc/GMT's metazone
      if (id === 'Etc/UTC') {
        zi = zoneids.indexOf('Etc/GMT');
        mi = zonemap.get(zi);
      } else if (!IGNORED_ZONES.has(id)) {
        console.log(`${chalk.red('Warning')}: ${id} has no metazone`);
      }
    }
    zoneindex.push(mi === undefined ? -1 : mi);
  });

  // Metazone time zone ids
  Object.keys(data).forEach(id => {
    const start = offsets.length;
    const ranges = data[id].reverse();
    ranges.forEach((range: [string, number, number]) => {
      const [mzid, from] = range;
      const offset = metazoneIndex.add(mzid);
      offsets.push(offset);
      untils.push(from === -1 ? from : from / 1000);
    });

    const end = offsets.length;
    index.push(start);
    index.push(end);
  });

  return {
    zoneindex: zoneindex.map(base36).join(' '),
    metazoneids: metazoneIndex.array.join(' '),
    index: index.map(base36).join(' '),
    offsets: offsets.map(base36).join(' '),
    untils: untils.map(base36).join(' ')
  };
};

const buildStableIdMapping = (data: any): string => {
  const tzids = TZ.zoneIds();
  const stableids = data.timeZoneIds;
  const res: string[] = [];
  for (const stableid of stableids) {
    const resolved = TZ.resolveId(stableid);
    if (resolved === undefined || stableid === resolved) {
      continue;
    }
    const i = tzids.indexOf(resolved);
    // const j = stableids.indexOf(stableid);
    res.push(`${i}:${stableid}`);
  }
  return res.join('|');
};

/**
 * Construct timezone source.
 */
export const getZones = (data: any): Code[] => {
  const result: Code[] = [];

  const metazonedata = buildMetaZones2(data.metaZoneRanges);

  // Map canoical tzdb identifier to cldr stable id.
  const stableidmap = buildStableIdMapping(data);

  let code = HEADER + '/* tslint:disable:max-line-length */\n';

  code += `export const metazoneData = {\n`;
  code += `  // mapping of time zone's array index to metazone's array index\n`;
  code += `  zoneindex: '${metazonedata.zoneindex}',\n\n`;

  code += `  // array of metazone ids\n`;
  code += `  metazoneids: '${metazonedata.metazoneids}'.split(' '),\n\n`;

  code += `  // array of start/end slice indices into offsets and untils arrays\n`;
  code += `  index: '${metazonedata.index}',\n\n`;

  code += `  // offset indicating which metazone id to use at a given until\n`;
  code += `  offsets: '${metazonedata.offsets}',\n`;

  code += `  // until timestamps\n`;
  code += `  untils: '${metazonedata.untils}',\n`;

  code += `  // mapping of tzdb id back to cldr stable id used for schema lookups\n`;
  code += `  stableids: '${stableidmap}'\n`;
  code += `};\n`;

  result.push(Code.core(['systems', 'calendars', 'autogen.zonedata.ts'], code));

  // Build autogen.timezones.ts source
  code = HEADER;

  // const timeZoneType = lineWrap(60, ' | ', data.timeZoneIds.map((k: string) => `'${k}'`));
  // code += `export type TimeZoneType = (\n${timeZoneType});\n\n`;

  code += "import { MetaZoneType } from '@phensley/cldr-types';\n\n";

  code += NOLINT_MAXLINE;
  code += '/** @public */\n';
  code += `export const TimeZoneStableIds: string[] = ('`;
  code += data.timeZoneIds.join(' ');
  code += `').split(' ');\n\n`;

  code += NOLINT_MAXLINE;
  code += '/** @public */\n';
  code += `export const MetaZoneValues: MetaZoneType[] = ('`;
  code += data.metaZoneIds.join(' ');
  code += `').split(' ') as MetaZoneType[];\n`;

  result.push(Code.schema(['schema', 'autogen.timezones.ts'], code));

  // code += 'export const enum TimeZone {';
  // data.timeZoneIds.forEach((k: string) => {
  //   const name = enumName(k);
  //   code += `\n  ${name} = '${k}',`;
  // });
  // code += '\n}\n\n';

  code = HEADER;
  code += NOLINT_MAXLINE;
  const metaZoneType = lineWrap(60, ' | ', data.metaZoneIds.map((k: string) => `'${k}'`));
  code += '/** @public */\n';
  code += `export type MetaZoneType = ${metaZoneType};\n`;

  result.push(Code.types(['autogen.timezones.ts'], code));

  return result;
};
