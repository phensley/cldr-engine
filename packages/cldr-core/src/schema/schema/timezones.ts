import { MetaZoneValues, TimeZoneStableIds } from './autogen.timezones';
import { KeyIndexImpl } from '../instructions';

/**
 * @public
 */
export const MetaZoneIndex = new KeyIndexImpl(MetaZoneValues);

/**
 * @public
 */
export const TimeZoneTypeIndex = new KeyIndexImpl(['daylight', 'generic', 'standard']);

/**
 * @public
 */
export const TimeZoneStableIdIndex = new KeyIndexImpl(TimeZoneStableIds);
