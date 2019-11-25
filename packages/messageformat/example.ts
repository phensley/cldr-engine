import { pluralRules } from '@phensley/plurals';
import {
  buildMessageMatcher,
  parseMessagePattern,
  MessageArg,
  MessageEngine,
  MessageFormatter,
  MessageNamedArgs
} from './src';

const FORMATTERS = {
  foo: (args: MessageArg[], options: string[]) =>
    options[0] === 'upper' ? args[0].toUpperCase() : args[0].toLowerCase()
};

const FORMATTER_NAMES = Object.keys(FORMATTERS);

const MATCHER = buildMessageMatcher(FORMATTER_NAMES);

const parse = (message: string) => parseMessagePattern(message, MATCHER);

const dump = (message: string) =>
  console.log(JSON.stringify(parse(message)));

const plurals = (language: string, region?: string) =>
  pluralRules.get(language, region);

const format = (message: string, positional: MessageArg[], named: MessageNamedArgs = {}) => {
  const engine = new MessageEngine(plurals('en'), FORMATTERS, parse(message));
  console.log(engine.evaluate(positional, named));
};

let msg: string;

// Example 1 - message parsing (cache code repeated use)

// Messages can be pre-parsed and embedded into source code, JSON, or YAML files, or parsed and cached at runtime.

dump('{0 select, male {his} female {her} other {their}} {item}');

dump('{word} uppercase = {word foo upper} lowercase = {word foo lower}');

// Example 2 - MessageFormatter

const rules = plurals('en');
const formatter = new MessageFormatter({ plurals: rules, formatters: FORMATTERS, cacheSize: 100 });
msg = '{0 select, male {his} female {her} other {their}} {item}';
console.log(formatter.format(msg, ['female'], { item: 'parka' }));

// Example 3 - plural cardinals

msg = '{count, plural, offset:1 =0 {Be the first to like this} =1 {You liked this} one {You and someone else liked this} other {You and # others liked this}}';

format(msg, [], { count: 0 });
format(msg, [], { count: 1 });
format(msg, [], { count: 2 });
format(msg, [], { count: 3 });

// Example 4 - select

msg = '{0, select, male {his} female {her} other {their}} {item}';

format(msg, ['they'], { item: 'coat' });
format(msg, ['female'], { item: 'jacket' });
format(msg, ['male'], { item: 'parka' });

// Example 5 - plural ordinals and select

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

// Example 6 - custom formatter

msg = '{word} uppercase = {word foo upper} lowercase = {word foo lower}';

const WORDS = [
  'Computer',
  'Science',
  'Mathematics'
];

for (const word of WORDS) {
  format(msg, [], { word });
}
