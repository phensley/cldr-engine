import { rawdata } from './autogen.zonedata';
import { RawData } from './types';
import { binarySearch } from '@phensley/cldr-utils';

export { RawData } from './types';

/**
 * Represents abbreviation, daylight savings and timezone offset for
 * a single time zone.
 *
 * @public
 */
export interface ZoneInfo {
  /**
   * Time zone identifier.
   */
  zoneid: string;

  /**
   * Time zone 3-character abbreviation.
   */
  abbr: string;

  /**
   * Flag indicating the zone is currently in daylight savings time.
   */
  dst: number;

  /**
   * Time zone offset from UTC.
   */
  offset: number;
}

export interface ZoneMeta {
  /**
   * Time zone identifier. Corrected if the metadata was looked up using an alias.
   */
  zoneid: string;

  /**
   * Current standard offset from UTC, in milliseconds.
   */
  stdoffset: number;

  /**
   * Latitude of the zone's "principal location".
   */
  latitude: number;

  /**
   * Longitude of the zone's "principal location".
   */
  longitude: number;

  /**
   * ISO 3166 2-character country code for all countries which
   * overlap the timezone.
   */
  countries: string[];
}

/**
 * Interface to accessing time zone data.
 *
 * @public
 */
export interface Tz {
  /**
   * Get the info for a time zone using a UTC timestamp.
   */
  fromUTC(zoneid: string, utc: number): ZoneInfo | undefined;

  /**
   * Get the info for a time zone using a Wall Clock timestamp. This returns
   * the corresponding UTC timestamp and the timezone info record, or undefined
   * if the zone lookup fails.
   *
   * Since daylight savings time can result in a clock being moved backwards,
   * there is some ambiguity in resolving a wall clock time to the corresponding
   * UTC time. For example, on November 8 2020 in New York, the time 1:30 AM
   * occurs twice: once before the timezone boundary of 2:00 AM is reached, and
   * again after the clock is set back 1 hour to 1:00 AM. This method attempts
   * to resolve the ambiguity in the most intuitive way.
   */
  fromWall(zoneid: string, wall: number): [number, ZoneInfo] | undefined;

  /**
   * Resolve a lowercase time zone id or alias into the canonical proper-cased id.
   */
  resolveId(id: string): string | undefined;

  /**
   * UTC zone info.
   */
  utcZone(): ZoneInfo;

  /**
   * Metadata related to a zone, such as the list of country codes that overlap with
   * the zone, the latitude and longitude, and the current standard offset, in milliseconds.
   * These can be used to display user interfaces for selecting a zone.
   */
  zoneMeta(id: string): ZoneMeta;

  /**
   * Returns an array of time zone ids.
   */
  zoneIds(): string[];
}

const numarray = (s: string) => (s ? s.split(' ').map((n) => parseInt(n, 36)) : []);

