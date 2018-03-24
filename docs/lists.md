# Lists

## List types

```typescript
let cldr = framework.get('en');
let items = ['one', 'two', 'three', 'four'];

cldr.General.formatList(items.slice(0, 2));
// > "one and two"

cldr.General.formatList(items);
// > "one, two, three, and four"

cldr.General.formatList(items, 'or');
// > "one, two, three, or four"

cldr = framework.get('fr');
items = ['un', 'deux', 'trois', 'quatre'];

cldr.General.formatList(items.slice(0, 2));
// > "un et deux"

cldr.General.formatList(items);
// > "un, deux, trois et quatre"

cldr.General.formatList(items, 'or');
// > "un, deux, trois ou quatre"

items = ['2 miles', '16 feet', '9 inches'];
cldr.General.formatList(items, 'unit-long');
// > "2 miles, 16 feet, 9 inches"

items = ['15°', '17′', '31″'];
cldr.General.formatList(items, 'unit-narrow');
// > "15° 17′ 31″"
```


## Formatting to an array of parts

```typescript
let cldr = framework.get('en');
let items = ['one', 'two', 'three', 'four'];

cldr.formatListToParts(items);

[
  { type: 'item', value: '1' },
  { type: 'literal', value: ', '},
  { type: 'item', value: '2' },
  { type: 'literal', value: ', '},
  { type: 'item', value: '3' },
  { type: 'literal', value: ', and '},
  { type: 'item', value: '4' }
]
```
