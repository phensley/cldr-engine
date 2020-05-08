const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;

export class Timestamp {
  static MIN: Timestamp = new Timestamp(Number.MIN_SAFE_INTEGER);
  static MAX: Timestamp = new Timestamp(Number.MAX_SAFE_INTEGER);

  constructor(readonly n: number) {}

  secs(n: number): Timestamp {
    return new Timestamp(this.n + n * SEC);
  }

  mins(n: number): Timestamp {
    return new Timestamp(this.n + n * MIN);
  }

  hours(n: number): Timestamp {
    return new Timestamp(this.n + n * HOUR);
  }
}
