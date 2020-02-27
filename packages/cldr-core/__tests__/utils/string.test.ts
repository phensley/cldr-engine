import { leftPad } from '../../src';

test('left pad', () => {
  expect(leftPad(123, 5)).toEqual('  123');
  expect(leftPad('123', 5)).toEqual('  123');

  expect(leftPad(123, 2)).toEqual('123');
  expect(leftPad('123', 2)).toEqual('123');
});
