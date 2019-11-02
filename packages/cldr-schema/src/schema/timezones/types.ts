import { MetaZoneValues, TimeZoneStableIds } from './autogen.timezones';
import { KeyIndexImpl } from '../../instructions';

export const MetaZoneIndex = new KeyIndexImpl(MetaZoneValues);
export const TimeZoneTypeIndex = new KeyIndexImpl(['daylight', 'generic', 'standard']);

export const TimeZoneStableIdIndex = new KeyIndexImpl(TimeZoneStableIds);
