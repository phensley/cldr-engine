import { CurrencyType } from '@phensley/cldr-types';
import { CurrencyFractions } from '../../common';
import { numarray, stringToObject } from '../../utils/string';
import { currencyFractionsRaw, currencyRegionsRaw } from './autogen.currencies';

type CurrencyFractionMap = { [x: string]: CurrencyFractions };

const currencyFractions = ((): CurrencyFractionMap => {
  const map: CurrencyFractionMap = {};
  currencyFractionsRaw.split('|').forEach((r) => {
    const parts = r.split(':');
    const code = parts[0];
    const values = numarray(parts[1]);
    map[code] = {
      digits: values[0],
      rounding: values[1],
      cashDigits: values[2],
      cashRounding: values[3],
    };
  });
  return map;
})();

const defaultCurrencyFractions: CurrencyFractions = {
  digits: 2,
  rounding: 0,
  cashDigits: 2,
  cashRounding: 0,
};

const currencyRegions = stringToObject(currencyRegionsRaw, '|', ':');

/**
 * @public
 */
export const getCurrencyFractions = (code: string): CurrencyFractions =>
  currencyFractions[code] || defaultCurrencyFractions;

/**
 * @public
 */
export const getCurrencyForRegion = (region: string): CurrencyType =>
  (region !== 'ZZ' && (currencyRegions[region] as CurrencyType)) || 'USD';
