import { CurrencySpacing, NumberSymbols, NumberSystemName } from '@phensley/cldr-schema';

export interface NumberParams {
  numberSystemName: NumberSystemName;
  digits: string[];
  latinDigits: string[];
  symbols: NumberSymbols;
  minimumGroupingDigits: number;
  primaryGroupingSize: number;
  secondaryGroupingSize: number;
  beforeCurrency: CurrencySpacing;
  afterCurrency: CurrencySpacing;
}
