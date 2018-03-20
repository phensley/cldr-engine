# Arbitrary precision math

Arbitrary precision support enables formatting and manipulation of numbers far beyond the precision of JavaScript's `number` type.
There are times when you need to perform arithmetic on numbers prior to formatting, and these types give you a greater degree of control over these operations.

 * `Decimal` numbers with a decimal point.
 * `Rational` to represent fractions.

Both `Decimal` and `Rational` values are immutable, so any operations on them return new values.

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
// > 18014398509481982

// Default precision is 28
n.multiply(n);
// > 81129638414606663681390495660000

n.multiply(n, { precision: 40 });
// > 81129638414606663681390495662081

// You can also use scale instead to control the number of decimal places
n.multiply(n, { scale: 5 });
// > 81129638414606663681390495662081.00000

const pi = new Decimal('3.141592653');
pi.precision();
// > 10

pi.scale();
// > 9

// Default precision is 28
n.divide(pi);
// > 2867080570149586.162786331166

n.divide(pi, { precision: 30 });
// > 2867080570149586.16278633116602

n.divide(pi, { precision: 20 });
// > 2867080570149586.1628

n.divide(pi, { scale: 4 });
// > 2867080570149586.1628

const ctx: MathContext = { scale: 4, rounding: 'floor' };
n.divide(pi, ctx);
// > 2867080570149586.1627

const EN = cldr.get('en-US');
EN.Numbers.formatDecimal(n.divide(pi, ctx), opts);
// > "2,867.1 trillion"
```

### Parsing

The `Decimal` type's parser does not support locale-aware parsing, and only supports parsing numbers with a handful of characters. Any unexpected characters will throw an error. A locale-aware parser can be added in the future but that interface will be separate from the `Decimal` type, e.g `cldr.Numbers.parseNumber(string)`.

```
number = '0'..'9' | '-' | '+' | 'e' | 'E' | '.' | ','
```

Exponential notation is supported.

```typescript
const n = new Decimal('-1.2e-18');
// > -0.0000000000000000012
```

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

### Scale

A scale value can be provided. This will be used instead of precision.

```typescript
new Decimal('10').divide('6', { scale: 5 });
// > 1.66667

new Decimal('10').divide('7', { scale: 20 });
// > 1.42857142857142857143
```

### Setting the scale

Using `setScale` will adjust the coefficient to the given scale.

```typescript
const n = new Decimal('12345.12345');
n.setScale(2);
// > 12345.12

n.setScale(-2);
// > 12300

n.setScale(2, 'ceiling');
```

### Rounding

The following rounding modes are supported. In the descriptions the value `n` is the least-significant digit being examined for rounding.

 * `up` - round away from zero
 * `down` - round towards zero
 * `ceiling` - round towards positive infinity
 * `floor` - round towards negative infinity
 * `half-up` - if `n >= 5` round `up`; otherwise round `down`
 * `half-down` - if `n > 5` round `up`; otherwise round `down`
 * `half-even` (default) - if `n = 5` and digit to left of `n` is odd round `up`; if even round `down`
 * `05up` - round away from zero if digit to left is is 0 or 5; otherwise round towards zero
 * `truncate` - same as `half-down`

```typescript
new Decimal('1.5').setScale(0);
// > 2

new Decimal('1.5').setScale(0, 'down');
// > 1

new Decimal('10').divide('6', { scale: 5, rounding: 'ceiling' });
// > 1.66667

new Decimal('10').divide('6', { scale: 5, rounding: 'floor' });
// > 1.66666
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

// Calculating the circumference to 60 digits of precision using 100 digits of π
const circumference = diameter.multiply(DecimalConstants.PI, { precision: 60 });
// > 2764601535159018049847126177.28596253809350907145009312245795

circumference.divide(DecimalConstants.PI, { precision: 60 });
// > 880000000000000000000000000
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

## Rational numbers

```typescript
const pi = new Rational('pi');
const radius = new Rational('7 / 19');
const area = pi.multiply(radius).multiply(radius);

// > "153.9380400258998686846695258 / 361"

area.toDecimal({ scale: 10 });
// > "0.4264211635"
```

### Unit conversions with rationals

If you need to convert between units, using `Rational` numbers can help avoid losing precision. Multiply several `Rational` factors together repeatedly and divide to `Decimal` at the final step.

For example, suppose you define units in terms of other units. Depending on how you've defined your factors it may take more than one calculation.

```typescript
import { Decimal, Rational } from '@phensley/cldr';

const rjust = (s: string, w: number): string => {
  const d = w - s.length;
  return d < 0 ? s : new Array(d).fill(' ').join('') + s;
};

const factors: { [x: string]: [Rational, string]} = {
  'radian':     [new Rational('0.5 / pi'), 'revolution'],
  'revolution': [new Rational('360'), 'degree'],
  'degree':     [new Rational('60'), 'arc-minute'],
  'arc-minute': [new Rational('60'), 'arc-second'],
  'arc-second': [new Rational('60'), 'arc-minute']
};

const radians = new Rational('1.7');
let unit = 'radian';
let value = radians;
console.log(radians.toDecimal().toString(), unit, 'is equal to...');

do {
  const [factor, next] = factors[unit];
  value = factor.multiply(value);
  unit = next;

  const str = value.toDecimal().setScale(8).toString();
  console.log(rjust(str, 20), unit);
} while (unit !== 'arc-second');
```

Outputs:

```
1.7 radian is equal to...
          0.27056340 revolution
         97.40282517 degree
       5844.16951033 arc-minute
     350650.17062006 arc-second
```
