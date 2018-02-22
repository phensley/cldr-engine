export * from './arrows';
export * from './enums';
export * from './calendar';
export * from './gregorian';
export * from './currencies';
export * from './numbers';
export * from './territories';
export * from './timezones';
export * from './units';

import {
  Currencies,
  Gregorian,
  Numbers,
  Territories,
  TimeZoneNames,
  Units
} from '.';

export interface Schema {
  readonly Gregorian: Gregorian;
  readonly Numbers: Numbers;
  readonly Currencies: Currencies;
  readonly Territories: Territories;
  readonly TimeZoneNames: TimeZoneNames;
  readonly Units: Units;
}
