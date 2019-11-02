import { FieldArrow, PluralType, UnitType } from '@phensley/cldr-types';
import { Vector1Arrow, Vector2Arrow } from '../arrows';

export interface UnitInfo {
  readonly unitPattern: Vector2Arrow<PluralType, UnitType>;
  readonly displayName: Vector1Arrow<UnitType>;
  readonly perUnitPattern: Vector1Arrow<UnitType>;
  readonly perPattern: FieldArrow;
  readonly timesPattern: FieldArrow;
  // TODO: coordinate display names and patterns
}

export interface UnitsSchema {
  readonly long: UnitInfo;
  readonly narrow: UnitInfo;
  readonly short: UnitInfo;
}
