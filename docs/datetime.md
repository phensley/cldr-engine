# Zoned date time

```typescript
// March 5, 2018 3:35:08 PM UTC
const march5 = new ZonedDateTime(1520282108000, 'America/New_York');
march5.isDaylightSavings();
// > false

march5.metaZoneId();
// > "America_Eastern"

march5.getYear();
// > 2018
```

TODO
