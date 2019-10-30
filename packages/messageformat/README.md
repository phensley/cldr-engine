# @phensley/messageformat

Compact and extensible ICU message formatter with built-in support for `plural`, `select`, and `selectordinal`.

### Examples

#### Setup

```typescript
import {
  buildMessageMatcher,
  parseMessagePattern,
  MessageArg,
  MessageEngine,
  MessageNamedArgs
} from '@phensley/messageformat';

const FORMATTERS = {
  foo: (args: MessageArg[], options: string[]) =>
    options[0] === 'upper' ? args[0].toUpperCase() : args[0].toLowerCase()
};

const FORMATTER_NAMES = Object.keys(FORMATTERS);

const format = (message: string, positional: MessageArg[], named: MessageNamedArgs = {}) => {
  const matcher = buildMessageMatcher(message, FORMATTER_NAMES);
  const code = parseMessagePattern(message, matcher);
  const engine = new MessageEngine('en', FORMATTERS, code);
  console.log(engine.evaluate(positional, named));
};

let msg: string;
```

#### Example 1 - plural cardinals

```typescript
msg = '{count, plural, offset:1 =0 {Be the first to like this} =1 {You liked this} ' +
  'one {You and someone else liked this} other {You and # others liked this}}';

format(msg, [], { count: 0 });
format(msg, [], { count: 1 });
format(msg, [], { count: 2 });
format(msg, [], { count: 3 });
```

```
Be the first to like this
You liked this
You and someone else liked this
You and 2 others liked this
```

#### Example 2 - select

```typescript
msg = 'Get {0, select, male {his} female {her} other {their}} {item}';

format(msg, ['they'], { item: 'coat' });
format(msg, ['female'], { item: 'jacket' });
format(msg, ['male'], { item: 'parka' });
```

```
Get their coat
Get her jacket
Get his parka
```

#### Example 3 - plural ordinals and select


```typescript

msg = '{name} {tied select true {tied for} other {came in}} {place selectordinal one {#st} ' +
  'two {#nd} few {#rd} other {#th}} place';

const racers = [
  { name: 'Lisa', place: 1 },
  { name: 'Bob', place: 2 },
  { name: 'Betty', place: 3 },
  { name: 'Frank', place: 4, tied: true },
  { name: 'George', place: 4, tied: true },
  { name: 'Larry', place: 5 }
];

for (const racer of racers) {
  format(msg, [], racer);
}
```

```
Lisa came in 1st place
Bob came in 2nd place
Betty came in 3rd place
Frank tied for 4th place
George tied for 4th place
Larry came in 5th place
```

#### Example 4 - custom formatter

```typescript
msg = '{word} uppercase = {word foo upper} lowercase = {word foo lower}';

const WORDS = [
  'Computer',
  'Science',
  'Mathematics'
];

for (const word of WORDS) {
  format(msg, [], { word });
}
```

```
Computer uppercase = COMPUTER lowercase = computer
Science uppercase = SCIENCE lowercase = science
Mathematics uppercase = MATHEMATICS lowercase = mathematics
```