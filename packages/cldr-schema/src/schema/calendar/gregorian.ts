import { FieldArrow, FieldMapArrow, FieldMapIndexedArrow, ScopeArrow } from '../arrows';
import { Plural } from '../enums';

import {
  CalendarInfo,
  CalendarSchema,
  DateTimePatternFieldType,
  DayPeriodsFormats,
  ErasFormat,
  FormatWidthType,
  MonthsFormats,
  QuartersFormats,
  WeekdaysFormats
} from '.';

export const GregorianInfo: CalendarInfo = {
  eras: ['0', '1'],
  months: '1 2 3 4 5 6 7 8 9 10 11 12'.split(' '),
  availableFormats: ('Bh Bhm Bhms E EBhm EBhms EHm EHms Ed Ehm Ehms Gy GyMMM GyMMMEd GyMMMd ' +
    'H Hm Hms Hmsv Hmv M MEd MMM MMMEd MMMMEd MMMMd MMMd Md d h hm hms hmsv hmv ms y yM yMEd ' +
    'yMMM yMMMEd yMMMM yMMMd yMd yQQQ yQQQQ').split(' '),
  pluralAvailableFormats: ['MMMMW', 'yw'],
  intervalFormats: ('H Hm Hmv Hv M MEd MMM MMMEd MMMd Md d h hm hmv hv y yM yMEd yMMM yMMMEd ' +
    'yMMMM yMMMd yMd').split(' ')
};

export interface GregorianSchema extends CalendarSchema {

}
