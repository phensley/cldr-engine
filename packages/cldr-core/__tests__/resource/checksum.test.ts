import { checksumIndices } from '@phensley/cldr-core';

test('checksum', () => {
  expect(checksumIndices('1.0.0', {})).toEqual('eb421bf2');
});
