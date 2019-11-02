import {
  AltType,
  LanguageIdType,
  RegionIdType,
  ScriptIdType,
  Vector1Arrow,
  Vector2Arrow
} from '@phensley/cldr-types';

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
