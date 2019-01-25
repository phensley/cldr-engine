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
  readonly Buddhist: BuddhistSchema;
  readonly DateFields: DateFieldsSchema;
  readonly Gregorian: GregorianSchema;
  readonly Japanese: JapaneseSchema;
  readonly Persian: PersianSchema;
  readonly Layout: LayoutSchema;
  readonly ListPatterns: ListPatternsSchema;
  readonly Names: NamesSchema;
  readonly Numbers: NumbersSchema;
  readonly Currencies: CurrenciesSchema;
  readonly TimeZones: TimeZoneSchema;
  readonly Units: UnitsSchema;
}
