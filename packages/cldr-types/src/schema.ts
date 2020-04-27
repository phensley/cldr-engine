import {
  DigitsArrow,
  FieldArrow,
  ScopeArrow,
  Vector1Arrow,
  Vector2Arrow,
  Vector3Arrow
} from './arrows';

import {
  DateTimePatternFieldType,
  EraWidthType,
  FormatWidthType,
} from './calendars';

import {
  DateFieldType,
  DateFieldWidthType,
  RelativeTimeFieldType
} from './datefields';

import {
  ListPatternPositionType,
} from './general';

import {
  CurrencySpacingPattern,
  CurrencySpacingPos,
  NumberMiscPatternType,
  NumberSymbolType,
  NumberSystemCategory,
  NumberSystemName
} from './numbers';

import { LanguageIdType, RegionIdType, ScriptIdType } from './autogen.identifiers';
import { ContextTransformFieldType } from './autogen.context';
import { CurrencyType } from './autogen.currencies';
import { MetaZoneType } from './autogen.timezones';
import { UnitType } from './autogen.units';

import { AltType, DayPeriodAltType, EraAltType, PluralType } from './misc';

// CALENDARS

/**
 * @public
 */
export interface CalendarFields {
  readonly weekdays: Vector2Arrow<string, string>;
  readonly months: Vector2Arrow<string, string>;
  readonly quarters: Vector2Arrow<string, string>;
  readonly dayPeriods: Vector3Arrow<string, string, DayPeriodAltType>;
}

/**
 * @public
 */
export interface CalendarSchema {
  readonly eras: Vector3Arrow<EraWidthType, string, EraAltType>;
  readonly format: CalendarFields;
  readonly standAlone: CalendarFields;
  readonly availableFormats: Vector1Arrow<string>;
  readonly pluralFormats: Vector2Arrow<PluralType, string>;
  readonly intervalFormats: Vector2Arrow<DateTimePatternFieldType, string>;
  readonly dateFormats: Vector1Arrow<FormatWidthType>;
  readonly timeFormats: Vector1Arrow<FormatWidthType>;
  readonly dateTimeFormats: Vector1Arrow<FormatWidthType>;
  readonly intervalFormatFallback: FieldArrow;
}

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BuddhistSchema extends CalendarSchema {

}

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GregorianSchema extends CalendarSchema {

}

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JapaneseSchema extends CalendarSchema {

}

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PersianSchema extends CalendarSchema {

}

// CURRENCIES

/**
 * @public
 */
export interface CurrenciesSchema {
  readonly displayName: Vector1Arrow<CurrencyType>;
  readonly decimal: Vector1Arrow<CurrencyType>;
  readonly pluralName: Vector2Arrow<PluralType, CurrencyType>;
  readonly symbol: Vector2Arrow<AltType, CurrencyType>;
}

// DATEFIELDS

/**
 * @public
 */
export interface RelativeTimeFields {
  readonly previous2: Vector1Arrow<RelativeTimeFieldType>;
  readonly previous: Vector1Arrow<RelativeTimeFieldType>;
  readonly current: Vector1Arrow<RelativeTimeFieldType>;
  readonly next: Vector1Arrow<RelativeTimeFieldType>;
  readonly next2: Vector1Arrow<RelativeTimeFieldType>;
  readonly future: Vector2Arrow<PluralType, RelativeTimeFieldType>;
  readonly past: Vector2Arrow<PluralType, RelativeTimeFieldType>;
}

// TODO: Consider moving these down and using Vector2Arrow including the width.
// it will make some code more compact.

/**
 * @public
 */
export interface RelativeTimes {
  readonly wide: RelativeTimeFields;
  readonly short: RelativeTimeFields;
  readonly narrow: RelativeTimeFields;
}

/**
 * @public
 */
export interface DateFieldsSchema {
  readonly relativeTimes: RelativeTimes;
  readonly displayName: Vector2Arrow<DateFieldType, DateFieldWidthType>;
}

// GENERAL

/**
 * @public
 */
export interface LayoutSchema {
  readonly characterOrder: FieldArrow;
  readonly lineOrder: FieldArrow;
}

