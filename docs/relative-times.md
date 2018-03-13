# Relative time formatting

To format a relative time you can pass in a numeric value (`number`, `string` or `Decimal`) and a `RelativeTimeFieldType` field name.

```typescript
const EN = cldr.get('en-US');

EN.formatRelativeTime(1, 'hour');
// > "in 1 hour"

EN.formatRelativeTime(0, 'day');
// > "today"

EN.formatRelativeTime('0', 'day');
// > "today"

EN.formatRelativeTime(1, 'day');
// > "tomorrow"

EN.formatRelativeTime(-1, 'day')
// > "yesterday"

EN.formatRelativeTime('5', 'day');
// > "in 5 days"

EN.formatRelativeTime(4, 'sun');
// > "in 4 Sundays"

EN.formatRelativeTime(-1, 'month');
// > "1 month ago"

EN.formatRelativeTime(-6, 'month');
// > "6 months ago"

EN.formatRelativeTime(1, 'year');
// > "next year"

EN.formatRelativeTime(new Decimal('-3.2'), 'week');
// > "3.2 weeks ago"
```

You can vary the unit width by passing in options `{ width: <value> }` where value is `'wide'`, `'short'` or `'narrow'`.

```typescript
EN.formatRelativeTime(1, 'week', { width: 'short' });
// > "next wk"

EN.formatRelativeTime(-3, 'week', { width: 'narrow' });
// > "3 wk. ago"

EN.formatRelativeTime(2, 'month', { width: 'narrow'});
// > "in 2 mo."
```
