import * as fs from 'fs';
import { DefaultArrayMap } from './types';

export interface ParseResult {
  zones: string[];
  links: DefaultArrayMap<string>;
}

const readRows = (path: string) => {
  const raw = fs.readFileSync(path, { encoding: 'utf-8' });
  const res: string[][] = [];
  for (const line of raw.split('\n')) {
    if (line && line[0] !== '#') {
      const row = line.split(' ');
      res.push(row);
    }
  }
  return res;
};

/**
 * Extract zones and links from a file in ZIC format.
 */
export const parseZIC = (path: string): ParseResult => {
  const result: ParseResult = {
    zones: [],
    links: new DefaultArrayMap<string>(),
  };

  const rows = readRows(path);
  for (const row of rows) {
    switch (row[0]) {
      case 'Li':
      case 'L':
        const [to, fr] = row.slice(1);
        result.links.add(to, fr);
        break;

      case 'Z':
        const id = row[1];
        result.zones.push(id);
        break;
    }
  }

  return result;
};
