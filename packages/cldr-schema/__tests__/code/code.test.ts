import { CodeBuilder, Origin } from '../../src';

test('code builder', () => {
  let o: Origin;

  o = new CodeBuilder({
    calendars: ['buddhist', 'japanese', 'persian']
  }).origin();

  for (const cal of ['gregorian', 'buddhist', 'japanese', 'persian']) {
    const key = `${cal}-month`;
    expect(o.getIndex(key).size).toBeGreaterThan(0);
    expect(o.getValues(key).length).toBeGreaterThan(0);
  }

  expect(o.getIndex('missing-index').size).toEqual(0);
  expect(o.getValues('missing-index').length).toEqual(0);
});

test('schema', () => {
  let o: Origin;

  o = new CodeBuilder({
    'number-system-name': ['latn']
  }).origin();

  expect(o.getIndex('number-system-name').size).toEqual(1);
  expect(o.getValues('number-system-name')).toEqual(['latn']);
});
