import { AltType, ContextType } from '@phensley/cldr-types';

/**
 * @public
 */
export type ListPatternType = 'and' | 'and-short' | 'or' | 'unit-long' | 'unit-narrow' | 'unit-short';

/**
 * @public
 */
export type MeasurementSystem = 'us' | 'uk' | 'metric';

/**
 * @public
 */
export type MeasurementCategory = 'temperature';

/**
 * @public
 */
export interface DisplayNameOptions {

  type?: AltType;

  context?: ContextType;
}

/**
 * @public
 */
export interface CurrencyDisplayNameOptions {
  context?: ContextType;
}
