import { Choice, Scope, field, scope, scopemap } from './instructions';
import { MetaZoneValues, TimeZoneValues } from '../schema/timezones';

const metaZoneFormat = (n: string) => scope(n, [
  field('daylight', 'daylight'),
  field('generic', 'generic'),
  field('standard', 'standard')
]);

export const TIME_ZONE_NAMES: Scope = scope('TimeZoneNames', [
  scopemap('timeZones', TimeZoneValues, [
    field('exemplarCity', 'exemplarCity')
  ]),
  scopemap('metaZones', MetaZoneValues, [
    metaZoneFormat('long'),
    metaZoneFormat('short')
  ])
]);
