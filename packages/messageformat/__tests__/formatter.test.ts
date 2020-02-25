import { MessageArg, MessageFormatter } from '../src';

const formatters = {
  foo: (args: MessageArg[], options: string[]): string =>
    options[0] === 'upper' ? args[0].toUpperCase() : args[0].toLowerCase(),
  quux: (_args: MessageArg[], _options: string[]): string => 'quux',
  quuxbar: (_args: MessageArg[], _options: string[]): string => 'quuxbar',
  quuxbaz: (_args: MessageArg[], _options: string[]): string => 'quuxbaz',
};

test('basic formatter', () => {
  const f = new MessageFormatter({ language: 'en', formatters });

  expect(f.format('{0}', ['Hello'], {})).toEqual('Hello');
  expect(f.format('{0 foo upper}', ['Hello'], {})).toEqual('HELLO');
  expect(f.format('{0 foo lower}', ['Hello'], {})).toEqual('hello');

  for (let i = 0; i < 10; i++) {
    expect(f.format('{0}', ['Hello'], {})).toEqual('Hello');
  }

  expect(f.toString()).toContain('cached=3');

  expect(f.format('{0 plural one {# item} other {# items}}', [0], {})).toEqual('0 items');
  expect(f.format('{0 plural one {# item} other {# items}}', [1], {})).toEqual('1 item');
  expect(f.format('{0 plural one {# item} other {# items}}', [2], {})).toEqual('2 items');

  expect(f.toString()).toContain('cached=4');
});

test('formatter prefixes', () => {
  const f = new MessageFormatter({ language: 'en', formatters });

  expect(f.format('{0 quux}', [0], {})).toEqual('quux');
  expect(f.format('{0 quuxbar}', [0], {})).toEqual('quuxbar');
  expect(f.format('{0 quuxbaz}', [0], {})).toEqual('quuxbaz');
});
