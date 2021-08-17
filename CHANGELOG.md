# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project This project uses a **modified semantic versioning** scheme. See [README](README.md#versioning) for more details.

## [1.3.1]

## Fixed/Changed

- Set `inlineSources: true` to add Typescript source code to source maps.

## [1.3.0]

## Fixed/Changed

- Upgrade to [CLDR v39](http://cldr.unicode.org/index/downloads/cldr-39)

## [1.2.8]

## Fixed/Changed

- Set `inlineSources: true` to add Typescript source code to source maps.

## [1.2.7]

### Fixed/Changed

- Upgrade to [tzdb 2021a](https://www.iana.org/time-zones)

## [1.2.6]

### Added

- The `cldr-compiler pack` command now includes the ability to apply patches to the resource packs, allowing you to replace CLDR values with your own. See [the included example](./packages/cldr/example-patch.yaml).
- A new command `cldr-compiler schema` will dump the CLDR data schema used to generate resource packs. This is helpful in identifying the full path to a value you may want to patch.

## [1.2.5]

### Fixed/Changed

- Fix types for character/line order.
- Use default JSON export for version string.

## [1.2.4]

### Added

- Methods on `CalendarDate` for ISO weeks.

## [1.2.3]

### Fixed/Changed

- Upgrade to [tzdb 2020f](https://www.iana.org/time-zones)

## [1.2.2]

### Added

- The `phensley/timezone` package includes a new `TZ.zoneMeta` method to return metadata for a timezone. This can be useful for displaying user interfaces for choosing a timezone. The new properties are:

  - `stdoffset` - Current standard offset, in milliseconds.
  - `latitude` - Latitude to 6 decimal places, for the timezone's "principal location"
  - `longitude` - Latitude to 6 decimal places, for the timezone's "principal location"
  - `countries` - List of ISO 3166 2-letter country codes for countries which overlap the timezone.

- The `cldr.Calendars.timeZoneInfo` result `TimeZoneInfo` now includes the same properties as `TZ.zoneMeta` above, plus the following property:

  - `metazone` Current [CLDR metazone](http://www.unicode.org/reports/tr35/tr35-dates.html#Metazone_Names) for the timezone.

## [1.2.1]

### Fixed/Changed

- Use `tslib ^1.13.0`

## [1.2.0]

### Fixed/Changed

- Project now uses standard semantic versioning, see [README](https://github.com/phensley/cldr-engine/#versioning)
- All `@phensley/*` package interdependencies now use the `^x.x.x` constraint.
- Removed the internal package `@phensley/cldr-schema`, merging its code into `@phensley/cldr-core`.
- Switched from tslint to eslint.
- Modified checksum so that resource packs are now compatible at the patch level. Resource packs must match the `major.minor` version of the `@phensley/cldr-core` package at runtime to ensure schema compatibility.

## [1.1.2]

### Added

- `CLDR.Numbers.parseDecimal` convenience method to parse a number or string into a `Decimal` instance.
- `CLDR.Calendars.timeZoneFromUTC` and `CLDR.Calendars.timeZoneFromWall` convenience methods to lookup time zone info from either a UTC or local "wall clock" timestamp.

### Fixed/Changed

- Upgrade to [tzdb 2020a](https://www.iana.org/time-zones)

## [1.1.1]

### Added

- Currency formatting can now use the `trimZeroFractions` option to format an amount as a whole number when the fractional digits are all zero. With this option `10.00` formats as `"$10"`, but `10.10` would still format as `"$10.10"`. This option has no effect if the `minimumFractionDigits` option is also set.

## [1.1.0]

### Added

- Upgrade to [CLDR v37](http://cldr.unicode.org/index/downloads/cldr-37)
- New methods to construct dates from one or more fields, e.g. `Calendars.newGregorianDate(fields)` for each calendar type.
- New methods to construct "now" dates, e.g. `Calendars.now()` and `Calendars.nowGregorian()` for each calendar type.
- `CalendarDate.asJSDate()` converts a `CalendarDate` to a JavaScript `Date`.
- `CalendarDate.set(fields)` to set one or more fields on a date.
- `CalendarDate.fields()` returns a `TimePeriod` populated with a date's field values.
- `CalendarDate.toISOString()` returns an Gregorian ISO-8601 string of the UTC timestamp.
- `CalendarDate.toLocalISOString()` returns an Gregorian ISO-8601 string of the local timestamp.
- `Calendars.formatDateWrapper()` method to wrap a date and time that have been formatted separately. Can be used to join a relative date format with a time, e.g. "Next Wednesday at 3:30 PM".
- `CalendarDate.differenceSigned()` method to return signed values (`.difference()` returns absolute value).
- Timezone records can now be queried using local "wall clock" time.
- Date formatting options now accept an optional `alt` property:
  - The `era` default for Gregorian is "Before Christ" and "Anno Domini".
    Specifying the `{ alt: { era: 'sensitive' }}` option will use "Before Common Era" and "Common Era".
  - The `dayPeriod` default for Gregorian in US English is "AM" and "PM".
    Specifying the `{ alt: { dayPeriod: 'casing' }}` option will use lowercase forms "am" and "pm".
- Expose the `Calendars.firstDayOfWeek()` and `Calendars.minDaysInFirstWeek()` methods.

#### Breaking Changes

- The following values of `UnitType` have been renamed in the underlying CLDR data.

  | old                        | new                           |
  | -------------------------- | ----------------------------- |
  | `meter-per-second-squared` | `meter-per-square-second`     |
  | `part-per-million`         | `permillion`                  |
  | `liter-per-100kilometers`  | `liter-per-100-kilometer`     |
  | `millimeter-of-mercury`    | `millimeter-ofhg`             |
  | `pound-per-square-inch`    | `pound-force-per-square-inch` |
  | `inch-hg`                  | `inch-ofhg`                   |
  | `pound-foot`               | `pound-force-foot`            |

### Fixed/Changed

- `TimePeriod` fields are no longer optional, and `CalendarDate.add` and `.subtract` now take a `Partial<TimePeriod>` to allow fields to be omitted.
- `CalendarDate.toString` now formats the era-less extended year for consistency.
- Internal: generalized the vector arrow type in the schema, to support creation of higher-dimension arrows while reducing runtime code size.

## [1.0.9]

### Added

- Added readmes for several packages.

### Fixed/Changed

- Fix unnecessary dependencies on `@phensley/cldr-types` package.
- Upgrade all regular and development dependencies.

## [1.0.8]

- Broken release.

## [1.0.7]

### Fixed/Changed

- Improve defaulting for number formatting minimum integer options.
- Fix defaulting to non-`latn` number systems for compact number formats.
- Fix rare decimal division rounding bug caused by a leading zero on remainder.
- Test coverage increased to 100% of all branches.

## [1.0.6]

### Fixed/Changed

- Fix bug handling invalid inputs in calendar date converters.

## [1.0.5]

### Fixed/Changed

- Improved use of locale matcher with an array `LanguageTag` and `Locale` instances.

## [1.0.4]

### Fixed/Changed

- Fixed bug in new language resolver index and interned the region subtag.
- Stop exporting `leftPad` internal function.

## [1.0.3]

### Added

- Method on `LanguageResolver` to substitute aliases in a language tag
- `LocaleMatcher` can be passed an array of language tag and locale instances, bypassing parsing.
- `LocaleMatcher` constructor now accepts an options parameter.
  - Option `resolve: boolean` can be used to disable locale resolution if the tags have already been fully resolved.

### Fixed/Changed

- Optimizations:
  - Construction of the available locales array on first access.
  - Indices used for language resolution and language aliases.
  - Conversion of language tags to "fast tag" representation internally.
  - Locale matcher will substitute aliases instead of resolving if it sees all subtags are present on a language tag.
  - Pre-encode paradigm locales map to avoid going through resolver.

## [1.0.2]

### Fixed/Changed

- Correct handling of `Date` arguments to calendar methods.

## [1.0.1]

### Fixed/Changed

- Support negative offsets in plural message formatter.

## [1.0.0]

### Fixed/Changed

- Add [TSDoc](https://github.com/Microsoft/tsdoc) modifiers to all exported types.
- Configured all packages to use [api-extractor](https://api-extractor.com/) to detect API changes.
- Various cleanups to prep 1.0.0 release.

## [0.26.0]

- No changes, increased test coverage

## [0.25.22]

### Fixed/Changed

- Ensure message formatter prefixes don't conflict

## [0.25.21]

### Fixed/Changed

- Sort date skeletons for consistent matching.

## [0.25.20]

### Added

- Exported argument converter types for the message formatter

## [0.25.19]

### Added

- Exported argument converter types for the message formatter

## [0.25.18]

### Fixed/Changed

- Rename the generic temperature unit to `temperature`.

## [0.25.17]

### Added

- Message formatter now supports a custom argument conversion option.

## [0.25.16]

### Fixed/Changed

- Date formatting options now support mixing date/time standard formats (`short`, `medium`, etc) with skeletons. For example `formatDate(date, { date: 'short', skeleton: 'hm' })`

## [0.25.15]

### Added

- Method to fetch `SchemaConfig` from the `CLDRFramework`.
- Method to get exponent of a `Decimal`.

### Fixed/Changed

- Changed cost function used to find shortest paths in the unit conversion graph.
- The conversion graph now remains static after it is first build. Instead of updating the graph incrementally with direct conversion factors, we cache and return the full unit conversion paths.

## [0.25.14]

### Fixed/Changed

- Ensure milliseconds are always integers during date conversion

## [0.25.13]

### Fixed/Changed

- Removed use of `String.codePointAt` that affected IE11 w/out polyfills
- Fixed relative time arrow order in schema
- Ensure date millis are rounded to integer

## [0.25.12]

### Fixed/Changed

- Change defaulting of number formatting significant digits options

## [0.25.11]

### Added

- Support hiding of tags in ICU messages.

## [0.25.10]

### Added

- Include rbnf-related patches in `cldr-compiler` package.

## [0.25.9]

### Fixed/Changed

- Fixed a regression in compact rounding edge case.

## [0.25.8]

### Fixed/Changed

- Fixes to decimal math: right shifting beyond precision, addition and subtraction with zero, and improved subtraction borrow-handling. More coverage.

## [0.25.7]

### Added

- Optional `@phensley/unit-converter` package allowing customized conversion between units. Comes with default conversion factors for most CLDR units.

## [0.25.6]

### Fixed/Changed

- Divsion scale mode use abs(scale)
- Added a stress test for decimal math operations

## [0.25.5]

### Added

- Calculation of plural categories for decimal ranges added to `@phensley/plurals`
- Added minimal perfect hashing implementation
- Added unit categories, mapped to units via minimal perfect hashing

### Fixed/Changed

- Simplfied `Decimal` division and fixed edge cases with `scale` math context
- Removed errant `times` unit that slipped in due to a bug in filtering out unit patterns

## [0.25.4]

### Fixed/Changed

- Improved defaulting for date interval formatting when skeleton option is omitted.
- Additional `date` and `time` skeleton options for date interval formatting. These are used when the start and end dates differ by more or less than 1 day.

## [0.25.3]

### Fixed/Changed

- API for display names now supports passing either a `string` or `LanguageTag` argument
- Language display names now uses the script and region subtags for matches.
- All display name methods will attempt a best match, falling back to matching with likely subtags added.

## [0.25.2]

### Fixed/Changed

- Ensure formatted timezone offset minutes is an integer
- Decimal formatting uses significant digits if minSig >= 0 and maxSig > 0
- Ensure Decimal right shift doesn't exceed array length

## [0.25.1]

### Fixed/Changed

- Avoid leading zeros in compact formats with explicit divisor

## [0.25.0]

### Fixed/Changed

Split locale-related code into 3 new packages which can be used independently of the main library:

- `@phensley/language-tag` implements BCP 47 language tag parsing and construction.
- `@phensley/locale` implements resolving of language tags by alias and likely subtags substitution.
- `@phensley/locale-matcher` implements distance based locale matching using the CLDR enhanced language matching algorithm.

## [0.24.0]

### Fixed/Changed

- Improve `@phensley/plurals` and `@phensley/messageformat` APIs
- Support for explicit region in plural rule selection, e.g. `"pt-PT"`

## [0.23.0]

### Fixed/Changed

- Support for negative zero in `@phensley/decimal`
- Added option for formatting negative zero
- Improvements to plural number operands calculations
- Faster plural calculations

## [0.22.3]

### Added

- Exported `MessageFormatter` and `MessageFormatterOptions` from top-level packages

## [0.22.2]

### Added

- Added `MessageFormatter` class which caches parsed messages internally.
- Added `General.messageFormatter(options)` method to create a message formatter for the current locale.

## [0.22.1]

### Fixed/Changed

- Plural methods now accept `Decimal`, `number`, or `string` (containing a valid number).

## [0.22.0]

### Fixed/Changed

- Plural rule evaluation now takes `Decimal` argument instead of number operands.
- Switched plural calculations to use arbitrary precision for all number operand fields.
- Extracted all plural samples to use as test cases.
- Moved plural operands from the `decimal` package into `plurals`.
- Fixed sign issue in subtract.

## [0.21.2]

### Fixed/Changed

- Corrected package dependencies for `@phensley/cldr-types`

## [0.21.1]

### Fixed/Changed

- Exported `MessageMatcher` type

## [0.21.0]

### Added

- Rule-based number formatting extension package `@phensley/cldr-ext-rbnf`. This will enable formatting using the global algorithmic numbering systems as well as named rules. This is implemented as an extension to the main library but is not currently integrated.

### Fixed/Changed

- Migrated many shared types to new `@phensley/cldr-types` package. This will eventually enable the core library and extension packages to be able to interface.
- Message formatter matcher is now reusable across multiple parses, which doubles the speed of parsing.

## [0.20.4]

### Fixed/Chaged

- Renamed `default` properties inside resource packs. This avoids confusion with the `default` property that is added by some module loaders, since resource packs can be loaded via `require()`, etc.
- The message format parser now buffers text when it detects an apostrophe escaped section, ensuring that adjacent text and escaped text is emitted as a single `TEXT` node.
- Locale distance partitions are now arrays instead of sets, simplifying iteration over them.
- Resource packs now use the `"_"` UNDERSCORE character to separate fields, resulting in a ~10-20% reduction in each resource pack's size.
- Embedded timezone and metazone data now uses UNDERSCORE character to separate fields.

## [0.20.3]

### Fixed/Changed

- Message format parser now produces a result that can be serialized to/from JSON/YAML or embedded into JavaScript code. Shifted Decimal-casting of plural exact match arguments to the evaluation phase.

## [0.20.2]

### Added

- Export `@phensley/messageformatter` public types from `@phensley/cldr-core` as well.

## [0.20.1]

### Added

- Export `@phensley/messageformatter` public types from `@phensley/cldr` so they're included in the UMD bundle.

## [0.20.0]

### Added

- Added an extensible ICU message formatter parser and evaluation engine in `@phensley/messageformatter` package.

### Fixed/Changed

- Split plural rules engine into `@phensley/plurals` package so it can be used standalone.

## [0.19.5]

### Fixed/Changed

- Upgrade to [tzdb 2019c](https://www.iana.org/time-zones)

## [0.19.4]

### Added

- New command `cldr-compiler dump` which dumps a resource pack, showing the internal structure.

### Fixed/Changed

- Bug fix for locales that have multiple plural categories define only a single `unitPattern` under the `'other'` plural category. Now we explicitly fallback to `'other'`.
- Japanese calendar in the `ja` locale now correctly encodes the date formats; they were blank in previous releases. We currently use latin digits for this locale but once RBNF is supported the year field will be formatted using the `jpanyear` rule.

## [0.19.3]

### Fixed/Changed

- Use official [cldr json](https://github.com/unicode-cldr) download locations now that version 36 is released.

## [0.19.2]

### Added

- Added `numericOnly: boolean` and `alwaysNow: boolean` to relative time formatters.

## [0.19.1]

### Fixed/Changed

- Support 'times' unit compound patterns
- Add `times` unit to `Quantity` type

## [0.19.0]

### Fixed/Changed

- Upgraded [cldr 36](http://cldr.unicode.org/index/downloads/cldr-36).

## [0.18.3]

### Fixed/Changed

- Converted runtime-constructed digit/symbol matchers to use native regexps to prevent re-encodes by transpilers.

## [0.18.2]

### Fixed/Changed

- Add number adjustment to `RelativeTimeFieldFormatOptions`

## [0.18.1]

### Fixed/Changed

- Fix calculation of fractional weeks in calendar math rollup

## [0.18.0]

### Added

- New `TimePeriod` type to represent time between two dates in terms of years, months, etc.
- New `Calendars.formatRelativeTime` method which formats the relative time between two dates
  - User can specify the relative time field, or it will be automatically determined using `difference`
- New `Calendars.timePeriodToQuantity` method to convert a time period into a `Quantity` sequence suitable for unit formatting
- New `CalendarDate.difference` method to compute the difference between two dates, returning a `TimePeriod`
  - Can specify the difference result to be expressed using any combination of fields, and the `TimePeriod` will be "rolled up" into only those fields, e.g. `['year', 'day']`, `['day', 'hour', 'minute']`, etc
- New `CalendarDate.compare` method to compares two dates, returning an integer indicating the date is less than (`-1`), equal to (`0`), or greater than (`1`) the argument
- New `CalendarDate.relativeTime` method to compute the relative time between two dates in terms of a single field, e.g. `N years`
- New `CalendarDate.subtract` method equivalent to `add(-timeperiod)`
- New `CalendarDate.withZone` method to return a copy using a different time zone
- Export more top-level types

### Fixed/Changed

- Improvements to calendar math
- Replaced `CalendarDateFields` with `TimePeriod`
- Renamed `fieldOfGreatestDifference` to `fieldOfVisualDifference` to more accurately reflect its purpose, since it is primarily used to determine the pivot field for date interval formatting
- `formatRelativeTimeField` options type is now `RelativeTimeFieldFormatOptions` to distinguish it from the options type for `formatRelativeTime` method
- Use `tslib` 1.10.x
- Resource packs are now distributed uncompressed, to support direct loading over CDNs

## [0.17.6]

### Fixed/Changed

- Use `lerna.json` to pull version string into library

## [0.17.5]

### Added

- Export more top-level types

## [0.17.4]

### Fixed/Changed

- Narrower field type accepted in `formatRelativeTimeField`

## [0.17.3]

### Fixed/Changed

- Upgrade to [tzdb 2019b](https://www.iana.org/time-zones)

## [0.17.2]

### Fixed/Changed

- Improve argument validation and error message for `LocaleMatcher`

## [0.17.1]

### Fixed/Changed

- Improve argument validation and error messages for `CLDRFramework.get/getAsync`

## [0.17.0]

### Added

- Added `Numbers.adjustDecimal(num, options): Decimal` method to adjust a decimal number using options, e.g. min/max fractions, etc.

### Fixed/Changed

- Changed `getCurrencyDisplayName` and `getCurrencyPluralName` methods to take a number argument, which will be used to compute the plural category, and a options object to determine the display context.
- The `getPluralCardinal` and `getPluralOrdinal` methods now accept decimal adjustment options, to adjust the number before the plural calculation happens. Omitting the options will interpret the number as-is.
- Fixed leap year off-by-1 bug in `PersianDate`

## [0.16.0]

### Fixed/Changed

- Added `DisplayNameOptions` to methods for language, script, and region names.
- Lazy initialize some internal instances.

## [0.15.3]

### Fixed/Changed

- Fix Decimal compare against Infinity.
- Increase test coverage
- Minor code size optimizations

## [0.15.2]

### Fixed/Changed

- Typescript 3.5.1
- Further optimization of output for smaller gzip sizes.
- Use base-36 encodings for resource pack exception arrays, day period minutes, timezone offsets and indices.

## [0.15.1]

### Fixed/Changed

- Further optimization of output for smaller gzip sizes.

## [0.15.0]

### Fixed/Changed

- Generate code to produce smaller gzip output.
- Removed z85 and variable unsigned integer encodings. This increases uncompressed JavaScript and resource pack sizes by ~20%, but produces ~10% smaller gzip-compressed size.
- All packages now have exact verson pins.
- Fixed issue where `Etc/GMT+-[digit]` time zones mapped to the `GMT` metazone.

## [0.14.8]

### Fixed/Changed

- Alter how `@phensley/cldr` default schema configuration is initialized.
- Created initial UMD rollup of the `@phensley/cldr` library.
- Save some space by storing only the first digit for decimal digit sets whose Unicode codepoints are increasing.

## [0.14.6]

### Fixed/Changed

- Pin versions of dependencies.

## [0.14.5]

### Fixed/Changed

- Added `NaN` and signed `Infinity` values to `Decimal` type. Operations involving these values follow IEEE 754-2008. For example, division by zero will now return signed infinity.
- Bug in `compare()` with zero. Current representation of sign and `ZERO` has too many edge cases, will be corrected in a future release.

## [0.14.4]

### Fixed/Changed

- Improved matching of undefined locale. Ensures language tag extensions are passed through the locale matcher and resource bundle builder.

## [0.14.3]

### Fixed/Changed

- Bug: if locale matcher found an exact match, extensions would not be applied to the resulting tag.

## [0.14.2]

### Fixed/Changed

- Synchronize enhanced language distance rules with upstream. Minor change in language distance between `en-GB` and `en-US`.

## [0.14.1]

### Added

- Added a `Calendars.resolveTimeZoneId` which maps a timezone id or alias to the current TZDB identifier for that zone.
- Added the miscellaneous number patterns to the schema keyed by `NumberMiscPatternType` values `at-least`, `at-most`, `approx` and `range`. These are not yet used for formatting.
- Compiler now validates custom schema configs when generating resource packs, reporting differences agains the full schema config.

### Fixed/Changed

- Upgraded [cldr 35.1](http://cldr.unicode.org/index/downloads/cldr-35).
- Improved calendar date math. Fractional years now computed in terms of months so adding .25 years is equivalent to 3 even months.
- Moved calendar available formats and interval formats to schema config.
- Split the pluralized calendar available formats to their own schema method.
- The `Calendars.timeZoneIds` method now returns an array of valid TZDB identifiers instead of CLDR stable timezone identifiers.
- The `Calendars.timeZoneInfo` method now accepts a timezone identifier or alias and returns a record containing the resolved TZDB identifier and exemplar city name.
- Added `UnitFormatStyleType` to omit the `percent` and `permille` styles from the unit formatter.

## [0.13.7]

### Added

- Implemented cash rounding for currency formatting.
- Currency options now accepts `cash: boolean` to enable cash rounding.
- Decimal, currency and unit formatting options now accept a `divisor` option, used to format numbers compactly in terms of an explicit power of 10, e.g. `0.34K`, `12,456 thousand`, `2,887 billion`, etc.

## [0.13.6]

### Fixed/Changed

- Drop utf-8 encoding before checksumming the schema config.
- FNV-1A checksum is now incremental.
- Ensure schema config indices are checksummed in correct order.

## [0.13.5]

### Fixed/Changed

- Compute a checksum of the schema configuration and add this to the resource packs.
- Enforce checksum and version matches at runtime. Any mismatch will throw an error.

## [0.13.4]

### Added

- New interface for schema customization (experimental). See [example application](https://github.com/phensley/cldr-engine-customization-example)

## [0.12.1]

### Fixed/Changed

- Removed unused timezone aliases already covered in tzdb / `@phensley/timezone`
- Changed types used in number parts representations:
  - Identify `'integer'` and `'fraction'` digit types.
  - Identify signs as `'minus'` or `'plus'`.
  - Scientific exponent marker is `'exp'`.
- Removed non-ICU rounding mode `'05up'`
- Removed redundant rounding mode `'truncate'`. Use `'down'`.
- Ensure timezone id resolution maps back to CLDR stable id for exemplar city resolution

## [0.11.4]

### Fixed/Changed

- Improved coefficient adjustment in scientific formatting

## [0.11.3]

### Added

- Fast, simple CLDR data downloader.
- Decimal number format options new style `'scientific'`.
- Decimal api supports scientific formatting to string and parts.
- Depend on [tslib](https://github.com/Microsoft/tslib)

### Fixed/Changed

- Removed dependency on NPM cldr-data package.
- Upgraded [cldr 35](http://cldr.unicode.org/index/downloads/cldr-35).
- Parts formatting changed the minus sign type from `'minus'` to `'sign'`
- Removed timezone `fromWall` methods until stable
- Decimal division simplification.

## [0.10.2]

### Added

- Added context transform data to schema
- Options for date formatting now have an optional `context: ContextType` property
- Date, interval, raw pattern, and relative time formatters now use context transforms
- Added `dateField` method to `Calendars` api
- Added `timeZoneInfo` to `Calendars` api, includes the exemplar city for each zone
- New package: @phensley/timezone provides timezone calculations over the full range of tzdb data.

### Fixed/Changed

- Revised calendar fields api (e.g. `eras()`, `dayPeriods()`, etc) to accept options
- Calendar field methods now accept `context: ContextType` option
- Renamed `RelativeTimeWidthType` to `DateFieldWidthType`
- Moved `displayName` to top-level of `DateFields` schema
- vuint encode/decode now support 64-bit integers
- zigzag encoder now supports 64-bit signed integers
- binary search is now more general, letting caller control direction of match
- `Calendar.timeZoneOffset` now has the correct sign
- tzdb updated to 2019a
- Rebuilt metazone and timezone subsystem to use new timezone package
- Removed deprecated base-100 and bitarray encoders from cldr-utils package

## [0.9.1] - 2018-03-21

### Added

- Added `CLDR.General.parseLanguageTag` method

## [0.9.0] - 2018-03-21

### Fixed/Changed

- Decimal and currency formatting options default to `{ group: true }`
- Dropped `CLDR.Locales` namespace and merged methods into `CLDR.General`

## [0.8.17] - 2019-3-20

### Added

- Export `LanguageIdType`

## [0.8.16] - 2019-03-20

#### Added

- Added `CLDR.General.getLanguageDisplayName`

#### Fixed/Changed

- Converted `CLDR` to an interface

[1.3.1]: https://github.com/phensley/cldr-engine/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/phensley/cldr-engine/compare/v1.2.7...v1.3.0
[1.2.8]: https://github.com/phensley/cldr-engine/compare/v1.2.7...v1.2.8
[1.2.7]: https://github.com/phensley/cldr-engine/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/phensley/cldr-engine/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/phensley/cldr-engine/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/phensley/cldr-engine/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/phensley/cldr-engine/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/phensley/cldr-engine/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/phensley/cldr-engine/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/phensley/cldr-engine/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/phensley/cldr-engine/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/phensley/cldr-engine/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/phensley/cldr-engine/compare/v1.0.9...v1.1.0
[1.0.9]: https://github.com/phensley/cldr-engine/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/phensley/cldr-engine/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/phensley/cldr-engine/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/phensley/cldr-engine/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/phensley/cldr-engine/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/phensley/cldr-engine/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/phensley/cldr-engine/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/phensley/cldr-engine/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/phensley/cldr-engine/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/phensley/cldr-engine/compare/v0.26.0...v1.0.0
[0.26.0]: https://github.com/phensley/cldr-engine/compare/v0.25.22...v0.26.0
[0.25.22]: https://github.com/phensley/cldr-engine/compare/v0.25.21...v0.25.22
[0.25.21]: https://github.com/phensley/cldr-engine/compare/v0.25.20...v0.25.21
[0.25.20]: https://github.com/phensley/cldr-engine/compare/v0.25.19...v0.25.20
[0.25.19]: https://github.com/phensley/cldr-engine/compare/v0.25.18...v0.25.19
[0.25.18]: https://github.com/phensley/cldr-engine/compare/v0.25.17...v0.25.18
[0.25.17]: https://github.com/phensley/cldr-engine/compare/v0.25.16...v0.25.17
[0.25.16]: https://github.com/phensley/cldr-engine/compare/v0.25.15...v0.25.16
[0.25.15]: https://github.com/phensley/cldr-engine/compare/v0.25.14...v0.25.15
[0.25.14]: https://github.com/phensley/cldr-engine/compare/v0.25.13...v0.25.14
[0.25.13]: https://github.com/phensley/cldr-engine/compare/v0.25.12...v0.25.13
[0.25.12]: https://github.com/phensley/cldr-engine/compare/v0.25.11...v0.25.12
[0.25.11]: https://github.com/phensley/cldr-engine/compare/v0.25.10...v0.25.11
[0.25.10]: https://github.com/phensley/cldr-engine/compare/v0.25.9...v0.25.10
[0.25.9]: https://github.com/phensley/cldr-engine/compare/v0.25.8...v0.25.9
[0.25.8]: https://github.com/phensley/cldr-engine/compare/v0.25.7...v0.25.8
[0.25.7]: https://github.com/phensley/cldr-engine/compare/v0.25.6...v0.25.7
[0.25.6]: https://github.com/phensley/cldr-engine/compare/v0.25.5...v0.25.6
[0.25.5]: https://github.com/phensley/cldr-engine/compare/v0.25.4...v0.25.5
[0.25.4]: https://github.com/phensley/cldr-engine/compare/v0.25.3...v0.25.4
[0.25.3]: https://github.com/phensley/cldr-engine/compare/v0.25.2...v0.25.3
[0.25.2]: https://github.com/phensley/cldr-engine/compare/v0.25.1...v0.25.2
[0.25.1]: https://github.com/phensley/cldr-engine/compare/v0.25.0...v0.25.1
[0.25.0]: https://github.com/phensley/cldr-engine/compare/v0.24.0...v0.25.0
[0.24.0]: https://github.com/phensley/cldr-engine/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/phensley/cldr-engine/compare/v0.22.3...v0.23.0
[0.22.3]: https://github.com/phensley/cldr-engine/compare/v0.22.2...v0.22.3
[0.22.2]: https://github.com/phensley/cldr-engine/compare/v0.22.1...v0.22.2
[0.22.1]: https://github.com/phensley/cldr-engine/compare/v0.22.0...v0.22.1
[0.22.0]: https://github.com/phensley/cldr-engine/compare/v0.21.2...v0.22.0
[0.21.2]: https://github.com/phensley/cldr-engine/compare/v0.21.1...v0.21.2
[0.21.1]: https://github.com/phensley/cldr-engine/compare/v0.21.0...v0.21.1
[0.21.0]: https://github.com/phensley/cldr-engine/compare/v0.20.4...v0.21.0
[0.20.4]: https://github.com/phensley/cldr-engine/compare/v0.20.3...v0.20.4
[0.20.3]: https://github.com/phensley/cldr-engine/compare/v0.20.2...v0.20.3
[0.20.2]: https://github.com/phensley/cldr-engine/compare/v0.20.1...v0.20.2
[0.20.1]: https://github.com/phensley/cldr-engine/compare/v0.20.0...v0.20.1
[0.20.0]: https://github.com/phensley/cldr-engine/compare/v0.19.5...v0.20.0
[0.19.5]: https://github.com/phensley/cldr-engine/compare/v0.19.4...v0.19.5
[0.19.4]: https://github.com/phensley/cldr-engine/compare/v0.19.3...v0.19.4
[0.19.3]: https://github.com/phensley/cldr-engine/compare/v0.19.2...v0.19.3
[0.19.2]: https://github.com/phensley/cldr-engine/compare/v0.19.1...v0.19.2
[0.19.1]: https://github.com/phensley/cldr-engine/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/phensley/cldr-engine/compare/v0.18.3...v0.19.0
[0.18.3]: https://github.com/phensley/cldr-engine/compare/v0.18.2...v0.18.3
[0.18.2]: https://github.com/phensley/cldr-engine/compare/v0.18.1...v0.18.2
[0.18.1]: https://github.com/phensley/cldr-engine/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/phensley/cldr-engine/compare/v0.17.6...v0.18.0
[0.17.6]: https://github.com/phensley/cldr-engine/compare/v0.17.5...v0.17.6
[0.17.5]: https://github.com/phensley/cldr-engine/compare/v0.17.4...v0.17.5
[0.17.4]: https://github.com/phensley/cldr-engine/compare/v0.17.3...v0.17.4
[0.17.3]: https://github.com/phensley/cldr-engine/compare/v0.17.2...v0.17.3
[0.17.2]: https://github.com/phensley/cldr-engine/compare/v0.17.1...v0.17.2
[0.17.1]: https://github.com/phensley/cldr-engine/compare/v0.17.0...v0.17.1
[0.17.0]: https://github.com/phensley/cldr-engine/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/phensley/cldr-engine/compare/v0.15.3...v0.16.0
[0.15.3]: https://github.com/phensley/cldr-engine/compare/v0.15.2...v0.15.3
[0.15.2]: https://github.com/phensley/cldr-engine/compare/v0.15.1...v0.15.2
[0.15.1]: https://github.com/phensley/cldr-engine/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/phensley/cldr-engine/compare/v0.14.8...v0.15.0
[0.14.8]: https://github.com/phensley/cldr-engine/compare/v0.14.6...v0.14.8
[0.14.6]: https://github.com/phensley/cldr-engine/compare/v0.14.5...v0.14.6
[0.14.5]: https://github.com/phensley/cldr-engine/compare/v0.14.4...v0.14.5
[0.14.4]: https://github.com/phensley/cldr-engine/compare/v0.14.3...v0.14.4
[0.14.3]: https://github.com/phensley/cldr-engine/compare/v0.14.2...v0.14.3
[0.14.2]: https://github.com/phensley/cldr-engine/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/phensley/cldr-engine/compare/v0.13.7...v0.14.1
[0.13.7]: https://github.com/phensley/cldr-engine/compare/v0.13.6...v0.13.7
[0.13.6]: https://github.com/phensley/cldr-engine/compare/v0.13.5...v0.13.6
[0.13.5]: https://github.com/phensley/cldr-engine/compare/v0.13.4...v0.13.5
[0.13.4]: https://github.com/phensley/cldr-engine/compare/v0.12.1...v0.13.4
[0.12.1]: https://github.com/phensley/cldr-engine/compare/v0.11.4...v0.12.1
[0.11.4]: https://github.com/phensley/cldr-engine/compare/v0.11.3...v0.11.4
[0.11.3]: https://github.com/phensley/cldr-engine/compare/v0.10.2...v0.11.3
[0.10.2]: https://github.com/phensley/cldr-engine/compare/v0.9.1...v0.10.2
[0.9.1]: https://github.com/phensley/cldr-engine/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/phensley/cldr-engine/compare/v0.8.17...v0.9.0
[0.8.17]: https://github.com/phensley/cldr-engine/compare/v0.8.16...v0.8.17
[0.8.16]: https://github.com/phensley/cldr-engine/compare/v0.8.15...v0.8.16
