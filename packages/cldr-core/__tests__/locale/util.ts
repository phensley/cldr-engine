import * as fs from 'fs';
import { join } from 'path';

export class DistanceCase {
  constructor(
    readonly supported: string,
    readonly desired: string,
    readonly distanceDS: number,
    readonly distanceSD: number,
    readonly lineno: number
  ) {}
}

export class MatchCase {
  constructor(
    readonly supported: string,
    readonly desired: string,
    readonly result: string,
    readonly lineno: number
  ) {}
}

export const loadDistanceCases = (): DistanceCase[] => {
  const path = join(__dirname, 'data', 'locale-distance-cases.txt');
  const cases: DistanceCase[] = [];
  readLines(path).forEach(entry => {
    const [ line, lineno ] = entry;
    const cols = line.split(';').map(s => s.trim());
    if (cols.length > 0 && cols.length !== 3 && cols.length !== 4) {
      throw new Error(`Invalid test case found: ${line}`);
    }
    cases.push(new DistanceCase(
      cols[0],
      cols[1],
      parseInt(cols[2], 10),
      parseInt(cols.length === 3 ? cols[2] : cols[3], 10),
      lineno
    ));
  });
  return cases;
};

export const loadMatchCases = (): MatchCase[] => {
  const path = join(__dirname, 'data', 'locale-match-cases.txt');
  const cases: MatchCase[] = [];
  readLines(path).forEach(entry => {
    const [ line, lineno ] = entry;
    const cols = line.split(';').map(s => s.trim());
    if (cols.length !== 3) {
      throw new Error(`Invalid test case found: ${line}`);
    }
    cases.push(new MatchCase(cols[0], cols[1], cols[2], lineno));
  });
  return cases;
};

const readLines = (path: string): [string, number][] => {
  const raw = fs.readFileSync(path, { encoding: 'utf-8' });
  return raw.split('\n').map((s, i) => {
    const idx = s.indexOf('#');
    if (idx !== -1) {
      s = s.substring(0, idx);
    }
    const result: [string, number] = [s.trim(), i + 1];
    return result;
  }).filter(s => s[0][0] !== '#' && s[0].length > 0);
};
