import { FieldArrow, FieldMapArrow, FieldMapIndexedArrow, ScopeArrow } from '../arrows';
import { Plural } from '../enums';

import {
  CalendarInfo,
  DateTimePatternFieldType,
  DayPeriodsFormats,
  FormatWidthType,
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
  intervalFormats: 'H Hm Hmv Hv M MEd MMM MMMEd MMMd Md d h hm hmv hv y yM yMEd yMMM yMMMEd yMMMM yMMMd yMd'.split(' ')
};

export interface ErasFormat {
  readonly names: FieldMapArrow<string>;
  readonly abbr: FieldMapArrow<string>;
  readonly narrow: FieldMapArrow<string>;
}

export interface IntervalFormats {
  readonly field: FieldMapArrow<DateTimePatternFieldType>;
}

export interface MonthsFormat {
  readonly abbreviated: FieldMapArrow<string>;
  readonly narrow: FieldMapArrow<string>;
  readonly wide: FieldMapArrow<string>;
  readonly short: FieldMapArrow<string>;
}

export interface MonthsFormats {
  readonly format: MonthsFormat;
  readonly standAlone: MonthsFormat;
}

export interface GregorianSchema {
  readonly eras: ErasFormat;
  readonly weekdays: WeekdaysFormats;
  readonly months: MonthsFormats;
  readonly quarters: QuartersFormats;
  readonly dayPeriods: DayPeriodsFormats;
  readonly dateFormats: FieldMapArrow<FormatWidthType>;
  readonly dateTimeFormats: FieldMapArrow<FormatWidthType>;
  readonly timeFormats: FieldMapArrow<FormatWidthType>;
  readonly availableFormats: FieldMapArrow<string>;
  readonly pluralAvailableFormats: FieldMapIndexedArrow<string, Plural>;
  readonly intervalFormats: ScopeArrow<string, IntervalFormats>;
  readonly intervalFallbackFormat: FieldArrow;
}
