# cldr-engine

Internationalization in Typescript with Unicode CLDR, batteries included

[![build](https://api.travis-ci.org/phensley/cldr-engine.svg?branch=master)](https://travis-ci.org/phensley/cldr-engine) [![codecov](https://codecov.io/gh/phensley/cldr-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/phensley/cldr-engine) [![npm version](https://badge.fury.io/js/%40phensley%2Fcldr.svg)](https://www.npmjs.com/package/@phensley/cldr)

## Install

Install the [NPM package](https://www.npmjs.com/package/@phensley/cldr):

```bash
npm install --save @phensley/cldr

# or

yarn add @phensley/cldr
```

## Documentation

This project is **currently in pre-ALPHA** and under active development, with the potential major changes to APIs before the initial release.

* [Integration](docs/integration.md) of @phensley/cldr into an application
* [Locales](docs/locale.md) parsing, resolving, distance-based matching
* [Number](docs/numbers.md) formatting to strings, parts, arbitrary precision
* [Currency](docs/currencies.md) formatting to strings, parts, arbitrary precision
* [Gregorian date](docs/gregorian.md) formatting to strings, parts
* [Names of things](docs/names.md), languages, places, etc

#### Datatypes

* [Arbitrary precision math](docs/math.md)
* [Date-time with timezone](docs/datetime.md)

#### Upcoming

 * Units
 * Unit conversions
 * Messages
 * Timezone info
   * Exemplar cities with lat/long mapping to timezone id


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

[MIT](LICENSE)

## Affiliation

This project is not affiliated with the [Unicode Inc.](https://unicode.org) or the [Unicode CLDR](http://cldr.unicode.org/) project.
