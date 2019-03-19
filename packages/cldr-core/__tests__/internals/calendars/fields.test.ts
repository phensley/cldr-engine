import { getFieldType } from '../../../src/internals/calendars/fields';

test('field type', () => {
  let r = getFieldType('c', 1);
  expect(r![0]).toEqual('c');

  r = getFieldType('g', 21);
  expect(r![0]).toEqual('g');

  r = getFieldType('1', 2);
  expect(r).toEqual(undefined);
});
