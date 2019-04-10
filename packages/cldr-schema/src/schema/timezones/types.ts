import { FieldArrow, Vector1Arrow, Vector2Arrow } from '../arrows';
import { MetaZoneType, MetaZoneValues, TimeZoneStableIds } from './autogen.timezones';
import { KeyIndex } from '../../types';

export const MetaZoneIndex = new KeyIndex(MetaZoneValues);
export const TimeZoneTypeIndex = new KeyIndex(['daylight', 'generic', 'standard']);
export type TimeZoneNameType = 'daylight' | 'generic' | 'standard';

export const TimeZoneStableIdIndex = new KeyIndex(TimeZoneStableIds);

export interface MetaZoneInfo {
  readonly short: Vector2Arrow<TimeZoneNameType, MetaZoneType>;
  readonly long: Vector2Arrow<TimeZoneNameType, MetaZoneType>;
}

export interface TimeZoneSchema {
  readonly metaZones: MetaZoneInfo;
  readonly exemplarCity: Vector1Arrow<string>;
  readonly gmtFormat: FieldArrow;
  readonly hourFormat: FieldArrow;
  readonly gmtZeroFormat: FieldArrow;
  readonly regionFormat: FieldArrow;
}
