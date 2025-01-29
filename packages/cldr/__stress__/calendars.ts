import { CLDRFramework, DateFormatOptions, DateIntervalFormatOptions, FormatWidthType, ZonedDateTime } from '../src';
import { getCLDR } from '../__tests__/_helpers';
import { Timer } from './timer';
import { DateTimePatternFieldValues } from '@phensley/cldr-core/lib/schema';

const { availableLocales } = CLDRFramework;

const ZONES = ['America/New_York', 'Europe/London', 'Africa/Timbuktu'];

const DATETIMES = [123000, 1520873594000];

const DAY = 86400000;
const SECOND = 1000;

const INTERVALS: number[] = [
  SECOND * 10, // 10 seconds
  SECOND * 60 * 15, // 15 minutes
  SECOND * 60 * 60 * 5, // 5 hours
  SECOND * 60 * 60 * 10, // 10 hours
  DAY * 5, // 5 days
  DAY * 30 * 3, // ~3 months
  DAY * 365 * 3, // ~3 years
];

const FRACTIONS = 10;

const WIDTHS: FormatWidthType[] = ['full', 'long', 'medium', 'short'];

const dateOptions = (): DateFormatOptions[] => {
  const res: DateFormatOptions[] = [];
  for (const width of WIDTHS) {
    res.push({ date: width });
    res.push({ time: width });
    res.push({ datetime: width });
  }
  res.push({ skeleton: 'yMMMd' });
  res.push({ skeleton: 'Hms' });
  res.push({ skeleton: 'yMMMdjms' });
  res.push({ datetime: 'full', context: 'standalone', ca: 'buddhist', nu: 'beng' });
  res.push({ datetime: 'medium', context: 'begin-sentence', ca: 'japanese', nu: 'arab' });
  return res;
};

const buildDatetimes = (): ZonedDateTime[] => {
  const res: ZonedDateTime[] = [];
  for (const date of DATETIMES) {
    for (const zoneId of ZONES) {
      res.push({ date, zoneId });
      for (let i = 0; i < FRACTIONS; i++) {
        const d = date + Math.random() * 10000000;
        res.push({ date: d, zoneId });
      }
    }
  }
  return res;
};

export const calendarStress = (): void => {
  let total = 0;
  let empty = 0;
  let elapsed: string;
  const timer = new Timer();
  const cldr = getCLDR();
  const datetimes = buildDatetimes();
  const locales = availableLocales();
  const dopts = dateOptions();

  for (const locale of locales) {
    let i = 0;
    timer.start();
    const engine = cldr.get(locale);
    elapsed = timer.micros();
    console.log(`load '${locale.id}' locale: ${elapsed} micros`);

    timer.start();
    for (const datetime of datetimes) {
      for (const o of dopts) {
        const s = engine.Calendars.formatDate(datetime, o);
        if (s === '') {
          empty++;
        }
        i++;
      }
    }

    elapsed = timer.micros();
    total += i;
    console.log(`[calendars] format ${i} gregorian permutations: ${elapsed} micros`);
  }
  console.log(`[calendars] executed ${total} total number of calendar permutations, ${empty} empty`);
};

const buildIntervals = (): [ZonedDateTime, ZonedDateTime][] => {
  const res: [ZonedDateTime, ZonedDateTime][] = [];
  const zoneId = ZONES[0];
  let i = 0;
  for (const n of DATETIMES) {
    const start: ZonedDateTime = { date: n, zoneId };
    for (const period of INTERVALS) {
      const end: ZonedDateTime = { date: n + period, zoneId };
      res.push([start, end]);
      i++;
      if (i % 1000 === 0) {
        console.log(i);
      }
    }
  }
  return res;
};

const randomSkeleton = (): string => {
  let s = '';
  const n = Math.random() * 12; // up to 12 chars
  const len = DateTimePatternFieldValues.length;
  for (let i = 0; i < n; i++) {
    if (Math.random() >= 0.5) {
      continue;
    }
    const j = Math.floor(Math.random() * len);
    s += DateTimePatternFieldValues[j];
  }
  return s;
};

const intervalOptions = (): DateIntervalFormatOptions[] => {
  const res: DateIntervalFormatOptions[] = [];
  res.push({ skeleton: 'yMMMd' });
  res.push({ skeleton: 'Hms' });
  res.push({ skeleton: 'yMMMdjms' });
  for (const r of res.slice(0)) {
    res.push({ ...r, context: 'standalone', ca: 'buddhist', nu: 'beng' });
    res.push({ ...r, context: 'begin-sentence', ca: 'japanese', nu: 'arab' });
  }
  for (let i = 0; i < 100; i++) {
    res.push({ skeleton: randomSkeleton() });
  }
  return res;
};

export const intervalStress = (): void => {
  let total = 0;
  let empty = 0;
  let elapsed: string;
  const timer = new Timer();
  const cldr = getCLDR();

  const intervals = buildIntervals();
  const locales = availableLocales();
  const iopts = intervalOptions();

  for (const locale of locales) {
    let i = 0;
    timer.start();
    const engine = cldr.get(locale);
    elapsed = timer.micros();
    console.log(`load '${locale.id}' locale: ${elapsed} micros`);

    timer.start();
    for (const [start, end] of intervals) {
      for (const o of iopts) {
        const s = engine.Calendars.formatDateInterval(start, end, o);
        if (s === '') {
          empty++;
        }
        i++;
      }
    }

    elapsed = timer.micros();
    total += i;
    console.log(`[calendars] format ${i} interval permutations: ${elapsed} micros`);
  }
  console.log(`[calendars] executed ${total} total number of interval permutations, ${empty} empty`);
};
