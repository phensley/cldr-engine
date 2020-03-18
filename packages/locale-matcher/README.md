# @phensley/locale-matcher

[![@phensley/locale-matcher](https://badge.fury.io/js/%40phensley%2Flocale-matcher.svg)](https://www.npmjs.com/package/@phensley/locale-matcher) [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/locale-matcher)](https://bundlephobia.com/result?p=@phensley/locale-matcher)

Implements distance based locale matching using the CLDR enhanced language matching algorithm.

## Installation

NPM:

```
npm install --save @phensley/locale-matcher
```

Yarn:

```
yarn add @phensley/locale-matcher
```

## Examples

```typescript
import { LocaleMatch, LocaleMatcher } from '@phensley/locale-matcher';

// Add supported locales to matcher
const matcher = new LocaleMatcher('en, en_GB, zh, pt_AR, es-419');
let m: LocaleMatch;

// Query desired locales to find the nearest match
m = matcher.match('en-AU');
console.log(`distance ${m.distance} locale ${m.locale.id}`);

m = matcher.match('es-MX');
console.log(`distance ${m.distance} locale ${m.locale.id}`);
```

```
distance 3 locale en_GB
distance 4 locale es-419
```
