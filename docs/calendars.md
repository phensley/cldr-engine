# Calendar date formatting

You can pass a `UnixEpochtime` or any `CalendarDate` instance to any of the formatting routines. The argument will be converted into a date appropriate to the selected calendar.

```typescript
import { UnixEpochTime } from '@phensley/cldr';

// March 5, 2018 3:35:08 PM UTC
const march5: UnixEpochTime = { epoch: 1520282108000, zoneId: 'America/New_York' };

let en = cldr.get('en');
en.Calendars.formatDate(march5, { date: 'full' });

// > "Monday, March 5, 2018"

const es = cldr.get('es-419');
es.Calendars.formatDate(march5, { date: 'full' });

// > "lunes, 5 de marzo de 2018"
```

# Calendar types

Calendar dates will be formatted using a locale's preferred calendar, by default. It is possible to pass the
`"ca"` option to override the default calendar.

```typescript
en.Calendars.formatDate(march5, { date: 'full' });

// > "Monday, March 5, 2018"

en.Calendars.formatDate(march5, { date: 'full', ca: 'persian' });

// > "Monday, Esfand 14, 1396 AP"

const fa = cldr.get('fa-IR');
fa.Calendars.formatDate(march5, { date: 'full' });

// > "1396 اسفند 14, دوشنبه"    // NOTE:: calendar number system support is in progress
```

The calendar can also be selected by using the Unicode `"ca"` extension with a valid calendar subtag.

```typescript

en = cldr.get('en-US-u-ca-japanese');
en.Calendars.formatDate(march5, { date: 'full' });

// > "Monday, March 5, 30 Heisei"

en = cldr.get('en-US-u-ca-persian');
en.Calendars.formatDate(march5, { date: 'full' });

// > "Monday, Esfand 14, 1396 AP"
```

### Skeleton matching

ICU-compatible best-fit skeleton matching is supported. A skeleton can contain both date and time
fields, and will select the appropriate patterns and wrapper.

```typescript
en = cldr.get('en');
en.Calendars.formatDate(march5, { skeleton: 'yMMMMdHms' });

// > "March 5, 2018 at 15:35:08"

en.Calendars.formatDate(march5, { skeleton: 'yEMMMMBh' });

// > "Mon, March 5, 2018 at 3 in the afternoon"

en.Calendars.formatDate(march5, { skeleton: 'yMMMMdhmsSSSVVVV' });

// > "March, 5 2018 at 3:35:08 PM New York Time"

en.Calendars.formatDate(march5, { skeleton: 'Yw' });

// > "week 10 of 2018"
```

### Intervals

Intervals can be formatted by providing a skeleton. The "field of greatest difference" will determine which pattern
is used.

```typescript
// March 11, 2018 7:00:25 AM UTC
// March 10, 2018 23:00:25 PM Los Angeles local time
const epoch = 1520751625000;
const day = 86400 * 1000;
const zoneId = 'America/Los_Angeles';

const mar11 = { epoch, zoneId };
const mar14 = { epoch: epoch + (3 * day), zoneId };

en.Calendars.formatDateInterval(mar11, mar14, { skeleton: 'yMMMd' });

// > "Mar 10 – 14, 2018"
```

The matched pattern will be adjusted to match the width of the fields in the input skeleton.

```typescript
en.Calendars.formatDateInterval(mar11, mar14, { skeleton: 'yMd' });

// > "3/10/2018 – 3/14/2018"

en.Calendars.formatDateInterval(mar11, mar14, { skeleton: 'yMMd' });

// > "03/10/2018 – 03/14/2018"

en.Calendars.formatDateInterval(mar11, mar14, { skeleton: 'yMMMd' });

// > "Mar 10 – 14, 2018"

en.Calendars.formatDateInterval(mar11, mar14, { skeleton: 'yMMMMd' });

// > "March 10 – 14, 2018"

en.Calendars.formatDateInterval(mar11, mar14, { skeleton: 'yEEEEMMMMd' });

// > "Saturday, March 10 – Wednesday, March 14, 2018"
```

### Formatting to parts

```typescript
en.Calendars.formatDateToParts(march5, { date: 'full' });

[
  { type: 'weekday', value: 'Monday' },
  { type: 'literal', value: ', ' },
  { type: 'month', value: 'March' },
  { type: 'literal', value: ' ' },
  { type: 'day', value: '5' },
  { type: 'literal', value: ', ' },
  { type: 'year', value: '2018' }
]
```

```typescript
en.Calendars.formatDateIntervalToParts(mar11, mar14, { skeleton: 'yMMMd' });

[
  { type: 'month', value: 'Mar' },
  { type: 'literal', value: ' ' },
  { type: 'day', value: '10' },
  { type: 'literal', value: ' – ' },
  { type: 'day', value: '14' },
  { type: 'literal', value: ', ' },
  { type: 'year', value: '2018' }
]
```