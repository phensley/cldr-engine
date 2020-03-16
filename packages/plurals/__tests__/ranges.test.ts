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

  // other -> one = one
  let cat = rules.range(0, 1);
  expect(cat).toEqual('one');

  // one -> few = few
  cat = rules.range(1, 3);
  expect(cat).toEqual('few');

  // few -> many = many
  cat = rules.range(3, 8);
  expect(cat).toEqual('many');

  // two -> many = many
  cat = rules.range(2, 7);
  expect(cat).toEqual('many');

  // other -> one = one
  cat = rules.range(12, 1);
  expect(cat).toEqual('one');

  // many -> few = other
  cat = rules.range(10, 4);
  expect(cat).toEqual('other');
});

test('coverage', () => {
  const rules = pluralRules.get('ga');
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      const cat = rules.range(i, j);
      expect(cat).toBeDefined();
    }
  }
});
