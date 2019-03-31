import {
  Decimal
} from '../src';

const time = (n: [number, number]) =>
  new Decimal(n[0]).add(new Decimal(n[1]).movePoint(-9));

export class Timer {
  protected _start: [number, number] = process.hrtime();

  start(): void {
    this._start = process.hrtime();
  }

  micros(): string {
    const _end = process.hrtime();
    return time(_end).subtract(time(this._start)).movePoint(6).toString();
  }

  // private asDecimal(hrtime: [number, number]): Decimal {
  //   return new Decimal(hrtime[0]).add(new Decimal(hrtime[1]).movePoint(-9));
  // }
}
