import { rawdata } from './autogen.zonedata';
import { RawData } from './types';
import { binarySearch, vuintDecode, z85Decode, zigzagDecode } from '@phensley/cldr-utils';

export interface ZoneInfo {
  zoneid: string;
  abbr: string;
  dst: number;
  offset: number;
}

export interface Tz {
  fromUTC(zoneid: string, utc: number): ZoneInfo | undefined;
  // TODO:
  // fromWall(zoneid: string, utc: number): ZoneInfo | undefined;
  resolveId(id: string): string | undefined;
  utcZone(): ZoneInfo;
  zoneIds(): string[];
}

export class TzImpl {

  /** Mapping of canonical time zone ids to index */
  private zoneindex: Map<string, number> = new Map();

  /** Mapping of proper- and lower-cased time zone and alias ids to canonical time zone id */
  private linkindex: Map<string, string> = new Map();

  /** Array of time zone ids */
  private _zoneids: string[];

  /** Array of untils and deltas */
  private untilindex: number[];

  /** Raw un-decoded zone info */
  private rawzoneinfo: string[];

  /** Decoded zone records */
  private zonerecords: ZoneRecord[];

  /** Default UTC zone here for quick access */
  private utcinfo: ZoneInfo = { zoneid: 'Etc/UTC', abbr: 'UTC', dst: 0, offset: 0 };

  constructor(raw: RawData) {

    const zoneids = raw.zoneids.split('|')
      .map((e, i) => [e, i] as [string, number]);

    const links = raw.links.split('|')
      .map(e => { const [k, j] = e.split(':'); return [k, Number(j)] as [string, number]; });

    const addlink = (src: string, dst: string) => {
      // index a few supported forms of the time zone id or alias
      const lowersrc = src.toLowerCase();
      this.linkindex.set(src, dst);
      this.linkindex.set(lowersrc, dst);
    };

    this._zoneids = [];
    zoneids.forEach(i => {
      const id = i[0];
      this._zoneids.push(id);
      this.zoneindex.set(id, i[1]);

      // index the zone id as a link to itself, including the lowercase form.
      addlink(id, id);
    });

    links.forEach(i => {
      const alias = i[0];
      const id = zoneids[i[1]][0];
      addlink(alias, id);
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
    return this.lookup(zoneid, utc, true);
  }

  /**
   * Get the info for a time zone using a local "wall clock" timestamp.
   */
  // fromWall(zoneid: string, wall: number): ZoneInfo | undefined {
  //   return this.lookup(zoneid, wall, false);
  // }

  /**
   * UTC zone info.
   */
  utcZone(): ZoneInfo {
    return this.utcinfo;
  }

  /**
   * Resolve a lowercase time zone id or alias into the canonical proper-cased id.
   */
  resolveId(id: string): string | undefined {
    return this.linkindex.get(id);
  }

  /**
   * Returns an array of time zone ids.
   */
  zoneIds(): string[] {
    return this._zoneids;
  }

  /**
   * Lookup the time zone record and return the zone info.
   */
  private lookup(id: string, t: number, _isutc: boolean): ZoneInfo | undefined {
    const rec = this.record(id);
    if (rec) {
      const [zoneid, r] = rec;
      const res = r.fromUTC(t);
      // TODO: rework wall -> utc since it can require some guessing
      // const res = isutc ? r.fromUTC(t) : r.fromWall(t);
      return {
        ...res,
        zoneid
      };
    }
    return undefined;
  }

  /**
   * Find a record for a time zone id or alias.
   */
  private record(zoneid: string): [string, ZoneRecord] | undefined {
    const id = this.linkindex.get(zoneid);
    // console.log('record lookup', zoneid, '->', id);
    // Failed to match a time zone or alias in any of the supported forms
    if (id === undefined) {
      return undefined;
    }

    // Find the offset to the record for this zone.
    const i = this.zoneindex.get(id)!;

    // See if we've already decoded this zone
    let rec = this.zonerecords[i];
    if (rec === undefined) {
      // Decode raw data then clear the reference to release the memory
      const raw = this.rawzoneinfo[i];
      rec = new ZoneRecord(raw, this.untilindex);
      this.zonerecords[i] = rec;
      this.rawzoneinfo[i] = '';
    }

    // Return canonical time zone id with its record
    return [id, rec];
  }

}

/**
 * Information related to a single timezone.
 */
class ZoneRecord {

  readonly localtime: ZoneInfoRec[];
  readonly types: number[];
  readonly untils: number[];
  readonly len: number;

  constructor(raw: string, index: number[]) {
    const [ _info, _types, _untils ] = raw.split('\t');
    const untils = vuintDecode(z85Decode(_untils), zigzagDecode);
    const types = _types.split('').map(t => TYPES[t]);

    // Decode initial until and the deltas
    const len = untils.length;
    if (len > 0) {
      untils[0] = index[untils[0]] * 1000;
      for (let i = 1; i < len; i++) {
        untils[i] = untils[i - 1] + (index[untils[i]] * 1000);
      }
    }

    this.localtime = _info.split('|').map(this.decodeInfo);
    this.types = types;
    this.untils = untils;
    this.len = untils.length;
  }

  /**
   * Resolve the zone info using a UTC timestamp.
   */
  fromUTC(utc: number): ZoneInfoRec {
    const i = binarySearch(this.untils, true, utc);
    const type = i === -1 ? 0 : this.types[i];
    return this.localtime[type];
  }

  /**
   * Decode a single zone info record.
   */
  private decodeInfo(raw: string): ZoneInfoRec {
    const [ abbr, _dst, _offset ] = raw.split(':');
    return {
      abbr,
      dst: Number(_dst),
      offset: Number(_offset) * 1000
    };
  }

}

const TYPES = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  .reduce((p, c, i) => {
    p[c] = i;
    return p;
  }, {} as { [x: string]: number });

interface ZoneInfoRec {
  abbr: string;
  dst: number;
  offset: number;
}

export const TZ: Tz = new TzImpl(rawdata);
