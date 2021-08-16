import { PluralType } from '@phensley/cldr-types';
import { getExtensions } from '../../../cldr';

const categories: any = {
  zero: 0,
  one: 1,
  two: 2,
  few: 3,
  many: 4,
  other: 5,
};

interface Range {
  start: PluralType;
  end: PluralType;
  result: PluralType;
}

const COUNTS: any = {};

const incr = (s: string) => (COUNTS[s] = (COUNTS[s] || 0) + 1);

const flag = (cat: string) => 1 << categories[cat];

const convert = (ranges: Range[]): any | number => {
  const same = new Set(ranges.map((r) => r.result)).size === 1;
  if (same) {
    return categories[ranges[0].result];
  }
  const res: any = {};
  for (const r of ranges) {
    incr(r.start);
    incr(r.end);
    const code = (flag(r.start) << 5) + flag(r.end);

    if (res[code] !== undefined) {
      throw new Error(`duplicate found for ${JSON.stringify(r)}: ${JSON.stringify(res)}  ${code}`);
    }
    res[code] = categories[r.result];
  }
  return res;
};

export const getPluralRanges = (): any => {
  const { PluralRanges } = getExtensions();
  const langs = Object.keys(PluralRanges);
  const res: any = {};
  for (const lang of langs) {
    res[lang] = convert(PluralRanges[lang]);
  }
  // console.log(COUNTS);
  return { pluralranges: res };
};
