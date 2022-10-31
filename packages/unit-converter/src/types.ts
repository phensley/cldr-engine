import { Rational } from '@phensley/decimal';
import { UnitType } from '@phensley/cldr-types';

/**
 * Definition of a single conversion factor.
 *
 * @public
 */
export type FactorDef = [UnitType, string | Rational, UnitType];
