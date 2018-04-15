import { Mapping, Mappings, applyMappings } from './utils';

const mappings = [
  Mappings.field('availableFormats').pluralKeys().remap(0, 2, 1, 3),
  Mappings.field('intervalFormats').keys().keys().remap(0, 2, 1, 3),
  Mappings.fields(['dateFormats', 'timeFormats', 'dateTimeFormats']).keys().remap(0, 1, 2),
  Mappings.field('intervalFormatFallback').remap(0, 1),
  Mappings.fields(['weekdays', 'months', 'quarters', 'dayPeriods'])
    .fields(['format', ['stand-alone', 'standAlone']]).keys().keys().remap(1, 0, 2, 3, 4),
  Mappings.field('eras').fields(['names', 'abbr', 'narrow']).keys().remap(0, 1, 2, 3)
];

export const transformCalendar = (o: any): any => applyMappings(o, mappings);
