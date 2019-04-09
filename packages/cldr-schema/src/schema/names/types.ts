import { Vector1Arrow, Vector2Arrow } from '../arrows';
import { AltType } from '../enums';
import {
  LanguageIdType,
  RegionIdType,
  ScriptIdType,
} from './autogen.identifiers';

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
