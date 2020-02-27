import { Heap } from '../src/heap';
import { RandString } from './rng';

const CHARS = 'abcdefghijklmnopqrstuvwxyz';

test('basic min heap', () => {
  const rng = new RandString('myseed', CHARS);
  const strings: string[] = [];
  for (let i = 0; i < 200; i++) {
    strings.push(rng.rand(10));
  }

  const cmp = (a: string, b: string) =>
    a < b ? -1 : a > b ? 1 : 0;

  // Add half the strings on construction
  const heap = new Heap(cmp, strings.slice(0, 100));

  // Push the rest onto the heap
  for (let i = 100; i < 200; i++) {
    heap.push(strings[i]);
  }

  // Pop all strings
  const res: string[] = [];
  while (!heap.empty()) {
    res.push(heap.pop()!);
  }

  // Compare to sorted input
  strings.sort(cmp);
  expect(strings).toEqual(res);
});
