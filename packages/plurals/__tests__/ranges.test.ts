import { pluralRules } from '../src';

test('english ranges', () => {
  const rules = pluralRules.get('en');
  let cat = rules.range(1, 5);
  expect(cat).toEqual('other');

  cat = rules.range(0, 1);
  expect(cat).toEqual('other');

  cat = rules.range(3, 17);
  expect(cat).toEqual('other');
});

test('irish ranges', () => {
  const rules = pluralRules.get('ga');
  let cat = rules.range(0, 1);
  expect(cat).toEqual('one');

  cat = rules.range(1, 3);
  expect(cat).toEqual('few');
});
