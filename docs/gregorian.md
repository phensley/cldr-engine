# Gregorian

```typescript
engine = cldr.get('en');
engine.Gregorian.format(march5, { date: 'full' });
// > "Monday, March 5, 2018"

const engine = cldr.get('es-419');
engine.Gregorian.format(march5, { date: 'full' });
// > "lunes, 5 de marzo de 2018"
```

TODO: intervals

### Formatting as parts

```typescript
engine.Gregorian.formatParts(march5, { date: 'full' });
```

Produces:

```javascript
[
  {type: 'weekday', value: 'Monday'},
  {type: 'literal', value: ', '},
  {type: 'month', value: 'March'},
  {type: 'literal', value: ' '},
  {type: 'day',  value: '5'},
  {type: 'literal', value: ', '},
  {type: 'year', value: '2018'}
]
```

TODO: interval parts

