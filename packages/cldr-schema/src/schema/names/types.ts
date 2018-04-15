import { Vector1Arrow, Vector2Arrow } from '../arrows';
import { AltType } from '../enums';
import { ScriptIdType, ScriptIdValues, RegionIdType, RegionIdValues } from './autogen.identifiers';
import { KeyIndex } from '../../types';

export const ScriptIdIndex = new KeyIndex(ScriptIdValues);
export const RegionIdIndex = new KeyIndex(RegionIdValues);

export interface ScriptNameInfo {
  readonly displayName: Vector1Arrow<ScriptIdType>;
}

export interface RegionNameInfo {
  readonly displayName: Vector2Arrow<AltType, RegionIdType>;
}

export interface NamesSchema {
  readonly scripts: ScriptNameInfo;
  readonly regions: RegionNameInfo;
}
