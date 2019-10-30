import {
  buildMessageMatcher,
  parseMessagePattern,
  MessageArg,
  MessageEngine,
  MessageNamedArgs
} from './src';

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

// Example 1 - plural cardinals

msg =   '{count, plural, offset:1 =0 {Be the first to like this} =1 {You liked this} one {You and someone else liked this} other {You and # others liked this}}';

format(msg, [], { count: 0 });
format(msg, [], { count: 1 });
format(msg, [], { count: 2 });
format(msg, [], { count: 3 });

// Example 2 - select

msg = '{0, select, male {his} female {her} other {their}} {item}';

format(msg, ['they'], { item: 'coat' });
format(msg, ['female'], { item: 'jacket' });
format(msg, ['male'], { item: 'parka' });

// Example 3 - plural ordinals and select

msg = '{name} {tied select true {tied for} other {came in}} {place selectordinal one {#st} two {#nd} few {#rd} other {#th}} place';

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

// Example 4 - custom formatter

msg = '{word} uppercase = {word foo upper} lowercase = {word foo lower}';

const WORDS = [
  'Computer',
  'Science',
  'Mathematics'
];

for (const word of WORDS) {
  format(msg, [], { word });
}
