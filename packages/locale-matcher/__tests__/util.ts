import * as fs from 'fs';
import { join } from 'path';

export class DistanceCase {
  constructor(
    readonly supported: string,
    readonly desired: string,
    readonly distanceDS: number,
    readonly distanceSD: number,
    readonly lineno: number,
  ) {}
}

export interface MatchCase {
  testname: string;
  favor: string;
  threshold: string;
  supported: string;
  desired: string;
  result: string;
  lineno: number;
}

export const loadDistanceCases = (): DistanceCase[] => {
  const path = join(__dirname, 'data', `locale-distance-cases.txt`);
  const cases: DistanceCase[] = [];
  readLines(path).forEach((entry) => {
    const [line, lineno] = entry;
    const cols = line.split(';').map((s) => s.trim());
    if (cols.length > 0 && cols.length !== 3 && cols.length !== 4) {
      throw new Error(`Invalid test case found: ${line}`);
    }
    cases.push(
      new DistanceCase(
        cols[0],
        cols[1],
        parseInt(cols[2], 10),
        parseInt(cols.length === 3 ? cols[2] : cols[3], 10),
        lineno,
      ),
    );
  });
  return cases;
};

export const loadMatchCases = (): MatchCase[] => {
  const name = 'locale-match-cases.txt';
  const path = join(__dirname, 'data', name);
  const cases: MatchCase[] = [];
  readLines(path).forEach((entry) => {
    const [line, lineno] = entry;
    const cols = line.split(';').map((s) => s.trim());
    if (cols.length !== 3) {
      throw new Error(`Invalid test case found: ${line}`);
    }
    cases.push({
      testname: `${name} (line ${lineno})`,
      favor: 'normal',
      threshold: '',
      supported: cols[0],
      desired: cols[1],
      result: cols[2],
      lineno,
    });
  });
  return cases;
};

export const loadDistanceCasesNew = (): DistanceCase[] => {
  const path = join(__dirname, 'data', `locale-distance-cases-new.txt`);
  const cases: DistanceCase[] = [];
  readLines(path).forEach((entry) => {
    const [line, lineno] = entry;
    if (line.startsWith('@debug')) {
      return;
    }
    const cols = line.split(';').map((s) => s.trim());
    if (cols.length > 0 && cols.length !== 3 && cols.length !== 4) {
      throw new Error(`Invalid test case found: ${line}`);
    }
    cases.push(
      new DistanceCase(
        cols[1],
        cols[0],
        parseInt(cols[2], 10),
        parseInt(cols.length === 3 ? cols[2] : cols[3], 10),
        lineno,
      ),
    );
  });
  return cases;
};

export const loadMatchCasesFromRaw = (source: string, lines: [string, number][]) => {
  const cases: MatchCase[] = [];
  let testname = '';
  let supported = '';
  let favor = '';
  let threshold = '';

  lines.forEach((entry) => {
    const [line, lineno] = entry;
    if (line.startsWith('**')) {
      // Each test resets the parameters to their defaults
      testname = line.split(':')[1].trim();
      supported = '';
      favor = 'normal';
      threshold = '';
      return;
    }

    // Directives set parameter values
    if (line[0] == '@') {
      const [key, val] = line.split('=');
      switch (key) {
        case '@supported':
          supported = val;
          return;
        case '@favor':
          favor = val;
          return;
        case '@threshold':
          threshold = val;
          return;
      }
    }

    // Test cases have the form "desired >> result"
    const [desired, result] = line.split('>>').map((s) => s.trim());
    cases.push({
      testname: `${source} - ${testname} (line ${lineno})`,
      favor,
      threshold,
      supported,
      desired,
      result,
      lineno,
    });
  });
  return cases;
};

export const loadMatchCasesNew = (): MatchCase[] => {
  const name = 'locale-match-cases-new.txt';
  const path = join(__dirname, 'data', name);
  return loadMatchCasesFromRaw(name, readLines(path));
};

export const readLinesFrom = (raw: string): [string, number][] =>
  raw
    .split('\n')
    .map((s, i) => {
      const idx = s.indexOf('#');
      if (idx !== -1) {
        s = s.substring(0, idx);
      }
      const result: [string, number] = [s.trim(), i + 1];
      return result;
    })
    .filter((s) => s[0][0] !== '#' && s[0].length > 0);

const readLines = (path: string): [string, number][] => {
  const raw = fs.readFileSync(path, { encoding: 'utf-8' });
  return readLinesFrom(raw);
};
