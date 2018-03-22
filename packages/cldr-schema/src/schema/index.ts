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
  CurrenciesSchema,
  DateFieldsSchema,
  GregorianSchema,
  LayoutSchema,
  NamesSchema,
  NumbersSchema,
  TimeZoneNames,
  UnitsSchema
} from '.';

export interface Schema {
  readonly DateFields: DateFieldsSchema;
  readonly Gregorian: GregorianSchema;
  readonly Layout: LayoutSchema;
  readonly Names: NamesSchema;
  readonly Numbers: NumbersSchema;
  readonly Currencies: CurrenciesSchema;
  readonly TimeZoneNames: TimeZoneNames;
  readonly Units: UnitsSchema;
}
