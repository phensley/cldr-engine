import { leftPad } from '../../src/utils/string';

test('left pad', () => {
  expect(leftPad(123, 5)).toEqual('  123');
  expect(leftPad('123', 5)).toEqual('  123');

  expect(leftPad(123, 2)).toEqual('123');
  expect(leftPad('123', 2)).toEqual('123');
});
