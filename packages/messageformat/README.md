# @phensley/messageformat

[![@phensley/messageformat](https://badge.fury.io/js/%40phensley%2Fmessageformat.svg)](https://www.npmjs.com/package/@phensley/messageformat) [![min+gzip](https://badgen.net/bundlephobia/minzip/@phensley/messageformat)](https://bundlephobia.com/result?p=@phensley/messageformat)

Compact and extensible ICU message formatter with built-in support for `plural`, `select`, and `selectordinal`. Also supports plural calculations using arbitrary precision decimal numbers.

## Installation

NPM:

```
npm install --save @phensley/messageformat
```

Yarn:

```
yarn add @phensley/messageformat
```

## Examples

#### Setup

The package allows you to wire up the different types how you want. Things are broken out so that parsing can be done separately from evaluation.

Parsing can be done at build time -- read a YAML file, parse messages and embed them into a YAML/JSON file, or embed them into code, for faster runtime message evaluation.

Custom formatting and argument conversion functions can be defined and plugged into the framework.

```typescript
import { pluralRules } from '@phensley/plurals';
import {
  buildMessageMatcher,
  parseMessagePattern,
  DefaultMessageArgConverter,
  MessageArg,
  MessageEngine,
  MessageFormatter,
  MessageNamedArgs
} from '@phensley/messageformat';

const FORMATTERS = {
  foo: (args: MessageArg[], options: string[]) =>
    options[0] === 'upper' ? args[0].toUpperCase() : args[0].toLowerCase()
};

const FORMATTER_NAMES = Object.keys(FORMATTERS);

const MATCHER = buildMessageMatcher(FORMATTER_NAMES);

const CONVERTER = new DefaultMessageArgConverter();

const parse = (message: string) => parseMessagePattern(message, MATCHER);

const dump = (message: string) => console.log(JSON.stringify(parse(message)));

const plurals = (language: string, region?: string) =>
  pluralRules.get(language, region);

const format = (
  message: string,
  positional: MessageArg[],
  named: MessageNamedArgs = {}
) => {
  const engine = new MessageEngine(
    plurals('en'),
    CONVERTER,
    FORMATTERS,
    parse(message)
  );
  console.log(engine.evaluate(positional, named));
};

let msg: string;
```

#### Example 1 - message parsing (cache for repeated use)

Messages can be pre-parsed and embedded into source code, JSON, or YAML files, or parsed and cached at runtime.

```typescript
dump('{0 select, male {his} female {her} other {their}} {item}');
```

```
[4,[[3,[0],[["male",[0,"his"]],["female",[0,"her"]],["other",[0,"their"]]]],[0," "],[1,"item"]]]
```

```typescript
dump('{word} uppercase = {word foo upper} lowercase = {word foo lower}');
```

```
[4,[[1,"word"],[0," uppercase = "],[6,"foo",["word"],["upper"]],[0," lowercase = "],[6,"foo",["word"],["lower"]]]]
```

#### Example 2 - MessageFormatter class

If you don't need to embed parsed messages into source code, the `MessageFormatter` can parse and cache messages at runtime. Internally it uses a least-recently-used cache whose size can be configured. There is no need for the elaborate setup in the first example.

```typescript
const rules = plurals('en');
const formatter = new MessageFormatter({
  plurals: rules,
  formatters: FORMATTERS,
  cacheSize: 100
});
msg = '{0 select, male {his} female {her} other {their}} {item}';
console.log(formatter.format(msg, ['female'], { item: 'parka' }));
```

```
her parka
```

#### Example 3 - plural cardinals

```typescript
msg =
  '{count, plural, offset:1 =0 {Be the first to like this} =1 {You liked this} ' +
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

#### Example 4 - select

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

#### Example 5 - plural ordinals and select

```typescript
msg =
  '{name} {tied select true {tied for} other {came in}} {place selectordinal one {#st} ' +
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

#### Example 6 - custom formatter

```typescript
msg = '{word} uppercase = {word foo upper} lowercase = {word foo lower}';

const WORDS = ['Computer', 'Science', 'Mathematics'];

for (const word of WORDS) {
  format(msg, [], { word });
}
```

```
Computer uppercase = COMPUTER lowercase = computer
Science uppercase = SCIENCE lowercase = science
Mathematics uppercase = MATHEMATICS lowercase = mathematics
```
