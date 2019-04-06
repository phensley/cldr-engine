/**
 * Test whether we can go from UTC -> WALL -> UTC successfully.
 */

// TODO:
// export const roundtrip = (id: string, utc: number): boolean => {
//   let info = TZ.fromUTC(id, utc);
//   if (info) {
//     const wall = utc + info.offset;
//     info = TZ.fromWall(id, wall);
//     if (info) {
//       return utc === (wall - info.offset);
//     }
//   }
//   throw new Error(`failed to resolve ${id}`);
// };

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;

export class Timestamp {

  static MIN: Timestamp = new Timestamp(Number.MIN_SAFE_INTEGER);
  static MAX: Timestamp = new Timestamp(Number.MAX_SAFE_INTEGER);

  constructor(readonly n: number) {}

  secs(n: number): Timestamp {
    return new Timestamp(this.n + (n * SEC));
  }

  mins(n: number): Timestamp {
    return new Timestamp(this.n + (n * MIN));
  }

  hours(n: number): Timestamp {
    return new Timestamp(this.n + (n * HOUR));
  }

}
