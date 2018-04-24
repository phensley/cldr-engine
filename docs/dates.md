# Representing calendar dates

There are two ways of representing dates: `UnixEpochTime` and `CalendarDate`. Either of these can be passed to the formatting routines.

The `UnixEpochTime` exists as a generic holder of a Unix epoch timestamp (number of milliseconds since midnight Jan 1 1970 UTC) and a timezone identifier (e.g. `"America/New_York"`).

A `CalendarDate` represents a date in a particular calendar, e.g. Gregorian. This date is also locale-aware as it changes its week-of-month and week-of-year calculations based on the region.

For example, to create a Gregorian date with the Eastern time zone in the `"en-US"` locale:

```typescript
const en = framework.get('en-US');
const date = en.Calendars.newGregorianDate(1109916428000, 'America/New_York');

date.year();
// > 2005

date.month(); // one-based month, 3 = March
// > 3

date.dayOfMonth(); // one-based day of month
// > 4

date.dayOfWeek(); // one-based day of week, 1 = Sunday, .. 6 = Saturday
// > 6
```

Additional methods exist for converting between calendars.

```typescript

const gregorian = en.Calendars.newGregorianDate(1109916428000, 'America/New_York');
const date = en.Calendars.toPersianDate(gregorian);

date.year();

// > 1383

date.month();

// > 11

date.dayOfMonth();

// > 14

date.dayOfWeek();

// > 6
