import { MessageArg } from '@phensley/messageformat';
import { generalApi } from '../../_helpers';

const formatters = {
  foo: (args: MessageArg[], options: string[]): string =>
    options[0] === 'upper' ? args[0].toUpperCase() : args[0].toLowerCase(),
};

test('basic formatter', () => {
  const api = generalApi('en');
  const f = api.messageFormatter({ formatters });

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
