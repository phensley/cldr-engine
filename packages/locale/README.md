# @phensley/locale

[![@phensley/locale](https://badge.fury.io/js/%40phensley%2Flocale.svg)](https://www.npmjs.com/package/@phensley/locale) [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/locale)](https://bundlephobia.com/result?p=@phensley/locale)

Implements resolving of BCP 47 language tags by alias and likely subtags substitution.

## Installation

NPM:

```
npm install --save @phensley/locale
```

Yarn:

```
yarn add @phensley/locale
```

## Examples

```typescript
import { LanguageResolver } from '@phensley/locale-resolver';

const IDS = ['en', 'es', 'es-419', 'und-AR', 'und-Hant', 'iw', 'i-klingon'];
for (const id of IDS) {
  const r = LanguageResolver.resolve(id);
  console.log(r.expanded());
}
```

```
en-Latn-US
es-Latn-ES
es-Latn-419
es-Latn-AR
zh-Hant-TW
he-Hebr-IL
tlh-Latn-US
```
