import { FieldArrow, ScopeArrow } from '../arrows';
import { MetaZoneType, TimeZoneType } from './autogen.timezones';

export interface MetaZoneFormat {
  readonly daylight: FieldArrow;
  readonly generic: FieldArrow;
  readonly standard: FieldArrow;
}

export interface MetaZoneInfo {
  readonly short: MetaZoneFormat;
  readonly long: MetaZoneFormat;
}

export interface TimeZoneInfo {
  readonly exemplarCity: FieldArrow;
}

export interface TimeZoneNames {
  readonly gmtFormat: FieldArrow;
  readonly gmtZeroFormat: FieldArrow;
  readonly hourFormat: FieldArrow;
  readonly regionFormat: FieldArrow;
  readonly metaZones: ScopeArrow<MetaZoneType, MetaZoneInfo>;
  readonly timeZones: ScopeArrow<TimeZoneType, TimeZoneInfo>;
}
