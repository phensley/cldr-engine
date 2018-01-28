import { Currencies, Gregorian, Numbers, TimeZoneNames, Units } from './schema';

export interface Root {
  readonly Gregorian: Gregorian;
  readonly Numbers: Numbers;
  readonly Currencies: Currencies;
  readonly TimeZoneNames: TimeZoneNames;
  readonly Units: Units;
}
