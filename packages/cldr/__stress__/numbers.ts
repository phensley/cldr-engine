import {
  availableLocales,
  CLDR,
  CLDROptions,
  CurrencyFormatOptions,
  CurrencyFormatStyleType,
  CurrencyType,
  Decimal,
  DecimalConstants,
  DecimalFormatOptions,
  DecimalFormatStyleType } from '../src';
import { getCLDR } from '../__tests__/helpers';
import { Timer } from './timer';

const MAX = String(Number.MAX_SAFE_INTEGER);

const NUMBERS: (string | Decimal)[] = [
  '0', '1', '-1', '12345.789', '-12345.789',
  '1000000000',
  new Decimal('1.579e-13'),
  DecimalConstants.PI,
  MAX,
  MAX + MAX
];

const DECIMAL_STYLES: DecimalFormatStyleType[] = [
  'decimal', 'short', 'long', 'percent', 'permille', 'percent-scaled', 'permille-scaled'
];

const CURRENCY_STYLES: CurrencyFormatStyleType[] = [
  'symbol', 'accounting', 'name', 'code', 'short'
];

const CURRENCIES: CurrencyType[] = [
  'USD', 'JPY', 'EUR', 'GBP'
];

/**
 * Generate permutations of options.
 */
const decimalOptions = (): DecimalFormatOptions[] => {
  const res: DecimalFormatOptions[] = [];
  for (const style of DECIMAL_STYLES) {
    res.push({ style });
    res.push({ style, minimumFractionDigits: 0 });
    res.push({ style, minimumFractionDigits: 3 });
    res.push({ style, maximumFractionDigits: 3 });
    res.push({ style, maximumFractionDigits: 10 });
    res.push({ style, minimumSignificantDigits: 3 });
    res.push({ style, maximumSignificantDigits: 3 });
  }
  return res;
};

const currencyOptions = (): CurrencyFormatOptions[] => {
  const res: CurrencyFormatOptions[] = [];
  for (const style of CURRENCY_STYLES) {
    res.push({ style });
    res.push({ style, minimumFractionDigits: 0 });
    res.push({ style, minimumFractionDigits: 3 });
    res.push({ style, maximumFractionDigits: 3 });
    res.push({ style, maximumFractionDigits: 10 });
    res.push({ style, minimumSignificantDigits: 3 });
    res.push({ style, maximumSignificantDigits: 3 });
  }
  return res;
};

export const numberStress = () => {
  let elapsed: string;
  const timer = new Timer();
  const cldr = getCLDR();
  const locales = availableLocales();

  const dopts = decimalOptions();
  const copts = currencyOptions();
  let i = 0;

  for (const locale of locales) {
    timer.start();
    const engine = cldr.get(locale);
    elapsed = timer.micros();
    console.log(`load '${locale.id}' locale: ${elapsed} micros`);

    timer.start();
    for (const n of NUMBERS) {
      for (const o of dopts) {
        const res = engine.Numbers.formatDecimal(n, o);
        i++;
      }
    }
    elapsed = timer.micros();
    console.log(`format ${i} number permutations: ${elapsed} micros`);

    i = 0;
    timer.start();
    for (const n of NUMBERS) {
      for (const currency of CURRENCIES) {
        for (const o of copts) {
          const res = engine.Numbers.formatCurrency(n, currency, o);
          i++;
        }
      }
    }
    elapsed = timer.micros();
    console.log(`format ${i} currency permutations: ${elapsed} micros`);
  }
};