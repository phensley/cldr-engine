import { zeropad } from '../../src/utils/string';

test('zeropad', () => {
  expect(zeropad(15, 8)).toEqual('00000015');
  expect(zeropad(-12345, 2)).toEqual('-12345');
  expect(zeropad(12345, 2)).toEqual('12345');
  expect(zeropad(-12345, 15)).toEqual('-00000000012345');
  expect(zeropad(12345, 25)).toEqual('0000000000000000000012345');
});
