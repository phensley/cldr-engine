import { field, scope, vector1, vector2, Scope } from '../types';
import {
  MetaZoneIndex,
  MetaZoneValues,
  TimeZoneTypeIndex,
} from '../schema/timezones';

export const TIMEZONE: Scope = scope('TimeZoneNames', 'TimeZones', [
  scope('metaZones', 'metaZones', [
    vector2('long', 'timezone-type', 'metazone'),
    vector2('short', 'timezone-type', 'metazone')
  ]),
  vector1('exemplarCity', 'timezone-id'),
  field('gmtFormat'),
  field('hourFormat'),
  field('gmtZeroFormat'),
  field('regionFormat')
]);

export const TIMEZONE_INDICES = {
  'metazone': MetaZoneIndex,
  'timezone-type': TimeZoneTypeIndex
};
