import { CLDRFramework, DateFormatOptions, FormatWidthType, ZonedDateTime } from '../src';

import { getCLDR } from '../__tests__/_helpers';
import { Timer } from './timer';

const { availableLocales } = CLDRFramework;

const ZONES = ['America/New_York', 'Europe/London', 'Africa/Timbuktu'];

const DATETIMES = [123000, 1520873594000];

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
