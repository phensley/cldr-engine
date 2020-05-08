import { Suite } from 'benchmark';
import { makeSuite } from '../../../cldr-utils/__benchmarks__/util';
import { pluralRules } from '@phensley/plurals';
import {
  buildMessageMatcher,
  parseMessagePattern,
  DefaultMessageArgConverter,
  MessageArg,
  MessageEngine,
  MessageFormatter,
} from '@phensley/messageformat';

export const messageSuite: Suite = makeSuite('message');

const FORMATTERS = {
  foo: (args: MessageArg[], options: string[]) =>
    options[0] === 'upper' ? args[0].toUpperCase() : args[0].toLowerCase(),
};

const MESSAGE = 'foo bar {0 plural one {# item} other {# items}} {1}';
const MATCHER = buildMessageMatcher(Object.keys(FORMATTERS));
const CODE = parseMessagePattern(MESSAGE, MATCHER);
const CONVERTER = new DefaultMessageArgConverter();
const FORMATTER = new MessageFormatter({ language: 'en', formatters: FORMATTERS });

const PLURALS = pluralRules.get('en');

messageSuite.add('parse', () => {
  parseMessagePattern(MESSAGE, MATCHER);
});

messageSuite.add('eval', () => {
  new MessageEngine(PLURALS, CONVERTER, FORMATTERS, CODE).evaluate([12, 'hello']);
});

messageSuite.add('formatter', () => {
  FORMATTER.format(MESSAGE, [12, 'hello'], {});
});
