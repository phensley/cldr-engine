export * from './arrows';
export * from './enums';
export * from './calendar';
export * from './gregorian';
export * from './currencies';
export * from './numbers';
export * from './timezones';
export * from './units';

import {
  Currencies,
  Gregorian,
  Numbers,
  TimeZoneNames,
  Units
} from '.';

export interface Schema {
  readonly Gregorian: Gregorian;
  readonly Numbers: Numbers;
  readonly Currencies: Currencies;
  readonly TimeZoneNames: TimeZoneNames;
  readonly Units: Units;
}
