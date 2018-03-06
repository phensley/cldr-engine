# Arbitrary precision math

A `Decimal` type with arbitrary precision is available. You can format and manipulate numbers far beyond the limited precision of JavaScript's `number` type.

There are times when you need to perform arithmetic on numbers prior to formatting, and `Decimal` gives you control over these operations.

`Decimal` values are immutable, so any operations on them return new values.

Arguments to methods that accept `Decimal` also accept `string` or `number` and will automatically coerce those types fo `Decimal`.

```typescript
const n = new Decimal('10');

n.add(1);
// > 11

n.divide('4');
// > 2.5
```

### Usage examples

```typescript
import { Decimal, MathContext } from '@phensley/cldr';

const big = String(Number.MAX_SAFE_INTEGER));
// > "9007199254740991"

const n = new Decimal(big);
n.add(n);
// > "18014398509481982"

n.multiply(n);
// > "81129638414606663681390495662081"

const pi = new Decimal('3.141592653');
pi.precision();
// > 10

pi.scale();
// > 9

n.divide(pi);
// > "2867080570149586.2"

n.divide(pi, { precision: 30 });
// > "2867080570149586.16278633116602"

n.divide(pi, { precision: 20 });
// > "2867080570149586.1628"

const ctx: MathContext = { precision: 20, rounding: 'floor' };
n.divide(pi, ctx);
// > "2867080570149586.1627"

const EN = cldr.get('en-US');
EN.Numbers.formatDecimal(n.divide(pi, ctx), opts);
// > "2,867.1 trillion"
```

### Parsing

Exponential notation is supported.

```typescript
const n = new Decimal('-1.2e-18');
// > -0.0000000000000000012
```


The `Decimal` type's parser does not support locale-aware parsing, and only supports parsing numbers with a handful of characters. Any unexpected characters will throw an error.

```
number = '0'..'9' | '-' | '+' | 'e' | 'E' | '.' | ','
```

A locale-aware parser can be added in the future but that interface will be separate from the `Decimal` type, e.g `cldr.Numbers.parseNumber(string)`.

Note: For speed, parsing is done in reverse. Error messages may seem confusing as they will reflect the index of the first illegal character found, scanning right to left.

In the case below the 2nd `','` character is encountered first.

```typescript
new Decimal('1,234,567.89');
// > Error: Unexpected character at 5: ,
```

Valid characters found in the wrong place will also throw an error.

```typescript
new Decimal('-1..4');
// > Error: Extra radix point seen at 2

new Decimal('10e');
// > Error: Exponent not provided

new Decimal('10ee10');
// > Error: Extra exponent character at 2

new Decimal('10e+-10');
// > Error: Duplicate sign character at 3
```

### Precision

The default precision for operations is 28 and the default rounding mode is `'half-even'`. You can alter these for multiplication and division by passing in a `MathContext` object.

```typescript
new Decimal('10').divide('6');
// > 1.666666666666666666666666667

new Decimal('10').divide('6', { precision: 10 });
// > 1.666666667

new Decimal('10').divide('6', { precision: 10, rounding: 'floor' });
// > 1.666666666
```

### Addition

```typescript
let n = new Decimal('10');
n.add('2');
// > 12

n.add('1.9999999');
// > 11.9999999

n.add('-12.345');
// > -2.345
```

### Subtraction

```typescript
let n = new Decimal('14.5');
n.subtract('23.999');
// > -9.499

n = new Decimal('1000000');
n.subtract('1.00000000001');
// > 999998.99999999999
```

### Multiplication

```typescript
const n = new Decimal('10.1');
n.multiply('2.789')
// > 28.1689

n.multiply('0.33333333333');
// > 3.366666666633
```

### Division

```typescript
const n = new Decimal('10');
n.divide('4');
// > 2.5

n.divide('3');
// > 3.333333333333333333333333333

n.divide('3', { precision: 10 });
// > 3.333333333

import { DecimalConstants } from '@phensley/cldr';

// Diameter of the observable universe in meters
const diameter = new Decimal('8.8e26');
// > 880000000000000000000000000

// Calculating the circumference to 60 digits of precision
// using 100 digits of π
diameter.multiply(DecimalConstants.PI, { precision: 60 });
// > 2764601535159018049847126177.28596253809350907145009312245795
```

### Scaling

Using `setScale` will adjust the coefficient to the given scale.

```typescript
const n = new Decimal('12345.12345');
n.setScale(2);
// > 12345.12

n.setScale(-2);
// > 12300
```

### Moving the decimal point

Since the `Decimal` type uses a base-10 radix internally, moving the decimal point is fast as it does not require multiplication or division by powers of 10.

```typescript
const n = new Decimal('12345.12345');

n.movePoint(-10);
// > 0.000001234512345

n.movePoint(10);
// > 123451234500000
```
