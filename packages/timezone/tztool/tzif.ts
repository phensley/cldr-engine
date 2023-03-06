import * as fs from 'fs';

const MAGIC = 'TZif';
const VERSIONS = [2, 3];
const HISCALE = 0x100000000;

export const utcs = (n: number, tz: string = 'UT') =>
  new Date(n)
    .toISOString()
    .replace('Z', ' ' + tz)
    .replace('T', ' ');

export interface LocaltimeType {
  utoff: number;
  dst: number;
  idx: number;
}

export interface LeapSecond {
  occur: number;
  corr: number;
}

const leftpad = (s: string, ch: string, n: number): string => {
  const len = n - s.length;
  return ch.repeat(len < 0 ? 0 : len) + s;
};

/**
 * Read from a Buffer with auto-seek. All methods are big-endian as
 * specified by TZif RFC 8536.
 */
class Stream {
  private i: number = 0;

  constructor(readonly buf: Buffer) {}

  readString(encoding: BufferEncoding, length: number): string {
    const s = this.buf.toString(encoding, this.i, this.i + length);
    this.seek(length);
    return s;
  }

  readInt8(): number {
    const n = this.buf.readInt8(this.i);
    this.seek(1);
    return n;
  }

  readUInt8(): number {
    const n = this.buf.readUInt8(this.i);
    this.seek(1);
    return n;
  }

  readInt32(): number {
    const n = this.buf.readInt32BE(this.i);
    this.seek(4);
    return n;
  }

  readUInt32(): number {
    const n = this.buf.readUInt32BE(this.i);
    this.seek(4);
    return n;
  }

  readInt64(): number {
    const hi = this.readInt32(); // signed
    const lo = this.readUInt32();
    return hi * HISCALE + lo;
  }

  readUInt64(): number {
    const hi = this.readUInt32();
    const lo = this.readUInt32();
    return hi * HISCALE + lo;
  }

  readLocaltimeTypeArray(count: number): LocaltimeType[] {
    const r: LocaltimeType[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const utoff = this.readInt32();
      const dst = this.readUInt8();
      const idx = this.readUInt8();
      r[i] = { utoff, dst, idx };
    }
    return r;
  }

  readLeapSecondArray(count: number): LeapSecond[] {
    const r: LeapSecond[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const occur = this.readUInt64();
      const corr = this.readInt8();
      r[i] = { occur, corr };
    }
    return r;
  }

  readInt8Array(count: number): number[] {
    return this.numberArray(count, (s: Stream) => s.readInt8());
  }

  readUInt8Array(count: number): number[] {
    return this.numberArray(count, (s: Stream) => s.readUInt8());
  }

  readInt64Array(count: number): number[] {
    return this.numberArray(count, (s: Stream) => s.readInt64());
  }

  /**
   * Moves the buffer pointer ahead n bytes.
   */
  seek(n: number): void {
    this.i += n;
  }

  private numberArray(count: number, f: (stm: Stream) => number): number[] {
    const r: number[] = new Array(count);
    for (let i = 0; i < count; i++) {
      r[i] = f(this);
    }
    return r;
  }
}

/**
 * Reads the TZif file format defined in RFC 8536
 * https://www.rfc-editor.org/rfc/rfc8536.txt
 */
export class TZif {
  readonly stm: Stream;

  // Four bytes identifying the file type
  readonly magic: string;

  // Version of the TZif format
  readonly version: number;

  // Count of UT/local indicators
  readonly isutcnt: number;

  // Count of standard/wall indicators
  readonly isstdcnt: number;

  // Count of leap-second records
  readonly leapcnt: number;

  // Count of transition times
  readonly timecnt: number;

  // Count of local time type records
  readonly typecnt: number;

  // Count of time zone designation octets
  readonly charcnt: number;

  // UNIX transition time values in ascending order
  readonly transtimes: number[];

  // Type of local time of the corresponding transition time
  readonly transtypes: number[];

  // Local time type records
  readonly localtimetype: LocaltimeType[];

  // List of time zone abbreviations, null-terminated
  readonly zoneabbrs: string;

  // Leap second corrections to apply to UTC
  readonly leapsecs: LeapSecond[];

  // UT/local indicators
  readonly utinds: number[];

  // Standard/wall indicators
  readonly stdinds: number[];

