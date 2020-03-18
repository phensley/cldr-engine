# @phensley/decimal

[![@phensley/decimal](https://badge.fury.io/js/%40phensley%2Fdecimal.svg)](https://www.npmjs.com/package/@phensley/decimal) [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/decimal)](https://bundlephobia.com/result?p=@phensley/decimal)

Arbitrary precision decimal math, used to support [@phensley/cldr](https://www.npmjs.com/package/@phensley/clde), but can be used by itself.

## Installation

NPM:

```
npm install --save @phensley/decimal
```

Yarn:

```
yarn add @phensley/decimal
```

## Example

```typescript
import { Decimal, DecimalConstants, MathContext } from '@phensley/decimal';

const area = (radius: Decimal, ctx: MathContext) =>
  DecimalConstants.PI.multiply(radius, ctx).multiply(radius, ctx);

const calc = (ctx: MathContext) => {
  for (const r of ['.002', '1', '1.5', '999.999']) {
    const radius = new Decimal(r);
    console.log(
      `area of circle with radius ${r.padEnd(7)} is ${area(radius, ctx)}`
    );
  }
  console.log();
};

for (const scale of [5, 15]) {
  console.log(`Scale ${scale}:`);
  calc({ scale });
}

for (const precision of [10, 30]) {
  console.log(`Precision ${precision}:`);
  calc({ precision });
}

const LIGHT_YEAR_KM = new Decimal('9.461e12');
const NEAREST_STARS: any = {
  'Proxima Centauri': '4.32',
  "Barnard's Star": '5.96',
  'Wolf 359': '7.78',
  'Lalande 21185': '8.29'
};

for (const name of Object.keys(NEAREST_STARS)) {
  const distly = NEAREST_STARS[name];
  const distkm = new Decimal(distly).multiply(LIGHT_YEAR_KM, { precision: 30 });
  console.log(
    `Distance to ${name.padEnd(16)} is ${distkm.toString()} kilometers`
  );
}
```

```
Scale 5:
area of circle with radius .002    is 0.00001
area of circle with radius 1       is 3.14159
area of circle with radius 1.5     is 7.06858
area of circle with radius 999.999 is 3141586.36841

Scale 15:
area of circle with radius .002    is 0.000012566370614
area of circle with radius 1       is 3.141592653589793
area of circle with radius 1.5     is 7.068583470577035
area of circle with radius 999.999 is 3141586.370407627651860

Precision 10:
area of circle with radius .002    is 0.00001256637061
area of circle with radius 1       is 3.141592654
area of circle with radius 1.5     is 7.068583470
area of circle with radius 999.999 is 3141586.370

Precision 30:
area of circle with radius .002    is 0.0000125663706143591729538505735331
area of circle with radius 1       is 3.14159265358979323846264338328
area of circle with radius 1.5     is 7.06858347057703478654094761238
area of circle with radius 999.999 is 3141586.37040762765152975625124

Distance to Proxima Centauri is 40871520000000 kilometers
Distance to Barnard's Star   is 56387560000000 kilometers
Distance to Wolf 359         is 73606580000000 kilometers
Distance to Lalande 21185    is 78431690000000 kilometers
```
