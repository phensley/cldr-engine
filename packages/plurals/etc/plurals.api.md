## API Report File for "@phensley/plurals"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Decimal } from '@phensley/decimal';
import { DecimalArg } from '@phensley/decimal';

// @public
export class NumberOperands {
    constructor(d: Decimal);
    // (undocumented)
    f: number;
    // (undocumented)
    i: number;
    // (undocumented)
    n: number;
    // (undocumented)
    t: number;
    // (undocumented)
    toString(): string;
    // (undocumented)
    v: number;
    // (undocumented)
    w: number;
}

// @public
export class PluralRules {
    // Warning: (ae-forgotten-export) The symbol "Expr" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "Rule" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "RangeMap" needs to be exported by the entry point index.d.ts
    constructor(expressions: Expr[], cardinals: Rule[], ordinals: Rule[], ranges: RangeMap);
    // (undocumented)
    cardinal(n: DecimalArg): string;
    // (undocumented)
    operands(d: Decimal): NumberOperands;
    // (undocumented)
    ordinal(n: DecimalArg): string;
    // (undocumented)
    range(start: DecimalArg, end: DecimalArg): string;
    }

// @public
export const pluralRules: Plurals;

// @public
export class Plurals {
    get(language: string, region?: string): PluralRules;
}


// (No @packageDocumentation comment for this package)

```
