import { rawdata } from './autogen.zonedata';
import { RawData } from './types';
import { binarySearch, vuintDecode, z85Decode, zigzagDecode } from '@phensley/cldr-utils';

export interface ZoneInfo {
  abbr: string;
  dst: number;
  offset: number;
}

export class ZoneCache {

  /** Arra of proper- and lower-cased time zone ids */
  private zoneids: Map<string, number> = new Map();
  private links: Map<string, string> = new Map();
  private index: number[];
  private rawzoneinfo: string[];
  private zonerecords: ZoneRecord[];

  private utcindex!: number;

  constructor(raw: RawData = rawdata) {

    const zoneids = raw.zoneids.split('|')
      .map((e, i) => [e, i] as [string, number]);

    const links = raw.links.split('|')
      .map(e => { const [k, j] = e.split(':'); return [k, Number(j)] as [string, number]; });

    zoneids.forEach(i => {
      const id = i[0];
      if (id === 'Etc/UTC') {
        // Create shorter 'UTC' alias
        this.utcindex = i[1];
        this.zoneids.set('UTC', i[1]);
        this.zoneids.set('utc', i[1]);
      }
      this.zoneids.set(id, i[1]);
      this.zoneids.set(id.toLocaleLowerCase(), i[1]);
    });

    links.forEach(i => {
      const alias = i[0];
      const id = zoneids[i[1]][0];
      this.links.set(alias, id);
      this.links.set(alias.toLowerCase(), id);
    });

    this.index = vuintDecode(z85Decode(raw.index), zigzagDecode);
    this.rawzoneinfo = raw.zoneinfo;
    this.zonerecords = new Array(raw.zoneinfo.length);

    raw.zoneids = '';
    raw.links = '';
    raw.index = '';
  }

  get(zoneid: string, utc: number): ZoneInfo {
    let id: string | undefined = zoneid;
    let i = this.zoneids.get(id);

    // If time zone id lookup failed, try to find an alias
    if (i === undefined) {
      id = this.links.get(zoneid);

      // id found, set the index
      if (id) {
        i = this.zoneids.get(id);
      }
    }

    // Failed to match a time zone id or alias, so default to UTC
    if (i === undefined) {
      i = this.utcindex;
    }

    // See if we've already decoded this zone
    let rec = this.zonerecords[i];
    if (rec === undefined) {
      // Decode raw data then clear the reference to release the memory
      const raw = this.rawzoneinfo[i];
      rec = this.decode(raw);
      this.zonerecords[i] = rec;
      this.rawzoneinfo[i] = '';
    }
    const j = binarySearch(rec.untils, utc);
    const type = rec.types[j];
    return rec.localtime[type];
  }

  /**
   * Decode a time zone record.
   */
  private decode(raw: string): ZoneRecord {
    const [ _info, _types, _untils ] = raw.split('\t');
    const untils = vuintDecode(z85Decode(_untils), zigzagDecode);

    // Decode initial until and the deltas
    const len = untils.length;
    if (len > 0) {
      untils[0] = this.index[untils[0]] * 1000;
      for (let i = 1; i < len; i++) {
        untils[i] = untils[i - 1] + (this.index[untils[i]] * 1000);
      }
    }

    return {
      localtime: _info.split('|').map(this.decodeInfo),
      types: _types.split('').map(Number),
      untils
    };
  }

  /**
   * Decode a single zone info record.
   */
  private decodeInfo(raw: string): ZoneInfo {
    const [ abbr, _dst, _offset ] = raw.split(':');
    return {
      abbr,
      dst: Number(_dst),
      offset: Number(_offset)
    };
  }
}

interface ZoneRecord {
  localtime: ZoneInfo[];
  types: number[];
  untils: number[];
}
