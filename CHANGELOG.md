# Changelog

All notable changes to this project will be documented in this file.

**Note: Pre-1.0 minor releases may not be backwards-compatible.**

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

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
