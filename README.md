# cldr-engine

Internationalization in Typescript with Unicode CLDR, batteries included.

[![build](https://github.com/phensley/cldr-engine/workflows/Build%20and%20Test/badge.svg)](https://github.com/phensley/cldr-engine/actions)
[![codecov](https://codecov.io/gh/phensley/cldr-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/phensley/cldr-engine)
[![npm version](https://badge.fury.io/js/%40phensley%2Fcldr.svg)](https://www.npmjs.com/package/@phensley/cldr)

- [cldr-engine](#cldr-engine)
  - [Links](#links)
  - [Install](#install)
  - [Versioning](#versioning)
  - [Features](#features)
  - [Package Naming](#package-naming)
  - [Goals](#goals)
  - [License](#license)
  - [Affiliation](#affiliation)

## Links

- [Documentation](https://phensley.github.io/cldr-engine/) on the library API and usage.
- [CodeSandbox example](https://codesandbox.io/s/qqr1rl40r6) can be used to experiment, report bugs, etc.
- [Demonstration app](https://phensley.github.io/cldr-engine-react-demo/) provides an example using React and Redux. ([source code](https://github.com/phensley/cldr-engine-react-demo))

## Install

Install the [NPM package](https://www.npmjs.com/package/@phensley/cldr):

```bash
npm install --save @phensley/cldr
```

Using Yarn:

```bash
yarn add @phensley/cldr
```

## Versioning

This project follows [semantic versioning](https://semver.org/):

**PATCH**

- Bug fixes
- Backwards-compatible
- Resource pack compatibility maintained (packs from `1.0.0` are guaranteed to work for all `1.0.*` versions)

**MINOR**

- New features
- Backwards-compatible
- Internal schema breaking changes (applications must load resource packs from the same `major.minor` version)
- CLDR data upgrades which maintain backwards-compatibility

**MAJOR**

- Public API breaking changes
- CLDR data upgrades which change break API compatibility (unit deprecation / renaming, etc)

## Features

- Implementation folows the [CLDR specification](https://www.unicode.org/reports/tr35/tr35-general.html) supporting [CLDR version 42.0.0](http://cldr.unicode.org/index/downloads/cldr-42)
- [394 modern locales](https://phensley.github.io/cldr-engine/docs/en/api-cldrframework#availablelocales)
- [Compact resource packs](https://phensley.github.io/cldr-engine/docs/en/doc-design-bundles) containing [all scripts and regions for a given language](https://unpkg.com/@phensley/cldr/packs/)
- [Language tag parsing](https://phensley.github.io/cldr-engine/docs/en/api-cldrframework#parselanguagetag), [locale resolution](https://phensley.github.io/cldr-engine/docs/en/api-cldrframework#resolvelocale), and distance-based [enhanced language matching](https://phensley.github.io/cldr-engine/docs/en/api-localematcher) for improved locale fallback
- [Fast, compact, and extensible ICU message formatting](packages/messageformat/README.md)
- Both string and [parts formatting](https://phensley.github.io/cldr-engine/docs/en/api-cldr-numbers#formatdecimaltoparts) for flexible markup styling
- [Date time](https://phensley.github.io/cldr-engine/docs/en/api-cldr-calendars#formatdate), [date interval](https://phensley.github.io/cldr-engine/docs/en/api-cldr-calendars#formatdateinterval), and [relative time](https://phensley.github.io/cldr-engine/docs/en/api-cldr-calendars#formatrelativetime) formatting
- Full IANA and CLDR [timezone support](https://phensley.github.io/cldr-engine/docs/en/api-cldr-calendars#resolvetimezoneid) covering the full range of IANA timezone untils, automatic handling of deprecated timezone identifiers and aliases
- [Gregorian](https://phensley.github.io/cldr-engine/docs/en/api-gregoriandate), [ISO-8601](https://phensley.github.io/cldr-engine/docs/en/api-iso8601date), [Japanese](https://phensley.github.io/cldr-engine/docs/en/api-japanesedate), [Persian](https://phensley.github.io/cldr-engine/docs/en/api-persiandate) and [Buddhist](https://phensley.github.io/cldr-engine/docs/en/api-buddhistdate) calendars.
- Date formatting using [flexible skeleton-based pattern matching](https://phensley.github.io/cldr-engine/docs/en/api-dateskeleton)
- [Date addition](https://phensley.github.io/cldr-engine/docs/en/api-calendardate#add), [date subtraction](https://phensley.github.io/cldr-engine/docs/en/api-calendardate#subtract), [date differencing](https://phensley.github.io/cldr-engine/docs/en/api-calendardate#difference) and ["field of visual difference"](https://phensley.github.io/cldr-engine/docs/en/api-calendardate#fieldofvisualdifference) calculation
- [Cardinal and ordinal pluralization](https://phensley.github.io/cldr-engine/docs/en/api-cldr-numbers#getpluralcardinal) rules
- [Decimal numbers](https://phensley.github.io/cldr-engine/docs/en/api-cldr-numbers#formatdecimal), [currencies](https://phensley.github.io/cldr-engine/docs/en/api-cldr-numbers#formatcurrency), [units](https://phensley.github.io/cldr-engine/docs/en/api-cldr-units#formatquantity), and [unit sequence](https://phensley.github.io/cldr-engine/docs/en/api-cldr-units#formatquantitysequence) formatting, with [184 different units](https://phensley.github.io/cldr-engine/docs/en/api-unittype)
- [Arbitrary precision decimal math](https://phensley.github.io/cldr-engine/docs/en/doc-math)
- Display names for [languages](https://phensley.github.io/cldr-engine/docs/en/api-cldr-general#getlanguagedisplayname), [scripts](https://phensley.github.io/cldr-engine/docs/en/api-cldr-general#getscriptdisplayname), [regions](https://phensley.github.io/cldr-engine/docs/en/api-cldr-general#getregiondisplayname), [currencies](https://phensley.github.io/cldr-engine/docs/en/api-cldr-numbers#getcurrencydisplayname), [units](https://phensley.github.io/cldr-engine/docs/en/api-cldr-units#getunitdisplayname), [calendar fields](https://phensley.github.io/cldr-engine/docs/en/api-cldr-calendars#months), etc
- [List formatting](https://phensley.github.io/cldr-engine/docs/en/api-cldr-general#formatlist), [measurement system](https://phensley.github.io/cldr-engine/docs/en/api-cldr-general#measurementsystem), [character order](https://phensley.github.io/cldr-engine/docs/en/api-cldr-general#characterorder), and [line order](https://phensley.github.io/cldr-engine/docs/en/api-cldr-general#lineorder) information
- Optional [Unit conversion package](packages/unit-converter) to convert quantities between CLDR units

## Package Naming

Packages with the `cldr-*` prefix represent pieces of the larger library and are designed to work together. The [`@phensley/cldr`](https://www.npmjs.com/package/@phensley/cldr) package pulls in the full functionality of the library.

Packages without the `cldr-*` prefix can be used in an application individually without pulling in the larger core library.

You can use any of the packages independent of the rest of the library:

| package                                                                              | size                                                                                                                                       | dependencies                                                  |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| [`@phensley/cldr-utils`](https://www.npmjs.com/package/@phensley/cldr-utils)         | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/cldr-utils)](https://bundlephobia.com/result?p=@phensley/cldr-utils)         |                                                               |
| [`@phensley/decimal`](https://www.npmjs.com/package/@phensley/decimal)               | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/decimal)](https://bundlephobia.com/result?p=@phensley/decimal)               |                                                               |
| [`@phensley/language-tag`](https://www.npmjs.com/package/@phensley/language-tag)     | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/language-tag)](https://bundlephobia.com/result?p=@phensley/language-tag)     |                                                               |
| [`@phensley/locale`](https://www.npmjs.com/package/@phensley/locale)                 | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/locale)](https://bundlephobia.com/result?p=@phensley/locale)                 | size includes `language-tag` package                          |
| [`@phensley/locale-matcher`](https://www.npmjs.com/package/@phensley/locale-matcher) | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/locale-matcher)](https://bundlephobia.com/result?p=@phensley/locale-matcher) | size includes `locale` and `language-tag` packages            |
| [`@phensley/messageformat`](https://www.npmjs.com/package/@phensley/messageformat)   | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/messageformat)](https://bundlephobia.com/result?p=@phensley/messageformat)   | size includes `cldr-utils`, `decimal`, and `plurals` packages |
| [`@phensley/plurals`](https://www.npmjs.com/package/@phensley/plurals)               | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/plurals)](https://bundlephobia.com/result?p=@phensley/plurals)               | size includes `decimal` package                               |
| [`@phensley/timezone`](https://www.npmjs.com/package/@phensley/timezone)             | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/timezone)](https://bundlephobia.com/result?p=@phensley/timezone)             | size includes `cldr-utils` package                            |
| [`@phensley/unit-converter`](https://www.npmjs.com/package/@phensley/unit-converter) | [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/unit-converter)](https://bundlephobia.com/result?p=@phensley/unit-converter) | size includes `cldr-utils` and `decimal` packages             |

## Goals

- Support a broad set of CLDR features in the browser "out of the box".
- Support all scripts and regions for a language in a single compact resource pack.
- Resolve the CLDR data size and dimensionality problems.
  - In the case of English: ~49MB of JSON for 106 locales is compressed to a 227KB resource pack (42KB gzip), a factor of approx. 220:1 uncompressed, 1200:1 with gzip compression.
- No additional library dependencies required.
- No custom extraction of CLDR data or precompilation of formatters required.
- Correctness and consistency across browsers, Node.js, and other Javascript ES5 runtime environments.
- Provide type-safety, reducing programming errors.
- No familiarity with CLDR structure is required for developers to use this library.
- High performance.
- Arbitrary precision decimal math, to achieve the same accuracy in the browser as on the server.

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
