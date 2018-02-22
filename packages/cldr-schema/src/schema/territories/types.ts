import { FieldMapIndexedArrow } from '../arrows';
import { TerritoryType } from './autogen.territories';
import { Alt } from '../enums';

export interface Territories {
  displayName: FieldMapIndexedArrow<TerritoryType, Alt>;
}
