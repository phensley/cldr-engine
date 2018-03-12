import {
  availableLocales,
  AvailableFormatType,
  FormatWidthType,
  GregorianFormatOptions,
  ZonedDateTime
} from '../src';

import { getCLDR } from '../__tests__/helpers';
import { Timer } from './timer';

const ZONES = ['America/New_York', 'Europe/London', 'Africa/Timbuktu'];

const DATETIMES = [
  123000,
  1520873594000
];

const WIDTHS: FormatWidthType[] = ['full', 'long', 'medium', 'short'];

const gregorianOptions = (): GregorianFormatOptions[] => {
  const res: GregorianFormatOptions[] = [];
  for (const width of WIDTHS) {
    res.push({ date: width });
    res.push({ time: width });
    res.push({ datetime: width });
  }
  res.push({ date: 'yMMMd' });
  res.push({ time: 'Hms' });
  res.push({ date: 'yMMMd', time: 'Hms' });
  return res;
};

const buildDatetimes = (): ZonedDateTime[] => {
  const res: ZonedDateTime[] = [];
  for (const epoch of DATETIMES) {
    for (const zoneId of ZONES) {
      res.push(new ZonedDateTime(epoch, zoneId));
    }
  }
  return res;
};

export const gregorianStress = () => {
  let elapsed: string;
  const timer = new Timer();
  const cldr = getCLDR();
  const datetimes = buildDatetimes();
  const locales = availableLocales();
  const dopts = gregorianOptions();
  let i = 0;

  for (const locale of locales) {
    timer.start();
    const engine = cldr.get(locale);
    elapsed = timer.micros();
    console.log(`load '${locale.id}' locale: ${elapsed} micros`);

    timer.start();
    for (const datetime of datetimes) {
      for (const o of dopts) {
        const res = engine.Gregorian.format(datetime, o);
        i++;
        // console.log(res);
      }
    }

    elapsed = timer.micros();
    console.log(`format ${i} gregorian permutations: ${elapsed} micros`);
  }
};
