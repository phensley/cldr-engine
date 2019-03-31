# Changelog

All notable changes to this project will be documented in this file.

**Note: Pre-1.0 minor releases may not be backwards-compatible.**

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [UNRELEASED]
### Added
 - Fast, simple CLDR data downloader.
 - Decimal number format options new style `'scientific'`.
 - Decimal api supports scientific formatting to string and parts.

### Fixed/Changed
 - Removed dependency on NPM cldr-data package.
 - Upgraded [cldr 35](http://cldr.unicode.org/index/downloads/cldr-35).
 - Parts formatting changed the minus sign type from `'minus'` to `'sign'`
 - Removed timezone `fromWall` methods until stable

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


[0.10.2]: https://github.com/phensley/cldr-engine/compare/v0.9.1...v0.10.2
[0.9.1]: https://github.com/phensley/cldr-engine/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/phensley/cldr-engine/compare/v0.8.17...v0.9.0
[0.8.17]: https://github.com/phensley/cldr-engine/compare/v0.8.16...v0.8.17
[0.8.16]: https://github.com/phensley/cldr-engine/compare/v0.8.15...v0.8.16
