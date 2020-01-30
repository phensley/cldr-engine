import { UnitType } from '@phensley/cldr-types';
import { Rational } from '@phensley/decimal';

export interface UnitFactorMapEntry {
  [0]: UnitType;
  [1]: UnitFactor;
}

export interface UnitFactor {
  [0]: string | Rational;
  [1]: UnitType;
}
