import { FieldArrow, ScopeArrow, Vector1Arrow, Vector2Arrow } from '../arrows';
import { PluralType } from '../enums';
import { UnitValues } from './autogen.units';
import { UnitType } from './autogen.units';
import { KeyIndex } from '../../types';

export const UnitNameIndex = new KeyIndex(UnitValues);

// TODO:
// export interface UnitPerInfo {
//   readonly compoundUnitPattern: FieldAccessor;
// }
// Possibly move this under a "per" scope.
// readonly longPer: UnitPerInfo;
// readonly narrowPer: UnitPerInfo;
// readonly shortPer: UnitPerInfo;

export interface UnitInfo {
  readonly displayName: Vector1Arrow<UnitType>;
  readonly unitPattern: Vector2Arrow<PluralType, UnitType>;
}

export interface UnitsSchema {
  readonly long: UnitInfo;
  readonly narrow: UnitInfo;
  readonly short: UnitInfo;
}
