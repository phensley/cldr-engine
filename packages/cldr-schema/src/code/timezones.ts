import { KeyIndex, Scope, field, scope, scopemap, vector1, vector2 } from '../types';
import { MetaZoneIndex, MetaZoneValues, TimeZoneIndex, TimeZoneTypeIndex, TimeZoneValues } from '../schema/timezones';

export const TIMEZONE: Scope = scope('TimeZoneNames', 'TimeZoneNames', [
  scope('metaZones', 'metaZones', [
    vector2('long', 'long', TimeZoneTypeIndex, MetaZoneIndex),
    vector2('short', 'short', TimeZoneTypeIndex, MetaZoneIndex)
  ]),
  vector1('exemplarCity', 'exemplarCity', TimeZoneIndex),
  field('gmtFormat', 'gmtFormat'),
  field('hourFormat', 'hourFormat'),
  field('gmtZeroFormat', 'gmtZeroFormat'),
  field('regionFormat', 'regionFormat')
]);
