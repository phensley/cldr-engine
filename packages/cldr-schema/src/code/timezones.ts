import { field, scope, vector1, vector2, Scope } from '../types';
import {
  MetaZoneIndex,
  MetaZoneValues,
  TimeZoneIndex,
  TimeZoneTypeIndex,
  TimeZoneValues
} from '../schema/timezones';

export const TIMEZONE: Scope = scope('TimeZoneNames', 'TimeZones', [
  scope('metaZones', 'metaZones', [
    vector2('long', 'time-zone-type', 'meta-zone'),
    vector2('short', 'time-zone-type', 'meta-zone')
  ]),
  vector1('exemplarCity', 'time-zone'),
  field('gmtFormat'),
  field('hourFormat'),
  field('gmtZeroFormat'),
  field('regionFormat')
]);

export const TIMEZONE_INDICES = {
  'meta-zone': MetaZoneIndex,
  'time-zone': TimeZoneIndex,
  'time-zone-type': TimeZoneTypeIndex
};

export const TIMEZONE_VALUES = {
  'meta-zone': MetaZoneValues,
  'time-zone': TimeZoneValues
};