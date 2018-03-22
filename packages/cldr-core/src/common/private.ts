import { CurrencySpacing, NumberSymbols, NumberSystemName } from '@phensley/cldr-schema';
import { NumberSystem } from '../systems';

/**
 * @internal
 */
export interface NumberParams {
  numberSystemName: NumberSystemName;
  digits: string[];
  symbols: NumberSymbols;
  minimumGroupingDigits: number;
  primaryGroupingSize: number;
  secondaryGroupingSize: number;
  beforeCurrency: CurrencySpacing;
  afterCurrency: CurrencySpacing;
}