/**
 * Implements the time zone lookup.
 *
 * @public
 */
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
    const zoneids = raw.zoneids.split('|').map((e, i) => [e, i] as [string, number]);

    const links = raw.links.split('|').map((e) => {
      const [k, j] = e.split(':');
      return [k, Number(j)] as [string, number];
    });

    const addlink = (src: string, dst: string) => {
      // index a few supported forms of the time zone id or alias
      const lowersrc = src.toLowerCase();
      this.linkindex.set(src, dst);
      this.linkindex.set(lowersrc, dst);
    };

    this._zoneids = [];
    zoneids.forEach((i) => {
      const id = i[0];
      this._zoneids.push(id);
      this.zoneindex.set(id, i[1]);

      // index the zone id as a link to itself, including the lowercase form.
      addlink(id, id);
    });

    links.forEach((i) => {
      const alias = i[0];
      const id = zoneids[i[1]][0];
      addlink(alias, id);
    });

    this.untilindex = numarray(raw.index);
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
    const r = this.lookup(zoneid, utc, true);
    return r ? r[1] : r;
  }

  /**
   * Get the info for a time zone using a local "wall clock" timestamp
   * for that zone.
   */
  fromWall(zoneid: string, wall: number): [number, ZoneInfo] | undefined {
    return this.lookup(zoneid, wall, false);
  }

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
   * Metadata related to a zone, such as the list of country codes that overlap with
   * the zone, the latitude and longitude, and the current standard offset, in milliseconds.
   * These can be used to display user interfaces for selecting a zone.
   */
  zoneMeta(id: string): ZoneMeta {
    const rec = this.record(id);
    if (rec) {
      return {
        zoneid: rec[0],
        stdoffset: rec[1].stdoff,
        latitude: rec[1].latitude,
        longitude: rec[1].longitude,
        countries: rec[1].countries,
      };
    }
    return {
      zoneid: id,
      stdoffset: 0,
      latitude: 0,
      longitude: 0,
      countries: [],
    };
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
  private lookup(id: string, t: number, isutc: boolean): [number, ZoneInfo] | undefined {
    const rec = this.record(id);
    if (rec) {
      const [zoneid, r] = rec;
      const [utc, res] = isutc ? r.fromUTC(t) : r.fromWall(t);
      return [
        utc,
        {
          ...res,
          zoneid,
        },
      ];
    }
    return undefined;
  }

  /**
   * Find a record for a time zone id or alias.
   */
  private record(zoneid: string): [string, ZoneRecord] | undefined {
    const id = this.linkindex.get(zoneid);
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
 *
 * @internal
 */
class ZoneRecord {
  // metadata
  readonly stdoff: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly countries: string[]; // indices

  readonly localtime: ZoneInfoRec[];
  readonly types: number[];
  readonly untils: number[];
  readonly len: number;

  constructor(raw: string, index: number[]) {
    const [_std, _lat, _lon, _countries, _info, _types, _untils] = raw.split('_');
    const untils = numarray(_untils);
    const types = _types ? _types.split('').map((t) => TYPES[t]) : [];

    // Decode initial until and the deltas
    const len = untils.length;
    if (len > 0) {
      untils[0] = index[untils[0]] * 1000;
      for (let i = 1; i < len; i++) {
        untils[i] = untils[i - 1] + index[untils[i]] * 1000;
      }
    }

    this.stdoff = parseInt(_std, 36) * 1000;
    this.latitude = parseInt(_lat, 36) / 1e6;
    this.longitude = parseInt(_lon, 36) / 1e6;
    this.countries = _countries ? _countries.split(',') : [];
    this.localtime = _info.split('|').map(this.decodeInfo);
    this.types = types;
    this.untils = untils;
    this.len = untils.length;
  }

  /**
   * Resolve the zone info using a UTC timestamp.
   */
  fromUTC(utc: number): [number, ZoneInfoRec] {
    const i = binarySearch(this.untils, true, utc);
    const type = i === -1 ? 0 : this.types[i];
    return [utc, this.localtime[type]];
  }

  /**
   * Resolve the zone info using a wall clock timestamp in the given zone.
   *
   * We have to determine the nearest DST transition boundary in wall clock
   * time, and choose one side of the boundary based on whether the clock moved
   * backwards or forwards, and where our wall time falls relative to
   * the boundary, or within the transitional gap.
   */
  fromWall(wall: number): [number, ZoneInfoRec] {
    // Find the until one day before our wall time
    let i = binarySearch(this.untils, true, wall - 86400000);
    const r0 = this.localtime[i === -1 ? 0 : this.types[i]];
    i++;

    // Check if we hit the end of the untils array and return
    if (i === this.types.length) {
      return [wall - r0.offset, r0];
    }

    // Get the next until.
    const r1 = this.localtime[this.types[i]];
    const u1 = this.untils[i];

    // Adjust the next until using the prior offset to find the wall clock time of the boundary.
    //
    // Example for New York on Mar 8, 2020 with DST boundary at 7:00 AM UTC:
    //   1:59 AM NY time is UTC 6:59 AM minus 5 hours
    //
    // 1 minute later the offset changes to -04:00:
    //   2:00 AM NY time is UTC 7:00 AM minus 5 hours, so local time becomes 3:00 AM
    //
    // Example for New York on Nov 1, 2020 with DST boundary at 7:00 AM UTC:
    //   1:59 AM NY time is UTC 5:59 AM minus 4 hours
    //
    // 1 minute later the offset changes to -05:00:
    //   2:00 AM NY time is UTC 6:00 AM minus 4 hours, so local time becomes 1:00 AM

    // Wall time instantaneously at zone boundary
    const w0 = u1 + r0.offset;

    // New wall time after boundary is crossed
    const w1 = u1 + r1.offset;

    // Wall time is before the gap, return pre-boundary offset
    if (wall < w0 && wall < w1) {
      return [wall - r0.offset, r0];
    }

    // When local time jumps forward, the resulting gap contains many "impossible"
    // times. In our example for New York, Mar 8 2020 at 2:30 AM is invalid.
    // We return a UTC timestamp and offset that will make the local time 3:30 AM.
    if (w0 < w1) {
      // Wall time is either in the gap of impossible times or after the gap.
      return wall < w1 ? [wall - r0.offset, r1] : [wall - r1.offset, r1];
    }

    // When local time jumps backwards, many times occur twice.
    // In our example for New York, Nov 1 2020, 1:30 AM occurs once as local
    // time moves towards 2:00 AM, and occurs again after the time has been
    // moved back to 1:00 AM.
    return wall < w0 ? [wall - r0.offset, r0] : [wall - r1.offset, r1];
  }

  /**
   * Decode a single zone info record.
   */
  private decodeInfo(raw: string): ZoneInfoRec {
    const [abbr, _dst, _offset] = raw.split(':');
    return {
      abbr,
      dst: Number(_dst),
      offset: parseInt(_offset, 36) * 1000,
    };
  }
}

const TYPES = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((p, c, i) => {
  p[c] = i;
  return p;
}, {} as { [x: string]: number });

interface ZoneInfoRec {
  abbr: string;
  dst: number;
  offset: number;
}

/**
 * Global instance for accessing time zones.
 *
 * @public
 */
export const TZ: Tz = new TzImpl(rawdata);