/**
 * @public
 */
export interface ListPatternsSchema {
  readonly and: Vector1Arrow<ListPatternPositionType>;
  readonly andShort: Vector1Arrow<ListPatternPositionType>;
  readonly or: Vector1Arrow<ListPatternPositionType>;
  readonly unitLong: Vector1Arrow<ListPatternPositionType>;
  readonly unitNarrow: Vector1Arrow<ListPatternPositionType>;
  readonly unitShort: Vector1Arrow<ListPatternPositionType>;
}

/**
 * @public
 */
export interface ContextTransformsSchema {
  readonly contextTransforms: Vector1Arrow<ContextTransformFieldType>;
}

// NAMES

/**
 * @public
 */
export interface LanguageNameInfo {
  readonly displayName: Vector2Arrow<AltType, LanguageIdType>;
}

/**
 * @public
 */
export interface ScriptNameInfo {
  readonly displayName: Vector2Arrow<AltType, ScriptIdType>;
}

/**
 * @public
 */
export interface RegionNameInfo {
  readonly displayName: Vector2Arrow<AltType, RegionIdType>;
}

/**
 * @public
 */
export interface NamesSchema {
  readonly languages: LanguageNameInfo;
  readonly scripts: ScriptNameInfo;
  readonly regions: RegionNameInfo;
}

// NUMBERS

/**
 * @public
 */
export interface CurrencyFormats {
  readonly standard: FieldArrow;
  readonly accounting: FieldArrow;
  readonly short: DigitsArrow<PluralType>;
  readonly spacing: Vector2Arrow<CurrencySpacingPos, CurrencySpacingPattern>;
  readonly unitPattern: Vector1Arrow<PluralType>;
}

/**
 * @public
 */
export interface DecimalFormats {
  readonly standard: FieldArrow;
  readonly short: DigitsArrow<PluralType>;
  readonly long: DigitsArrow<PluralType>;
}

/**
 * @public
 */
export interface NumberSystemInfo {
  readonly symbols: Vector1Arrow<NumberSymbolType>;
  readonly currencyFormats: CurrencyFormats;
  readonly decimalFormats: DecimalFormats;
  readonly percentFormat: FieldArrow;
  readonly scientificFormat: FieldArrow;
  readonly miscPatterns: Vector1Arrow<NumberMiscPatternType>;
}

/**
 * @public
 */
export interface NumbersSchema {
  readonly minimumGroupingDigits: FieldArrow;
  readonly numberSystems: Vector1Arrow<NumberSystemCategory>;
  readonly numberSystem: ScopeArrow<NumberSystemName, NumberSystemInfo>;
}

// TIMEZONES

/**
 * @public
 */
export type TimeZoneNameType = 'daylight' | 'generic' | 'standard';

/**
 * @public
 */
export interface MetaZoneInfo {
  readonly short: Vector2Arrow<TimeZoneNameType, MetaZoneType>;
  readonly long: Vector2Arrow<TimeZoneNameType, MetaZoneType>;
}

/**
 * @public
 */
export interface TimeZoneSchema {
  readonly metaZones: MetaZoneInfo;
  readonly exemplarCity: Vector1Arrow<string>;
  readonly gmtFormat: FieldArrow;
  readonly hourFormat: FieldArrow;
  readonly gmtZeroFormat: FieldArrow;
  readonly regionFormat: FieldArrow;
}

// UNITS

/**
 * @public
 */
export interface UnitInfo {
  readonly unitPattern: Vector2Arrow<PluralType, UnitType>;
  readonly displayName: Vector1Arrow<UnitType>;
  readonly perUnitPattern: Vector1Arrow<UnitType>;
  readonly perPattern: FieldArrow;
  readonly timesPattern: FieldArrow;
  // TODO: coordinate display names and patterns
}

/**
 * @public
 */
export interface UnitsSchema {
  readonly long: UnitInfo;
  readonly narrow: UnitInfo;
  readonly short: UnitInfo;
}

// ROOT SCHEMA

/**
 * @public
 */
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
  readonly ContextTransforms: ContextTransformsSchema;
}
