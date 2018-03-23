# Unit formatting

Basic unit formatting accepts a `Quantity` which is a scalar value combined with a unit. The unit is
optional, and will fall back to normal decimal number formatting.

```typescript
const cldr = framework.get('en-US');

cldr.Units.formatQuantity({ value: '123', unit: 'meter' });
// > "123 meters"

cldr.Units.formatQuantity({ value: '12345', unit: 'meter' }, { style: 'long', minimumFractionDigits: 1 });
// > "12.3 thousand meters"
```

### Plurals

Plural rules are applied to the formatted number to select the appropriate unit pattern.

```typescript
const qty = { value: '1', unit: 'pound'};
cldr.Units.formatQuantity(qty, { style: 'long' });
// > "1 pound"

cldr.Units.formatQuantity(qty, { style: 'long', minimumFractionDigits: 1 });
// > "1.0 pounds"
```

### Unit sequence formatting

A sequence of units can be formatted together.

```typescript
const quantities = [{ value: '123', unit: 'meter'}, { value: '17.2', unit: 'centimeter' }];
cldr.Units.formatQuantitySequence(quantities);
// > "123 meters 17.2 centimeters"
```

### Formatting as parts

Both unit and unit sequences can be formatted to a `Part[]` array.

```typescript
const quantities = [{ value: '123', unit: 'meter'}, { value: '17.2', unit: 'centimeter' }];
cldr.Units.formatQuantitySequenceToParts(quantities);

[
  { type: 'digits', value: '123' },
  { type: 'literal', value: ' meters'},
  { type: 'literal', value: ' '},
  { type: 'digits', value: '17' },
  { type: 'decimal', value: '.'},
  { type: 'digits', value: '2'},
  { type: 'literal', value: ' centimeters'}
]
```
