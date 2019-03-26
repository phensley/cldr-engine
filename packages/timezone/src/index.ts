import { rawdata } from './autogen.zonedata';
import { RawData } from './types';
import { binarySearch, vuintDecode, z85Decode, zigzagDecode } from '@phensley/cldr-utils';

export interface ZoneInfo {
  abbr: string;
  dst: number;
  offset: number;
}

export interface Tz {
  fromUTC(zoneid: string, utc: number): ZoneInfo | undefined;
  fromWall(zoneid: string, utc: number): ZoneInfo | undefined;
}

export class TzImpl {

  /** Mapping of proper- and lower-cased time zone ids to index */
  private zoneindex: Map<string, number> = new Map();

  /** Mapping of proper- and lower-cased alias ids to time zone id */
  private linkindex: Map<string, string> = new Map();

  /** Array of time zone ids */
  private zoneids: string[];

  /** Array of untils and deltas */
  private untilindex: number[];

  /** Raw un-decoded zone info */
  private rawzoneinfo: string[];

  /** Decoded zone records */
  private zonerecords: ZoneRecord[];

  /** Default UTC zone here for quick access */
  private utcinfo: ZoneInfo = { abbr: 'UTC', dst: 0, offset: 0 };

  constructor(raw: RawData = rawdata) {

    const zoneids = raw.zoneids.split('|')
      .map((e, i) => [e, i] as [string, number]);

    const links = raw.links.split('|')
      .map(e => { const [k, j] = e.split(':'); return [k, Number(j)] as [string, number]; });

    this.zoneids = [];
    zoneids.forEach(i => {
      const id = i[0];
      this.zoneids.push(id);
      this.zoneindex.set(id, i[1]);
      this.zoneindex.set(id.toLocaleLowerCase(), i[1]);
    });

    links.forEach(i => {
      const alias = i[0];
      const id = zoneids[i[1]][0];
      this.linkindex.set(alias, id);
      this.linkindex.set(alias.toLowerCase(), id);
    });

    this.untilindex = vuintDecode(z85Decode(raw.index), zigzagDecode);
    this.rawzoneinfo = raw.zoneinfo;
    this.zonerecords = new Array(raw.zoneinfo.length);

    raw.zoneids = '';
    raw.links = '';
    raw.index = '';
  }

  /**
   * Get the info for a time zone using a UTC timestamp.
   */
  fromUTC(zoneid: string, utc: number): ZoneInfo | undefined {
    const r = this.record(zoneid);
    return r ? r.fromUTC(utc) : r;
  }

  /**
   * Get the info for a time zone using a local "wall clock" timestamp.
   */
  fromWall(zoneid: string, wall: number): ZoneInfo | undefined {
    const r = this.record(zoneid);
    return r ? r.fromWall(wall) : r;
  }

  /**
   * UTC zone info.
   */
  utcZone(): ZoneInfo {
    return this.utcinfo;
  }

  private record(zoneid: string): ZoneRecord | undefined {
    let id: string | undefined = zoneid;
    let i = this.zoneindex.get(id);

    // If time zone id lookup failed, try to find an alias
    if (i === undefined) {
      id = this.linkindex.get(zoneid);

      // id found, set the index
      if (id) {
        i = this.zoneindex.get(id);
      }
    }

    // Failed to match a time zone id or alias
    if (i === undefined) {
      return undefined;
    }

    // See if we've already decoded this zone
    let rec = this.zonerecords[i];
    if (rec === undefined) {
      // Decode raw data then clear the reference to release the memory
      const raw = this.rawzoneinfo[i];
      rec = new ZoneRecord(raw, this.untilindex);
      this.zonerecords[i] = rec;
      this.rawzoneinfo[i] = '';
    }
    return rec;
  }

}

/**
 * Information related to a single timezone.
 */
class ZoneRecord {

  readonly localtime: ZoneInfo[];
  readonly types: number[];
  readonly untils: number[];
  readonly len: number;

  constructor(raw: string, index: number[]) {
    const [ _info, _types, _untils ] = raw.split('\t');
    const untils = vuintDecode(z85Decode(_untils), zigzagDecode);

    // Decode initial until and the deltas
    const len = untils.length;
    if (len > 0) {
      untils[0] = index[untils[0]] * 1000;
      for (let i = 1; i < len; i++) {
        untils[i] = untils[i - 1] + (index[untils[i]] * 1000);
      }
    }

    this.localtime = _info.split('|').map(this.decodeInfo);
    this.types = _types.split('').map(Number);
    this.untils = untils;
    this.len = untils.length;
  }

  /**
   * Resolve the zone info using a UTC timestamp.
   */
  fromUTC(utc: number): ZoneInfo {
    const i = binarySearch(this.untils, true, utc);
    const type = i === -1 ? 0 : this.types[i];
    return this.localtime[type];
  }

  /**
   * Resolve the zone info using a local "wall clock" timestamp.
   */
  fromWall(wall: number): ZoneInfo {
    let i = binarySearch(this.untils, false, wall);
    let type: number;

    if (i === this.len) {
      // went off the top end, so return the last info
      type = this.types[this.len - 1];
      return this.localtime[type];
    }

    // check if the adjusted time is <= wall time
    type = this.types[i];
    const loc = this.localtime[type];
    if (this.untils[i] + loc.offset <= wall) {
      return loc;
    }

    // select the next until down and retry
    i--;

    // went off the bottom end, return the first info
    if (i === -1) {
      return this.localtime[0];
    }

    type = this.types[i];
    return this.localtime[type];
  }

  /**
   * Decode a single zone info record.
   */
  private decodeInfo(raw: string): ZoneInfo {
    const [ abbr, _dst, _offset ] = raw.split(':');
    return {
      abbr,
      dst: Number(_dst),
      offset: Number(_offset) * 1000
    };
  }

}

export const TZ = new TzImpl();
