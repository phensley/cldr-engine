import { FieldArrow, MetaZoneType } from '@phensley/cldr-types';
import { Vector1Arrow, Vector2Arrow } from '../arrows';
import { MetaZoneValues, TimeZoneStableIds } from './autogen.timezones';
import { KeyIndexImpl } from '../../instructions';

export const MetaZoneIndex = new KeyIndexImpl(MetaZoneValues);
export const TimeZoneTypeIndex = new KeyIndexImpl(['daylight', 'generic', 'standard']);
export type TimeZoneNameType = 'daylight' | 'generic' | 'standard';

export const TimeZoneStableIdIndex = new KeyIndexImpl(TimeZoneStableIds);

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
