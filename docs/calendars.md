# Gregorian

```typescript
import { ZonedDateTime } from '@phensley/cldr';

// March 5, 2018 3:35:08 PM UTC
const march5 = new ZonedDateTime(1520282108000, 'America/New_York');

let cldr = framework.get('en');
cldr.Calendars.formatDate(march5, { date: 'full' });

// > "Monday, March 5, 2018"

cldr = framework.get('es-419');
cldr.Calendars.formatDate(march5, { date: 'full' });

// > "lunes, 5 de marzo de 2018"
```

### Skeleton matching

ICU-compatible best-fit skeleton matching is supported. A skeleton can contain both date and time
fields, and will select the appropriate patterns and wrapper.

```typescript
cldr = framework.get('en');
cldr.Calendars.formatDate(march5, { skeleton: 'yMMMMdHms' });
// > "March 5, 2018 at 15:35:08"

cldr.Calendars.formatDate(march5, { skeleton: 'yEMMMMBh' });
// > "Mon, March 5, 2018 at 3 in the afternoon"
```

### Intervals

Intervals can be formatted by providing a skeleton. The "field of greatest difference" will determine which pattern
is used.

```typescript
// March 11, 2018 7:00:25 AM UTC
// March 10, 2018 23:00:25 PM Los Angeles local time
const epoch = 1520751625000;
const day = 86400 * 1000;

const mar11 = new ZonedDateTime(epoch, LOS_ANGELES);
const mar14 = new ZonedDateTime(epoch + (3 * day), LOS_ANGELES);

cldr.Calendars.formatDateInterval(mar11, mar14, 'yMMMd');
// > "Mar 10 – 14, 2018"
```

### Formatting to parts

```typescript
cldr.Calendars.formatDateToParts(march5, { date: 'full' });

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

```typescript
cldr.Calendars.formatDateIntervalToParts(mar11, mar14, 'yMMMd');

[
  { type: 'month', value: 'Mar' },
  { type: 'literal', value: ' ' },
  { type: 'day', value: '10' },
  { type: 'literal', value: ' – ' },
  { type: 'day', value: '14'},
  { type: 'literal', value: ', '},
  { type: 'year', value: '2018'}
]
```