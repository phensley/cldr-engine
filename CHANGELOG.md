# Changelog

All notable changes to this project will be documented in this file.

**Note: Pre-1.0 minor releases may not be backwards-compatible.**

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [UNRELEASED]
### Added
 - Added a `Calendars.resolveTimeZoneId` which maps a timezone id or alias to the current TZDB identifier for that zone.

### Fixed/Changed
 - Moved calendar available formats and interval formats to schema config.
 - Split the pluralized calendar available formats to their own schema method.
 - The `Calendars.timeZoneIds` method now returns an array of valid TZDB identifiers instead of CLDR stable timezone identifiers.
 - The `Calendars.timeZoneInfo` method now accepts a timezone identifier or alias and returns a record containing the resolved TZDB identifier and exemplar city name.

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
