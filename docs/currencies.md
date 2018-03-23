# Currencies

Formatting currencies shares a lot of code under the hood with plain decimal formatting, so the interfaces should look very similar.

```typescript
const EN = cldr.get('en-US');

EN.Numbers.formatCurrency('1', 'USD', { style: 'name' });
// > "1.00 US dollars"

EN.Numbers.formatCurrency('1', 'USD', { style: 'name', minimumFractionDigits: 0 });
// > "1 US dollar"

EN.Numbers.formatCurrency('12345.234', 'USD', { style: 'name', group: true });
// > "12,345.23 US dollars"

EN.Numbers.formatCurrency('12345.234', 'USD', { style: 'symbol', group: true });
// > "$12.345.23"

EN.Numbers.formatCurrency('-12345.234', 'USD', { style: 'accounting', group: true });
// > "($12,345.23)"

EN.Numbers.formatCurrency('999900.00', 'USD', { style: 'short' });
// > "$999.9K"

EN.Numbers.formatCurrency('999999.9', 'USD', { style: 'short' });
// > "$1M"
```

### Formatting to parts

```typescript
EN.Numbers.formatCurrencyToParts('12345.234', 'BAD', { style: 'symbol', group: true });
```
Produces:
```javascript
[
  { type: 'currency', value: 'BAD' },
  { type: 'spacer', value: '\u00a0' },
  { type: 'digits', value: '12' },
  { type: 'group', value: ',' },
  { type: 'digits', value: '345' },
  { type: 'decimal', value: '.' },
  { type: 'digits', value: '23' }
]
```
