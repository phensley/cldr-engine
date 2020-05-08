import { getSupplemental } from '../../../cldr';

export const getCurrencyInfo = (): any => {
  const supplemental = getSupplemental();
  return {
    currencyFractions: supplemental.CurrencyFractions,
    currencyRegions: supplemental.CurrencyRegions.regions,
  };
};
