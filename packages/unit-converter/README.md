# @phensley/unit-converter

General framework for converting between units. Includes pre-defined factors for conversion between CLDR units.

```typescript
import { MathContext } from '@phensley/decimal';
import { LENGTH, UnitFactors } from '@phensley/unit-converter';

const factors = new UnitFactors(LENGTH);
const ctx: MathContext = { precision: 7 };
const dst = 'yard';
for (const unit of ['foot', 'mile']) {
  const fac = factors.get(unit, dst)!;
  for (const n of [1, 1.5, 2, 3, 4, 5, 6, 10]) {
    const r = fac.multiply(n, ctx);

    const a = `${n} ${unit}`.padStart(10);
    const b = `${r.toDecimal(ctx).toString()} ${dst}`.padEnd(14);
    const c = `${r.numerator()} \u00F7 ${r.denominator()} ${dst}`;
    console.log(`${a} == ${b}    ${c}`);
  }
  console.log();
}

```

```
    1 foot == 0.3333333 yard    12 ÷ 36 yard
  1.5 foot == 0.5 yard          18.0 ÷ 36 yard
    2 foot == 0.6666667 yard    24 ÷ 36 yard
    3 foot == 1 yard            36 ÷ 36 yard
    4 foot == 1.333333 yard     48 ÷ 36 yard
    5 foot == 1.666667 yard     60 ÷ 36 yard
    6 foot == 2 yard            72 ÷ 36 yard
   10 foot == 3.333333 yard     120 ÷ 36 yard

    1 mile == 1760 yard         63360 ÷ 36 yard
  1.5 mile == 2640 yard         95040.0 ÷ 36 yard
    2 mile == 3520 yard         126720 ÷ 36 yard
    3 mile == 5280 yard         190080 ÷ 36 yard
    4 mile == 7040 yard         253440 ÷ 36 yard
    5 mile == 8800 yard         316800 ÷ 36 yard
    6 mile == 10560 yard        380160 ÷ 36 yard
   10 mile == 17600 yard        633600 ÷ 36 yard
```
