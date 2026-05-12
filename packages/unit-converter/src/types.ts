import { Rational } from '@phensley/decimal';
import { UnitType } from '@phensley/cldr-types';

/**
 * Definition of a single conversion factor. The factor converts a value in
 * `src` units to `dst` units: `dst = src × factor + offset`. The offset is
 * additive and expressed in `dst` units; it defaults to zero, so most
 * conversions are pure ratios. Affine (offset) factors are used for
 * temperature, where the scales share a ratio but not a zero point.
 *
 * @public
 */
export type FactorDef = [UnitType, string | Rational, UnitType, (string | Rational)?];
