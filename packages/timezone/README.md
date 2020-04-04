# @phensley/timezone

[![@phensley/timezone](https://badge.fury.io/js/%40phensley%2Ftimezone.svg)](https://www.npmjs.com/package/@phensley/timezone) [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/timezone)](https://bundlephobia.com/result?p=@phensley/timezone)

Compact timezone library provides the full range of tzdb data. https://data.iana.org/time-zones/tz-link.html

## Installation

NPM:

```
npm install --save @phensley/timezone
```

Yarn:

```
yarn add @phensley/timezone
```

## Examples

Resolve old timezone ids that are deprecated.

```typescript
import { TZ } from '@phensley/timezone';

const id = TZ.resolveId('Pacific/Samoa');
console.log(id);
```

```
Pacific/Pago_Pago
```

Lookup the zone info for a timezone id at a given UTC time. Timezone offsets are in milliseconds.

```typescript
const ZONES = [
  'UTC',
  'Pacific/Samoa',
  'America/New_York',
  'Pacific/Pago_Pago',
  'Asia/Tokyo',
  'Europe/Paris',
];

const now = new Date(2020, 2, 18, 12, 30, 0).getTime();
for (const zoneid of ZONES) {
  const info = TZ.fromUTC(zoneid, now);
  console.log(`${zoneid.padEnd(18)} -> ${JSON.stringify(info)}`);
}
```

```
UTC                -> {"abbr":"UTC","dst":0,"offset":0,"zoneid":"Etc/UTC"}
Pacific/Samoa      -> {"abbr":"SST","dst":0,"offset":-39600000,"zoneid":"Pacific/Pago_Pago"}
America/New_York   -> {"abbr":"EDT","dst":1,"offset":-14400000,"zoneid":"America/New_York"}
Pacific/Pago_Pago  -> {"abbr":"SST","dst":0,"offset":-39600000,"zoneid":"Pacific/Pago_Pago"}
Asia/Tokyo         -> {"abbr":"JST","dst":0,"offset":32400000,"zoneid":"Asia/Tokyo"}
Europe/Paris       -> {"abbr":"CET","dst":0,"offset":3600000,"zoneid":"Europe/Paris"}
```
