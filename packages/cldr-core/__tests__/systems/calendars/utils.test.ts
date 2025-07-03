import { heaps } from './_utils';

test('heaps permutations', () => {
  const h = heaps([1, 2, 3]);
  expect(h.next()).toEqual({ value: [1, 2, 3], done: false });
  expect(h.next()).toEqual({ value: [2, 1, 3], done: false });
  expect(h.next()).toEqual({ value: [3, 1, 2], done: false });
  expect(h.next()).toEqual({ value: [1, 3, 2], done: false });
  expect(h.next()).toEqual({ value: [2, 3, 1], done: false });
  expect(h.next()).toEqual({ value: [3, 2, 1], done: false });
  expect(h.next()).toEqual({ value: undefined, done: true });
});
