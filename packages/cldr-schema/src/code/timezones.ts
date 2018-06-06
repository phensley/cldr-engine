import { field, scope, vector1, vector2, KeyIndex, Scope } from '../types';
import {
  MetaZoneIndex,
  MetaZoneValues,
  TimeZoneIndex,
  TimeZoneTypeIndex,
  TimeZoneValues
} from '../schema/timezones';

export const TIMEZONE: Scope = scope('TimeZoneNames', 'TimeZones', [
  scope('metaZones', 'metaZones', [
    vector2('long', TimeZoneTypeIndex, MetaZoneIndex),
    vector2('short', TimeZoneTypeIndex, MetaZoneIndex)
  ]),
  vector1('exemplarCity', TimeZoneIndex),
  field('gmtFormat'),
  field('hourFormat'),
  field('gmtZeroFormat'),
  field('regionFormat')
]);
