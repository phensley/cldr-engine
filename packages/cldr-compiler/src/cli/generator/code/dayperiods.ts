import { Code, HEADER } from './util';
import { getSupplemental } from '../../../cldr';

const KEYS: string[] = ['afternoon1', 'evening1', 'midnight', 'morning1', 'morning2', 'night1', 'noon'];

const INDEX = KEYS.reduce((o: any, k: string, i: number) => {
  o[k] = i;
  return o;
}, {});

interface Exact {
  type: 'exact';
  key: string;
  at: number;
}

interface Range {
  type: 'range';
  key: string;
  from: number;
  before: number;
}

type Until = Exact | Range;

// const zeropad2 = (n: number): string => n < 10 ? `0${n}` : `${n}`;

// const display = (v: number): string => {
//   const hour = Math.floor(v / 60);
//   const minute = v - (hour * 60);
//   return `${zeropad2(hour)}:${zeropad2(minute)}`;
// };

const parseTime = (s: string): number => {
  const parts = s.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return (hours * 60) + minutes;
};

const compare = (a: Until, b: Until): number => {
  const astart = a.type === 'exact' ? a.at : a.from;
  const bstart = b.type === 'exact' ? b.at : b.from;
  if (astart === bstart) {
    return a.type === 'exact' ? -1 : 1;
  }
  return astart < bstart ? -1 : 1;
};

/**
 * Expand intervals and adjust so they don't overlap.
 */
const expand = (untils: Until[]): Until[] => {
  const res: Until[] = [];
  for (const u of untils) {
    if (u.type === 'exact') {
      res.push(u);

    } else {
      // Wrap-around splits into 2 ranges
      if (u.from > u.before) {
        const { type, key } = u;
        // Split into two segments to wrap around midnight
        res.push({ type, key, from: u.from, before: 24 * 60 });
        res.push({ type, key, from: 0, before: u.before });
      } else {
        res.push(u);
      }
    }
  }

  // Adjust ranges so they don't overlap
  for (const u of res) {
    if (u.type !== 'range') {
      continue;
    }
    let overlap = false;
    res.forEach(v => {
      overlap = overlap || v.type === 'exact' && v.at === u.from;
    });
    if (overlap) {
      u.from += 1;
    }
  }

  res.sort(compare);
  return res;
};

export const getDayPeriods = (_data: any): Code[] => {
  let code = HEADER;

  code += `import { DayPeriodType } from '@phensley/cldr-schema';\n\n`;

  code += 'export const dayPeriodKeys: DayPeriodType[] = [\n  ';
  code += KEYS.map(s => `'${s}'`).join(', ');
  code += '\n];\n\n';

  code += 'export const dayPeriodRules: { [x: string]: string } = {\n';

  const { DayPeriods } = getSupplemental();
  Object.keys(DayPeriods).forEach(id => {
    const dayPeriod = DayPeriods[id];
    let untils: Until[] = [];
    KEYS.forEach(key => {
      const o = dayPeriod[key];
      if (o === undefined) {
        return;
      }
      if (o._at !== undefined) {
        untils.push({
          type: 'exact',
          key,
          at: parseTime(o._at)
        });
      } else {
        untils.push({
          type: 'range',
          key,
          from: parseTime(o._from),
          before: parseTime(o._before)
        });
      }
    });

    if (untils.length === 0) {
      return;
    }

    untils = expand(untils);

    const times = untils.map(u => u.type === 'exact' ? u.at : u.from)
      .map(n => n.toString(36)).join(' ');
    const keys = untils.map(u => INDEX[u.key]);
    const value = `${keys.join(' ')}|${times}`;

    if (id.indexOf('-') !== -1) {
      id = `'${id}'`;
    }
    code += `  ${id}: '${value}',\n`;
  });

  code += '};\n';

  return [
    Code.core(['internals', 'calendars', 'autogen.dayperiods.ts'], code)
  ];
};
