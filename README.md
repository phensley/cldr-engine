# cldr-engine

Internationalization in Typescript with Unicode CLDR, batteries included

[![build](https://api.travis-ci.org/phensley/cldr-engine.svg?branch=master)](https://travis-ci.org/phensley/cldr-engine) [![codecov](https://codecov.io/gh/phensley/cldr-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/phensley/cldr-engine) [![npm version](https://badge.fury.io/js/%40phensley%2Fcldr.svg)](https://www.npmjs.com/package/@phensley/cldr)

## Demonstration

[React-based demonstration app](https://phensley.github.io/cldr-engine-react-demo/)

## Status

**The project is currently pre-ALPHA. Working on stabilizing the public API for an initial 1.0 release.**

## Install

Install the [NPM package](https://www.npmjs.com/package/@phensley/cldr):

```bash
npm install --save @phensley/cldr

# or

yarn add @phensley/cldr
```

## Documentation

This project is **currently in pre-ALPHA** and under active development, with the potential for major changes to APIs before the initial release.

* [Integration](docs/integration.md) of @phensley/cldr into an application
* [Locales](docs/locale.md) parsing, resolving, distance-based matching
* [Arbitrary precision math](docs/math.md) manipulate numbers of any number of digits
* [Date-time with timezone](docs/datetime.md)
* [Number](docs/numbers.md) formatting to strings, parts, arbitrary precision
* [Currency](docs/currencies.md) formatting to strings, parts, arbitrary precision
* [Calendar](docs/calendars.md) date time, formatting to strings, parts
* [Relative time](docs/relative-times.md) formatting, e.g. "1 month ago", "tomorrow", "in 1 hour", etc.
* [Names of things](docs/names.md), languages, places, etc
* [Units](docs/units.md) formatting quantities in units (e.g. meters, pounds, etc), sequences
* [Lists](docs/lists.md) of items with AND and OR

#### Upcoming

* Unit conversions
* Message formatter
* Timezone-related info
  * Exemplar cities with lat/long mapping to timezone id

#### Notes

* [Testing](docs/testing.md) plan, browser compatibility


## Goals

* Support a broad set of CLDR features in the browser "out of the box".
* Resolve the CLDR "data explosion" problem.
* Support all scripts and regions for a given language in a single compact resource pack.
* No additional library dependencies required.
* No custom extraction of CLDR data or precompilation of formatters required.
* Correctness and consistency across browsers and Javascript runtime environments.
* Provide type-safety, reducing programming errors.
* No familiarity with CLDR structure is required for developers to use this library.
* High performance.
* Enhance functionality with arbitrary precision decimal math.

## License

    Copyright 2018-present Patrick Hensley

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

## Affiliation

This project is not affiliated with the [Unicode Inc.](https://unicode.org) or the [Unicode CLDR](http://cldr.unicode.org/) project.
