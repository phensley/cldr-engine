import { FieldArrow, Vector1Arrow, Vector2Arrow } from '../arrows';
import { PluralType } from '../enums';
import { UnitValues } from './autogen.units';
import { UnitType } from './autogen.units';
import { KeyIndex } from '../../types';

export const UnitNameIndex = new KeyIndex(UnitValues);

export interface UnitInfo {
  readonly unitPattern: Vector2Arrow<PluralType, UnitType>;
  readonly displayName: Vector1Arrow<UnitType>;
  readonly perUnitPattern: Vector1Arrow<UnitType>;
  readonly compoundUnitPattern: FieldArrow;
  // TODO: coordinate display names and patterns
}

export interface UnitsSchema {
  readonly long: UnitInfo;
  readonly narrow: UnitInfo;
  readonly short: UnitInfo;
}
