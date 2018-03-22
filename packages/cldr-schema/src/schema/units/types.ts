import { FieldArrow, FieldIndexedArrow, ScopeArrow } from '../arrows';
import { Plural } from '../enums';
import { UnitType } from './autogen.units';

// TODO:
// export interface UnitPerInfo {
//   readonly compoundUnitPattern: FieldAccessor;
// }
// Possibly move this under a "per" scope.
// readonly longPer: UnitPerInfo;
// readonly narrowPer: UnitPerInfo;
// readonly shortPer: UnitPerInfo;

export interface UnitInfo {
  readonly displayName: FieldArrow;
  readonly unitPattern: FieldIndexedArrow<Plural>;
}

export interface UnitsSchema {
  readonly long: ScopeArrow<UnitType, UnitInfo>;
  readonly narrow: ScopeArrow<UnitType, UnitInfo>;
  readonly short: ScopeArrow<UnitType, UnitInfo>;
}
