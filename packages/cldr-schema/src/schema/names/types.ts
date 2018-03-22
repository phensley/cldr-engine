import { FieldMapArrow, FieldMapIndexedArrow } from '../arrows';
import { Alt } from '../enums';
import { ScriptIdType, RegionIdType } from './autogen.identifiers';

export interface ScriptNameInfo {
  readonly displayName: FieldMapArrow<ScriptIdType>;
}

export interface RegionNameInfo {
  readonly displayName: FieldMapIndexedArrow<RegionIdType, Alt>;
}

export interface NamesSchema {
  readonly scripts: ScriptNameInfo;
  readonly regions: RegionNameInfo;
}
