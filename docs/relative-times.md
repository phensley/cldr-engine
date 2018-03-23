# Relative time formatting

To format a relative time you can pass in a numeric value (`number`, `string` or `Decimal`) and a `RelativeTimeFieldType` field name.

```typescript
const cldr = framework.get('en-US');

cldr.Calendars.formatRelativeTimeField(1, 'hour');
// > "in 1 hour"

cldr.Calendars.formatRelativeTimeField(0, 'day');
// > "today"

cldr.Calendars.formatRelativeTimeField('0', 'day');
// > "today"

cldr.Calendars.formatRelativeTimeField(1, 'day');
// > "tomorrow"

cldr.Calendars.formatRelativeTimeField(-1, 'day')
// > "yesterday"

cldr.Calendars.formatRelativeTimeField('5', 'day');
// > "in 5 days"

cldr.Calendars.formatRelativeTimeField(4, 'sun');
// > "in 4 Sundays"

cldr.Calendars.formatRelativeTimeField(-1, 'month');
// > "1 month ago"

cldr.Calendars.formatRelativeTimeField(-6, 'month');
// > "6 months ago"

cldr.Calendars.formatRelativeTimeField(1, 'year');
// > "next year"

cldr.Calendars.formatRelativeTimeField(new Decimal('-3.2'), 'week');
// > "3.2 weeks ago"
```

You can vary the unit width by passing in options `{ width: <value> }` where value is `'wide'`, `'short'` or `'narrow'`.

```typescript
cldr.Calendars.formatRelativeTimeField(1, 'week', { width: 'short' });
// > "next wk"

cldr.Calendars.formatRelativeTimeField(-3, 'week', { width: 'narrow' });
// > "3 wk. ago"

cldr.Calendars.formatRelativeTimeField(2, 'month', { width: 'narrow'});
// > "in 2 mo."
```
