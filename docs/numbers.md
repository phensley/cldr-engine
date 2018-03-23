# Number formatting

```typescript
let cldr = framework.get('en-US');

cldr.Numbers.formatDecimal('12345.234', { group: true });
// > "12,345.234"

cldr.Numbers.formatDecimal('12345.234', { style: 'long' });
// > "12.3 thousand"

cldr.Numbers.formatDecimal('12345.234', { style: 'short' });
// > "12.3K"

cldr.Numbers.formatDecimal('.995', { style: 'percent' });
// > "100%"

cldr.Numbers.formatDecimal('.995', { style: 'percent', minimumFractionDigits: 1 });
// > "99.5%"

cldr.Numbers.formatDecimal('.995', { style: 'permille', minimumFractionDigits: 1 });
// > "995.0‰"
```

You can also format percent and per mille with a number that has already been scaled:

```typescript
cldr.Numbers.formatDecimal('12.5', { style: 'percent-scaled', minimumFractionDigits: 1 });
// > "12.5%"

cldr.Numbers.formatDecimal('12.5', { style: 'permille-scaled', minimumFractionDigits: 1 });
// > "12.5‰"
```

```typescript
const locales = ['es-419', 'fr-CA', 'de', 'ja', 'ar', 'ko'];
for (const locale of locales) {
  const cldr = framework.get(locale);
  console.log(`${locale}: ${cldr.Numbers.formatDecimal('12345.234', { style: 'long' })}`);
}

// > "es-419: 12.3 mil"
// > "fr-CA: 12,3 mille"
// > "de: 12,3 Tausend"
// > "ja: 1.2万"
// > "ar: 12.3 ألف"
// > "ko: 1.2만"
```

### Formatting as parts

You can format any number as an array of `Part` objects. This can provide some flexibility for designers to format segments of a number differently, e.g. wrapping each in a different HTML tag.

```typescript
cldr.Numbers.formatDecimalToParts('-12345.234', { group: true });

[
  { type: 'minus', value: '-' },
  { type: 'digits', value: '12' },
  { type: 'group', value: ',' },
  { type: 'digits', value: '345' },
  { type: 'decimal', value: '.' },
  { type: 'digits', value: '234' }
]
```

### Arbitrary precision

There is no limit on the precision of a number. This gives us more precise control over formatting and rounding without the constraints of the built-in `number` type.

See the [Math](math.md) docs for more details on using the `Decimal` type directly.

```typescript
const big = String(Number.MAX_SAFE_INTEGER);
cldr.Numbers.formatDecimal(big + big, { group: true });
// > "90,071,992,547,409,919,007,199,254,740,991"

cldr.Numbers.formatDecimal(big + big, { style: 'long', group: true });
// > "90,071,992,547,409,919,007.2 trillion"

const small = 0.1000000000000000000000000000000000000001;
// > 0.1

cldr.Numbers.formatDecimal('0.1000000000000000000000000000000000000001', { minimumFractionDigits: 40 });
// > "0.1000000000000000000000000000000000000001"
```
