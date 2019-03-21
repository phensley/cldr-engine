# Changelog

All notable changes to this project will be documented in this file.

**Note: Pre-1.0 minor releases may not be backwards-compatible.**

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)


## [Unreleased]
### Changed
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
