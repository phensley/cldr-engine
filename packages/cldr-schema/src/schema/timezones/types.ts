import { FieldArrow, Vector1Arrow, Vector2Arrow } from '../arrows';
import { MetaZoneType, MetaZoneValues, TimeZoneType, TimeZoneValues } from './autogen.timezones';
import { KeyIndex } from '../../types';

export const MetaZoneIndex = new KeyIndex(MetaZoneValues);
export const TimeZoneIndex = new KeyIndex(TimeZoneValues);
export const TimeZoneTypeIndex = new KeyIndex(['daylight', 'generic', 'standard']);
export type TimeZoneNameType = 'daylight' | 'generic' | 'standard';

export interface MetaZoneInfo {
  readonly short: Vector2Arrow<TimeZoneNameType, MetaZoneType>;
  readonly long: Vector2Arrow<TimeZoneNameType, MetaZoneType>;
}

export interface TimeZoneSchema {
  readonly metaZones: MetaZoneInfo;
  readonly exemplarCity: Vector1Arrow<TimeZoneType>;
  readonly gmtFormat: FieldArrow;
  readonly hourFormat: FieldArrow;
  readonly gmtZeroFormat: FieldArrow;
  readonly regionFormat: FieldArrow;
}
