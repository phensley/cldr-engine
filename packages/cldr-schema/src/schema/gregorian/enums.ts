import { makeEnum, makeKeyedEnum } from '../../types';

export const [ Era, EraValues ] = makeKeyedEnum([
  ['BC', '0'],
  ['AD', '1']
]);

export type EraType = '0' | '1';

export const [ Month, MonthValues ] = makeKeyedEnum([
  ['JAN', '1'],
  ['FEB', '2'],
  ['MAR', '3'],
  ['APR', '4'],
  ['MAY', '5'],
  ['JUN', '6'],
  ['JUL', '7'],
  ['AUG', '8'],
  ['SEP', '9'],
  ['OCT', '10'],
  ['NOV', '11'],
  ['DEC', '12']
]);

export type MonthType = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export const [ AvailableFormat, AvailableFormatValues ] = makeEnum([
  'Bh',
  'Bhm',
  'Bhms',
  'E',
  'EBhm',
  'EBhms',
  'EHm',
  'EHms',
  'Ed',
  'Ehm',
  'Ehms',
  'Gy',
  'GyMMM',
  'GyMMMEd',
  'GyMMMd',
  'H',
  'Hm',
  'Hms',
  'Hmsv',
  'Hmv',
  'M',
  'MEd',
  'MMM',
  'MMMEd',
  'MMMMEd',
  'MMMMd',
  'MMMd',
  'Md',
  'd',
  'h',
  'hm',
  'hms',
  'hmsv',
  'hmv',
  'ms',
  'y',
  'yM',
  'yMEd',
  'yMMM',
  'yMMMEd',
  'yMMMM',
  'yMMMd',
  'yMd',
  'yQQQ',
  'yQQQQ'
]);

export type AvailableFormatType = 'Bh' | 'Bhm' | 'Bhms' | 'E' | 'EBhm' | 'EBhms' | 'EHm' |
  'EHms' | 'Ed' | 'Ehm' | 'Ehms' | 'Gy' | 'GyMMM' | 'GyMMMEd' | 'GyMMMd' | 'H' | 'Hm' |
  'Hms' | 'Hmsv' | 'Hmv' | 'M' | 'MEd' | 'MMM' | 'MMMEd' | 'MMMMEd' | 'MMMMd' | 'MMMd' |
  'Md' | 'd' | 'h' | 'hm' | 'hms' | 'hmsv' | 'hmv' | 'ms' | 'y' | 'yM' | 'yMEd' | 'yMMM' |
  'yMMMEd' | 'yMMMM' | 'yMMMd' | 'yMd' | 'yQQQ' | 'yQQQQ';

export const [ IntervalFormat, IntervalFormatValues ] = makeEnum([
  'H',
  'Hm',
  'Hmv',
  'Hv',
  'M',
  'MEd',
  'MMM',
  'MMMEd',
  'MMMd',
  'Md',
  'd',
  'h',
  'hm',
  'hmv',
  'hv',
  'y',
  'yM',
  'yMEd',
  'yMMM',
  'yMMMEd',
  'yMMMM',
  'yMMMd',
  'yMd'
]);

export type IntervalFormatType = 'H' | 'Hm' | 'Hmv' | 'Hv' | 'M' | 'MEd' | 'MMM' |
  'MMMEd' | 'MMMd' | 'Md' | 'd' | 'h' | 'hm' | 'hmv' | 'hv' | 'y' | 'yM' | 'yMEd' |
  'yMMM' | 'yMMMEd' | 'yMMMM' | 'yMMMd' | 'yMd';
