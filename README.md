# cldr-engine

Internationalization in Typescript with Unicode CLDR, batteries included

[![build](https://api.travis-ci.org/phensley/cldr-engine.svg?branch=master)](https://travis-ci.org/phensley/cldr-engine) [![codecov](https://codecov.io/gh/phensley/cldr-engine/branch/master/graph/badge.svg)](https://codecov.io/gh/phensley/cldr-engine) [![npm version](https://badge.fury.io/js/%40phensley%2Fcldr.svg)](https://www.npmjs.com/package/@phensley/cldr)

## Documentation

The [documentation](https://phensley.github.io/cldr-engine/) is mostly complete but under development in advance of a 1.0 release.

## Demonstration

 * [CodeSandbox example](https://codesandbox.io/s/qqr1rl40r6) can be used to experiment, report bugs, etc.
 * [Demonstration app](https://phensley.github.io/cldr-engine-react-demo/) provides an example using React and Redux. ([source code](https://github.com/phensley/cldr-engine-react-demo))

## Status

**The project is currently BETA. Working on stabilizing the public API and feature set for an initial 1.0 release.**

## Install

Install the [NPM package](https://www.npmjs.com/package/@phensley/cldr):

```bash
npm install --save @phensley/cldr

# or

yarn add @phensley/cldr
```

## Rationale

I needed a library that included as much CLDR functionality as possible, while still meeting all of my requirements for performance, static and runtime code size, simplicity of integration, etc.

I'm gradually [comparing this library with current alternatives](https://github.com/phensley/cldr-bakeoff) here.

## Goals

* Support a broad set of CLDR features in the browser "out of the box".
* Support all scripts and regions for a language in a single compact resource pack.
* Resolve the CLDR data size and dimensionality problems.
  - In the case of English: ~40MB of JSON for 105 locales is compressed to a 194KB resource pack (44KB gzip), a factor of approx. 200:1 uncompressed, 1000:1 with gzip compression.
* No additional library dependencies required.
* No custom extraction of CLDR data or precompilation of formatters required.
* Correctness and consistency across browsers and Javascript runtime environments.
* Provide type-safety, reducing programming errors.
* No familiarity with CLDR structure is required for developers to use this library.
* High performance.
* Arbitrary precision decimal math, to achieve the same accuracy in the browser as on the server.

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
