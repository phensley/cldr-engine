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
  const heap = new Heap(cmp, strings);

  const res: string[] = [];
  while (!heap.empty()) {
    res.push(heap.pop()!);
  }

  strings.sort(cmp);
  expect(strings).toEqual(res);
});
