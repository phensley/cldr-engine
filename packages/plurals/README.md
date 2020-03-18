# @phensley/timezone

[![@phensley/plurals](https://badge.fury.io/js/%40phensley%2Fplurals.svg)](https://www.npmjs.com/package/@phensley/plurals) [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/plurals)](https://bundlephobia.com/result?p=@phensley/plurals)

Standalone CLDR plural rules engine. Supports cardinal, ordinal, and plural range calculations. Also supports arbitrary precision decimal numbers.

## Installation

NPM:

```
npm install --save @phensley/plurals
```

Yarn:

```
yarn add @phensley/plurals
```

## Examples

The plural rules engine takes 2 parameters as input: an ISO 639 language code and a number. The number can be a `Decimal`, `number`, or a string containing a valid number.

The [Decimal](https://phensley.github.io/cldr-engine/docs/en/api-decimal) arbitrary precision type is used for evaluating the plural expressions internally.

```typescript
import { Decimal } from '@phensley/decimal';
import { pluralRules } from '@phensley/plurals';

const LANGUAGES = ['en', 'fr', 'lt', 'pl', 'mt'];
const NUMBERS = [
  '1e-30',
  '0.3333333333e-15',
  0,
  '0.00',
  0.5,
  1,
  '1.0',
  2,
  '3.14159',
  5,
  6,
  7,
  9,
  11,
  15,
  19,
  23,
  29,
  '100',
  '1000000000000',
  '1000000000000.0',
  '9999999999999999999999919',
  '9999999999999999999999999',
  '1e30'
];

let s = '';
for (const n of NUMBERS) {
  s += `${new Decimal(n).toString().padStart(35)}  `;
  for (const lang of LANGUAGES) {
    const plurals = pluralRules.get(lang);
    const cat = plurals.cardinal(n);
    s += `${lang} ${cat}`.padEnd(14);
  }
  s += '\n';
}
console.log(s);
```

```
   0.000000000000000000000000000001  en other      fr one        lt many       pl other      mt other      pt one        pt-PT other
        0.0000000000000003333333333  en other      fr one        lt many       pl other      mt other      pt one        pt-PT other
                                  0  en other      fr one        lt other      pl many       mt few        pt one        pt-PT other
                               0.00  en other      fr one        lt other      pl other      mt few        pt one        pt-PT other
                                0.5  en other      fr one        lt many       pl other      mt other      pt one        pt-PT other
                                  1  en one        fr one        lt one        pl one        mt one        pt one        pt-PT one
                                1.0  en other      fr one        lt one        pl other      mt one        pt one        pt-PT other
                                  2  en other      fr other      lt few        pl few        mt few        pt other      pt-PT other
                            3.14159  en other      fr other      lt many       pl other      mt other      pt other      pt-PT other
                                  5  en other      fr other      lt few        pl many       mt few        pt other      pt-PT other
                                  6  en other      fr other      lt few        pl many       mt few        pt other      pt-PT other
                                  7  en other      fr other      lt few        pl many       mt few        pt other      pt-PT other
                                  9  en other      fr other      lt few        pl many       mt few        pt other      pt-PT other
                                 11  en other      fr other      lt other      pl many       mt many       pt other      pt-PT other
                                 15  en other      fr other      lt other      pl many       mt many       pt other      pt-PT other
                                 19  en other      fr other      lt other      pl many       mt many       pt other      pt-PT other
                                 23  en other      fr other      lt few        pl few        mt other      pt other      pt-PT other
                                 29  en other      fr other      lt few        pl many       mt other      pt other      pt-PT other
                                100  en other      fr other      lt other      pl many       mt other      pt other      pt-PT other
                      1000000000000  en other      fr other      lt other      pl many       mt other      pt other      pt-PT other
                    1000000000000.0  en other      fr other      lt other      pl other      mt other      pt other      pt-PT other
          9999999999999999999999919  en other      fr other      lt other      pl many       mt many       pt other      pt-PT other
          9999999999999999999999999  en other      fr other      lt few        pl many       mt other      pt other      pt-PT other
    1000000000000000000000000000000  en other      fr other      lt other      pl many       mt other      pt other      pt-PT other
```
