# Gregorian

```typescript
import { ZonedDateTime } from '@phensley/cldr';

// March 5, 2018 3:35:08 PM UTC
const march5 = new ZonedDateTime(1520282108000, 'America/New_York');

const EN = cldr.get('en');
EN.Gregorian.format(march5, { date: 'full' });
// > "Monday, March 5, 2018"

const ES419 = cldr.get('es-419');
ES419.Gregorian.format(march5, { date: 'full' });
// > "lunes, 5 de marzo de 2018"
```

TODO: intervals

### Formatting as parts

```typescript
EN.Gregorian.formatParts(march5, { date: 'full' });
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
