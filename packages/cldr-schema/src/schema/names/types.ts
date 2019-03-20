import { Vector1Arrow, Vector2Arrow } from '../arrows';
import { AltType } from '../enums';
import {
  LanguageIdType,
  LanguageIdValues,
  RegionIdType,
  RegionIdValues,
  ScriptIdType,
  ScriptIdValues
} from './autogen.identifiers';
import { KeyIndex } from '../../types';

export const LanguageIdIndex = new KeyIndex(LanguageIdValues);
export const ScriptIdIndex = new KeyIndex(ScriptIdValues);
export const RegionIdIndex = new KeyIndex(RegionIdValues);

export interface LanguageNameInfo {
  readonly displayName: Vector1Arrow<LanguageIdType>;
}

export interface ScriptNameInfo {
  readonly displayName: Vector1Arrow<ScriptIdType>;
}

export interface RegionNameInfo {
  readonly displayName: Vector2Arrow<AltType, RegionIdType>;
}

export interface NamesSchema {
  readonly languages: LanguageNameInfo;
  readonly scripts: ScriptNameInfo;
  readonly regions: RegionNameInfo;
}
