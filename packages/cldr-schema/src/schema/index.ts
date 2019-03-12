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
  BuddhistSchema,
  GregorianSchema,
  JapaneseSchema,
  PersianSchema,
 } from './calendar';

import { CurrenciesSchema } from './currencies';
import { DateFieldsSchema } from './datefields';
import { LayoutSchema, ListPatternsSchema } from './general';
import { NamesSchema } from './names';
import { NumbersSchema } from './numbers';
import { TimeZoneSchema } from './timezones';
import { UnitsSchema } from './units';

export interface Schema {
  readonly Names: NamesSchema;
  readonly Numbers: NumbersSchema;
  readonly DateFields: DateFieldsSchema;
  readonly Layout: LayoutSchema;
  readonly ListPatterns: ListPatternsSchema;
  readonly Buddhist: BuddhistSchema;
  readonly Gregorian: GregorianSchema;
  readonly Japanese: JapaneseSchema;
  readonly Persian: PersianSchema;
  readonly TimeZones: TimeZoneSchema;
  readonly Currencies: CurrenciesSchema;
  readonly Units: UnitsSchema;
}