  constructor(readonly id: string, path: string) {
    const stm = new Stream(fs.readFileSync(path));
    this.stm = stm;

    // Read 5-byte file header
    const head = stm.readString('ascii', 5);

    // Read and validate 4-byte magic number
    this.magic = head.slice(0, 4);
    if (this.magic !== MAGIC) {
      throw new Error(`Expected "${MAGIC}" type, got "${this.magic}"`);
    }

    // Read and validate 1-byte version
    this.version = parseInt(head[4], 10);
    if (VERSIONS.indexOf(this.version) === -1) {
      throw new Error(`Unsupported version "${this.version}"`);
    }

    // Seek ahead to skip over the reserved block.
    stm.seek(15);

    // Skip over version 1 data block.
    this.skipV1();

    // Read version 2 data block.
    this.isutcnt = stm.readUInt32();
    this.isstdcnt = stm.readUInt32();
    this.leapcnt = stm.readUInt32();
    this.timecnt = stm.readUInt32();
    this.typecnt = stm.readUInt32();
    this.charcnt = stm.readUInt32();

    this.transtimes = stm.readInt64Array(this.timecnt);
    this.transtypes = stm.readUInt8Array(this.timecnt);
    this.localtimetype = stm.readLocaltimeTypeArray(this.typecnt);
    this.zoneabbrs = stm.readString('ascii', this.charcnt);
    this.leapsecs = stm.readLeapSecondArray(this.leapcnt);
    this.utinds = stm.readInt8Array(this.isutcnt);
    this.stdinds = stm.readInt8Array(this.isstdcnt);
  }

  /**
   * JSON string containing the properties of this tzif file.
   */
  json(space?: string): string {
    const { id, magic, version, transtimes, transtypes, localtimetype, zoneabbrs, leapsecs, utinds, stdinds } = this;
    return JSON.stringify(
      {
        id,
        magic,
        version,
        transtimes,
        transtypes,
        localtimetype,
        zoneabbrs,
        leapsecs,
        utinds,
        stdinds,
      },
      undefined,
      space,
    );
  }

  /**
   * Show the transition times in this tzif file, in a format that
   * mimics the tzdb zdump command.
   */
  zdump(timestamps: boolean, utcrange?: [number, number]): string {
    const st = utcrange ? utcrange[0] : 0;
    const en = utcrange ? utcrange[1] : 0;
    let r = '';
    const len = this.transtimes.length;
    for (let i = 0; i < len; i++) {
      const secs = this.transtimes[i];
      const ms = secs * 1000;

      // Skip this year if it falls outside a defined range
      if ((st && ms < st) || (en && ms > en)) {
        continue;
      }

      // Print info 1 second before and exactly at the
      // transition time. Type 0 is used before the
      // first transition time occurs.
      let j = i === 0 ? 0 : this.transtypes[i - 1];
      r += this._zdump(timestamps, ms - 1, this.localtimetype[j]);
      j = this.transtypes[i];
      r += this._zdump(timestamps, ms, this.localtimetype[j]);
    }
    return r;
  }

  /**
   * Returns the zone abbreviation at the given index. Note that
   * abbreviations are null-terminated.
   */
  zoneabbr(idx: number): string {
    const s = this.zoneabbrs.slice(idx);
    const i = s.indexOf('\u0000');
    return s.slice(0, i);
  }

  /**
   * Produces a zdump string for a single transition.
   */
  private _zdump(timestamps: boolean, ms: number, typ: LocaltimeType): string {
    const utc = utcs(ms);
    const { utoff, dst, idx } = typ;
    const ind = this.zoneabbr(idx);
    const loc = utcs(ms + utoff * 1000, ind);
    const r = timestamps ? leftpad(`${ms}`, ' ', 15) + '  ' : '';
    return r + `${utc}  =  ${loc}  isdst=${dst} gmtoff=${utoff}\n`;
  }

  /**
   * Version 2/3 formats start with a version 1 data block, which
   * we need to skip over to be positioned at the start of the
   * actual version 2/3 block.
   */
  private skipV1(): void {
    const { stm } = this;

    // Read counts.
    const isutcnt = stm.readUInt32();
    const isstdcnt = stm.readUInt32();
    const leapcnt = stm.readUInt32();
    const timecnt = stm.readUInt32();
    const typecnt = stm.readUInt32();
    const charcnt = stm.readUInt32();

    // Skip over records.
    const timesize = 4;
    stm.seek(timecnt * timesize);
    stm.seek(timecnt);
    stm.seek(typecnt * 6);
    stm.seek(charcnt);
    stm.seek(leapcnt * (timesize + 4));
    stm.seek(isstdcnt);
    stm.seek(isutcnt);

    // Skip 2nd TZif header and reserved block.
    stm.seek(5);
    stm.seek(15);
  }
}
