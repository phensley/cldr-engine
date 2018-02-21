import { currencyFractionsRaw } from './autogen.currencies';

export interface CurrencyFractions {
  digits: number;
  rounding: number;
  cashDigits: number;
  cashRounding: number;
}

type CurrencyFractionMap = { [x: string]: CurrencyFractions };

const currencyFractions = ((): CurrencyFractionMap => {
  const map: CurrencyFractionMap = {};
  const raw = currencyFractionsRaw.split('|').forEach(r => {
    const parts = r.split(':');
    const code = parts[0];
    const values = parts[1].split(' ').map(Number);
    map[code] = {
      digits: values[0],
      rounding: values[1],
      cashDigits: values[2],
      cashRounding: values[3]
    };
  });
  return map;
})();

const defaultCurrencyFractions: CurrencyFractions = {
  digits: 2,
  rounding: 0,
  cashDigits: 2,
  cashRounding: 0
};

export const getCurrencyFractions = (code: string): CurrencyFractions =>
  currencyFractions[code] || defaultCurrencyFractions;
