import * as fs from 'fs';

export const readRows = (path: string, delim: string = ' ') => {
  const raw = fs.readFileSync(path, { encoding: 'utf-8' });
  const res: string[][] = [];
  for (const line of raw.split('\n')) {
    if (line && line[0] !== '#') {
      const row = line.split(delim);
      res.push(row);
    }
  }
  return res;
};
