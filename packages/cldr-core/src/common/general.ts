import { AltType, ContextType } from '@phensley/cldr-types';

export type ListPatternType = 'and' | 'and-short' | 'or' | 'unit-long' | 'unit-narrow' | 'unit-short';

export type MeasurementSystem = 'us' | 'uk' | 'metric';

export type MeasurementCategory = 'temperature';

/**
 * @alpha
 */
export interface DisplayNameOptions {

  type?: AltType;

  context?: ContextType;
}

/**
 * @alpha
 */
export interface CurrencyDisplayNameOptions {
  context?: ContextType;
}
