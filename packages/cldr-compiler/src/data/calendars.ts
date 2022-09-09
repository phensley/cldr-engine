import { applyMappings, Mappings } from './utils';

const formats: (string | [string, string])[] = ['format', ['stand-alone', 'standAlone']];

const weekdays: (string | [string, string])[] = [
  ['sun', '1'],
  ['mon', '2'],
  ['tue', '3'],
  ['wed', '4'],
  ['thu', '5'],
  ['fri', '6'],
  ['sat', '7'],
];

const mappings = [
  Mappings.field('availableFormats').keys().remap(0, 1, 2),
  Mappings.field('pluralFormats').pluralKeys().remap(0, 2, 1, 3),
  Mappings.field('intervalFormats').keys().keys().remap(0, 2, 1, 3),
  Mappings.fields(['dateFormats', 'timeFormats', 'dateTimeFormats']).keys().remap(0, 1, 2),
  Mappings.fields(['dateTimeFormatsAt']).keys().remap(0, 1, 2),
  Mappings.field('intervalFormatFallback').remap(0, 1),
  Mappings.fields(['months', 'quarters']).fields(formats).keys().keys().remap(1, 0, 2, 3, 4),
  Mappings.field('dayPeriods').fields(formats).keys().altKeys({ variant: 'casing' }).keys().remap(1, 0, 2, 3, 4, 5),
  Mappings.fields(['weekdays']).fields(formats).keys().fields(weekdays).remap(1, 0, 2, 3, 4),
  Mappings.field('eras').fields(['names', 'abbr', 'narrow']).altKeys({ variant: 'sensitive' }).remap(0, 1, 2, 3, 4),
];

export const transformCalendar = (o: any): any => applyMappings(o, mappings);
