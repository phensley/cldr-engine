import { checksumIndices } from '../../src';

test('checksum', () => {
  expect(checksumIndices('1.0.0', {})).toEqual('eb421bf2');
});
