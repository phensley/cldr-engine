import { FieldMapArrow, FieldMapIndexedArrow } from '../arrows';
import { Alt } from '../enums';
import { ScriptType, TerritoryType } from './autogen.identifiers';

export interface ScriptNameInfo {
  readonly displayName: FieldMapArrow<ScriptType>;
}

export interface TerritoryNameInfo {
  readonly displayName: FieldMapIndexedArrow<TerritoryType, Alt>;
}

export interface Names {
  readonly scripts: ScriptNameInfo;
  readonly territories: TerritoryNameInfo;
}
