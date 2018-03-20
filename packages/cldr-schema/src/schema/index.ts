export * from './arrows';
export * from './enums';

export * from './datefields';
export * from './calendar';
export * from './general';
export * from './gregorian';
export * from './currencies';
export * from './names';
export * from './numbers';
export * from './timezones';
export * from './units';

import {
  Currencies,
  DateFields,
  Gregorian,
  Layout,
  Names,
  Numbers,
  TimeZoneNames,
  Units
} from '.';

export interface Schema {
  readonly DateFields: DateFields;
  readonly Gregorian: Gregorian;
  readonly Layout: Layout;
  readonly Names: Names;
  readonly Numbers: Numbers;
  readonly Currencies: Currencies;
  readonly TimeZoneNames: TimeZoneNames;
  readonly Units: Units;
}
