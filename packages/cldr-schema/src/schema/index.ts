export * from './arrows';
export * from './enums';

export * from './datefields';
export * from './calendar';
export * from './general';
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
  ListPatternsSchema,
  NamesSchema,
  NumbersSchema,
  PersianSchema,
  TimeZoneNames,
  UnitsSchema
} from '.';

export interface Schema {
  readonly DateFields: DateFieldsSchema;
  readonly Gregorian: GregorianSchema;
  readonly Persian: PersianSchema;
  readonly Layout: LayoutSchema;
  readonly ListPatterns: ListPatternsSchema;
  readonly Names: NamesSchema;
  readonly Numbers: NumbersSchema;
  readonly Currencies: CurrenciesSchema;
  readonly TimeZoneNames: TimeZoneNames;
  readonly Units: UnitsSchema;
}
