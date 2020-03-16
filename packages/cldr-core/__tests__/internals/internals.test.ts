import { SchemaConfig } from '@phensley/cldr-schema';
import { InternalsImpl } from '../../src';

test('skip checksum', () => {
  const internals = new InternalsImpl({} as SchemaConfig, '1.0', false, true);
  expect(internals.checksum).toEqual('');
});
