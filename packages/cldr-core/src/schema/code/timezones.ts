import { field, scope, vector, KeyIndexImpl, Scope } from '../instructions';
import { MetaZoneIndex, TimeZoneTypeIndex } from '../schema/timezones';

export const TIMEZONE: Scope = scope('TimeZoneNames', 'TimeZones', [
  scope('metaZones', 'metaZones', [
    vector('short', ['timezone-type', 'metazone']),
    vector('long', ['timezone-type', 'metazone']),
  ]),
  vector('exemplarCity', ['timezone-id']),
  field('gmtFormat'),
  field('hourFormat'),
  field('gmtZeroFormat'),
  field('regionFormat'),
]);

export const TIMEZONE_INDICES: { [x: string]: KeyIndexImpl<string> } = {
  metazone: MetaZoneIndex,
  'timezone-type': TimeZoneTypeIndex,
};
