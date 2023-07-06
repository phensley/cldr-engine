# Changelog

All notable changes to this project will be documented in this file.

This project uses a **modified semantic versioning** scheme. See [README](README.md#versioning) for more details.

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

## [1.2.10]

## Fixed/Changed

- Fixed internal package dependencies. Packages must depend on others from the same patch level.

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
[1.2.10]: https://github.com/phensley/cldr-engine/compare/v1.2.8...v1.2.10
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
