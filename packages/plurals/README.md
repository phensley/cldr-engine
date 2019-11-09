@phensley/plurals

Standalone CLDR plural rules engine.

## Example

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
  '1e30',
];

let s = '';
for (const n of NUMBERS) {
  s += `${new Decimal(n).toString().padStart(35)}  `;
  for (const lang of LANGUAGES) {
    const cat = pluralRules.cardinal(lang, n);
    s += `${lang} ${cat}`.padEnd(14);
  }
  s += '\n';
}
console.log(s);
```

```
   0.000000000000000000000000000001  en other      fr one        lt many       pl other      mt other
        0.0000000000000003333333333  en other      fr one        lt many       pl other      mt other
                                  0  en other      fr one        lt other      pl many       mt few
                               0.00  en other      fr one        lt other      pl other      mt few
                                0.5  en other      fr one        lt many       pl other      mt other
                                  1  en one        fr one        lt one        pl one        mt one
                                1.0  en other      fr one        lt one        pl other      mt one
                                  2  en other      fr other      lt few        pl few        mt few
                            3.14159  en other      fr other      lt many       pl other      mt other
                                  5  en other      fr other      lt few        pl many       mt few
                                  6  en other      fr other      lt few        pl many       mt few
                                  7  en other      fr other      lt few        pl many       mt few
                                  9  en other      fr other      lt few        pl many       mt few
                                 11  en other      fr other      lt other      pl many       mt many
                                 15  en other      fr other      lt other      pl many       mt many
                                 19  en other      fr other      lt other      pl many       mt many
                                 23  en other      fr other      lt few        pl few        mt other
                                 29  en other      fr other      lt few        pl many       mt other
                                100  en other      fr other      lt other      pl many       mt other
                      1000000000000  en other      fr other      lt other      pl many       mt other
                    1000000000000.0  en other      fr other      lt other      pl other      mt other
          9999999999999999999999919  en other      fr other      lt other      pl many       mt many
          9999999999999999999999999  en other      fr other      lt few        pl many       mt other
    1000000000000000000000000000000  en other      fr other      lt other      pl many       mt other
```
