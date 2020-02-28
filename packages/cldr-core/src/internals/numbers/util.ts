import { CurrencyType } from '@phensley/cldr-types';
import { currencyFractionsRaw, currencyRegionsRaw } from './autogen.currencies';
import { CurrencyFractions } from '../../common';
import { numarray, stringToObject } from '../../utils/string';

type CurrencyFractionMap = { [x: string]: CurrencyFractions };

const currencyFractions = ((): CurrencyFractionMap => {
  const map: CurrencyFractionMap = {};
  currencyFractionsRaw.split('|').forEach(r => {
    const parts = r.split(':');
    const code = parts[0];
    const values = numarray(parts[1]);
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

const currencyRegions = stringToObject(currencyRegionsRaw, '|', ':');

/**
 * @internal
 */
export const getCurrencyFractions = (code: string): CurrencyFractions =>
  currencyFractions[code] || defaultCurrencyFractions;

/**
 * @internal
 */
export const getCurrencyForRegion = (region: string): CurrencyType =>
  currencyRegions[region] as CurrencyType || 'USD';
