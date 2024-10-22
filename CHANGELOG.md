# Changelog

All notable changes to this project will be documented in this file.

This project uses a **modified semantic versioning** scheme. See [README](README.md#versioning) for more details.

## [1.9.2]

### Fixed/Changed

- Upgrade to [tzdb 2024b](https://www.iana.org/time-zones)

## [1.9.1]

### Fixed/Changed

- Convert some enums to non-const for use at runtime

## [1.9.0]

### Fixed/Changed

- Upgrade to [CLDR v45](https://cldr.unicode.org/index/downloads/cldr-45)
- Upgrade to [tzdb 2024a](https://www.iana.org/time-zones)

## [1.8.3]

### Fixed/Changed

- Fix for spaces in Japanese unit patterns

## [1.8.2]

### Fixed/Changed

- Clamp all dates to our bounded range for Julian days

## [1.8.1]

## Fixed/Changed

- Fix bug in default calendar selection
- Fix bug in generating Finnish timezones

## [1.8.0]

## Fixed/Changed

- Upgrade to [CLDR v44](https://cldr.unicode.org/index/downloads/cldr-44)
- Upgrade to Typescript 5.3.2
- Created `LocaleResolver` class to split a merged declaration with the `Locale` interface.

## [1.7.3]

## Fixed/Changed

- Fixed context bug affecting datetime intervals.

## [1.7.2]

## Fixed/Changed

- Patch display name for `ajp` language in English locales.

## [1.7.1]

## Fixed/Changed

- Upgrade to [CLDR v43.1](https://cldr.unicode.org/index/downloads/cldr-43#h.qobmda543waj)

## [1.7.0]

## Fixed/Changed

- Upgrade to [CLDR v43](https://cldr.unicode.org/index/downloads/cldr-43)
- Upgrade to [tzdb 2023c](https://www.iana.org/time-zones)

## [1.6.6]

## Added

- Added message formatting option to disable apostrophe escapes.

## [1.6.5]

## Fixed/Changed

- Upgrade to [tzdb 2022g](https://www.iana.org/time-zones)

## [1.6.4]

## Fixed/Changed

- Add `Calendars.timeData` method to fetch preferred and allowed hour cycle skeletons.

## [1.6.3]

## Fixed/Changed

- Add long/short timezone names to `timeZoneInfo` results.

## [1.6.2]

## Fixed/Changed

- Enhanced type safety for unit factor conversions.

## [1.6.1]

## Fixed/Changed

- Fixed missing `node-fetch` runtime dependency for `@phensley/cldr-compiler` package.

## [1.6.0]

## Fixed/Changed

- Upgrade to [CLDR v42](https://cldr.unicode.org/index/downloads/cldr-42)

## [1.5.2]

## Fixed/Changed

- Upgrade to [tzdb 2022e](https://www.iana.org/time-zones)

## [1.5.1]

## Fixed/Changed

- Upgrade to [tzdb 2022b](https://www.iana.org/time-zones)

## [1.5.0]

## Fixed/Changed

- Upgrade to [CLDR v41](https://cldr.unicode.org/index/downloads/cldr-41)

## [1.4.1]

## Fixed/Changed

- Upgrade to [tzdb 2022a](https://www.iana.org/time-zones)

## [1.4.0]

## Fixed/Changed

- Upgrade to [CLDR v40](https://cldr.unicode.org/index/downloads/cldr-40)

## [1.3.3]

## Fixed/Changed

- Fixed internal package dependencies. Packages must depend on others from the same patch level.

## [1.3.2]

## Fixed/Changed

- Fixed internal package dependencies. Packages must depend on others from the same patch level.

## [1.3.1]

## Fixed/Changed

- Set `inlineSources: true` to add Typescript source code to source maps.

## [1.3.0]

## Fixed/Changed

- Upgrade to [CLDR v39](http://cldr.unicode.org/index/downloads/cldr-39)

## [1.2.18]

### Fixed/Changed

- Convert some enums to non-const for use at runtime

## [1.2.17]

### Fixed/Changed

- Backport: Fix for spaces in Japanese unit patterns
- Backport: Clamp all dates to our bounded range for Julian days

## [1.2.16]

### Fixed/Changed

- Fix interval date formatter context

## [1.2.15]

### Fixed/Changed

- Fixed imports in type declaration files

## [1.2.14]

### Added

- Add option to disabled escapes in message formatter

## [1.2.13]

### Fixed/Changed

- Removed unused parameter on `timeData` method.

## [1.2.12]

### Fixed/Changed

- Add `Calendars.timeData` method to fetch preferred and allowed time cycles.

## [1.2.11]

### Fixed/Changed

- Add long/short timezone names to timeZoneInfo results.

## [1.2.10]

### Fixed/Changed

- Build improvements.

## [1.2.9]

### Fixed/Changed

- Fix parsing of extended language subtag.
- Ping all dependencies to same minor version.

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

[1.9.2]: https://github.com/phensley/cldr-engine/compare/v1.9.1...v1.9.2
[1.9.1]: https://github.com/phensley/cldr-engine/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/phensley/cldr-engine/compare/v1.8.3...v1.9.0
[1.8.3]: https://github.com/phensley/cldr-engine/compare/v1.8.2...v1.8.3
[1.8.2]: https://github.com/phensley/cldr-engine/compare/v1.8.1...v1.8.2
[1.8.1]: https://github.com/phensley/cldr-engine/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/phensley/cldr-engine/compare/v1.7.3...v1.8.0
[1.7.3]: https://github.com/phensley/cldr-engine/compare/v1.7.2...v1.7.3
[1.7.2]: https://github.com/phensley/cldr-engine/compare/v1.7.1...v1.7.2
[1.7.1]: https://github.com/phensley/cldr-engine/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/phensley/cldr-engine/compare/v1.6.6...v1.7.0
[1.6.6]: https://github.com/phensley/cldr-engine/compare/v1.6.5...v1.6.6
[1.6.5]: https://github.com/phensley/cldr-engine/compare/v1.6.4...v1.6.5
[1.6.4]: https://github.com/phensley/cldr-engine/compare/v1.6.3...v1.6.4
[1.6.3]: https://github.com/phensley/cldr-engine/compare/v1.6.2...v1.6.3
[1.6.2]: https://github.com/phensley/cldr-engine/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/phensley/cldr-engine/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/phensley/cldr-engine/compare/v1.5.2...v1.6.0
[1.5.2]: https://github.com/phensley/cldr-engine/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/phensley/cldr-engine/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/phensley/cldr-engine/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/phensley/cldr-engine/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/phensley/cldr-engine/compare/v1.3.3...v1.4.0
[1.3.3]: https://github.com/phensley/cldr-engine/compare/v1.3.1...v1.3.3
[1.3.1]: https://github.com/phensley/cldr-engine/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/phensley/cldr-engine/compare/v1.2.7...v1.3.0
[1.2.18]: https://github.com/phensley/cldr-engine/compare/v1.2.17...v1.2.18
[1.2.17]: https://github.com/phensley/cldr-engine/compare/v1.2.16...v1.2.17
[1.2.16]: https://github.com/phensley/cldr-engine/compare/v1.2.15...v1.2.16
[1.2.15]: https://github.com/phensley/cldr-engine/compare/v1.2.14...v1.2.15
[1.2.14]: https://github.com/phensley/cldr-engine/compare/v1.2.13...v1.2.14
[1.2.13]: https://github.com/phensley/cldr-engine/compare/v1.2.12...v1.2.13
[1.2.12]: https://github.com/phensley/cldr-engine/compare/v1.2.11...v1.2.12
[1.2.11]: https://github.com/phensley/cldr-engine/compare/v1.2.10...v1.2.11
[1.2.10]: https://github.com/phensley/cldr-engine/compare/v1.2.9...v1.2.10
[1.2.9]: https://github.com/phensley/cldr-engine/compare/v1.2.8...v1.2.9
[1.2.8]: https://github.com/phensley/cldr-engine/compare/v1.2.7...v1.2.8
[1.2.7]: https://github.com/phensley/cldr-engine/compare/v1.2.6...v1.2.7
[1.2.6]: https://github.com/phensley/cldr-engine/compare/v1.2.5...v1.2.6
[1.2.5]: https://github.com/phensley/cldr-engine/compare/v1.2.4...v1.2.5
[1.2.4]: https://github.com/phensley/cldr-engine/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/phensley/cldr-engine/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/phensley/cldr-engine/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/phensley/cldr-engine/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/phensley/cldr-engine/compare/v1.1.2...v1.2.0
