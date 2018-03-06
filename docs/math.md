# Arbitrary precision math

A `Decimal` type with arbitrary precision is available. You can format and manipulate numbers far beyond the limited precision of JavaScript's `number` type.

```typescript
import { Decimal } from '@phensley/cldr';

const big = String(Number.MAX_SAFE_INTEGER));
// > "9007199254740991"

const n = new Decimal(big);
n.add(n);
// > "18014398509481982"

n.multiply(n);
// > "81129638414606663681390495662081"

const pi = new Decimal('3.141592653');
n.divide(pi);
// > "2867080570149586.2"

const ctx = new MathContext(20, RoundingMode.FLOOR);
n.divide(pi, ctx);
// > "2867080570149586.1627"

EN.Numbers.formatDecimal(n.divide(pi, ctx), opts);
// > "2,867.1 trillion"
```
