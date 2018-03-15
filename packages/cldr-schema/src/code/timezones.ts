import { Scope, field, scope, scopemap } from './instructions';
import { MetaZoneValues, TimeZoneValues } from '../schema/timezones';

const metaZoneFormat = (n: string) => scope(n, n, [
  field('daylight', 'daylight'),
  field('generic', 'generic'),
  field('standard', 'standard')
]);

export const TIME_ZONE_NAMES: Scope = scope('TimeZoneNames', 'TimeZoneNames', [
  scopemap('timeZones', TimeZoneValues, [
    field('exemplarCity', 'exemplarCity')
  ]),

  scopemap('metaZones', MetaZoneValues, [
    metaZoneFormat('long'),
    metaZoneFormat('short')
  ]),

  field('gmtFormat', 'gmtFormat'),
  field('hourFormat', 'hourFormat'),
  field('gmtZeroFormat', 'gmtZeroFormat'),
  field('regionFormat', 'regionFormat')
]);
