import { LRU } from '../src/lru';

test('basics', () => {
  const cache = new LRU<number>(5);
  cache.set('aaa', 1);
  cache.set('bbb', 2);
  cache.set('ccc', 3);
  expect(cache.toString()).toEqual('ccc=3 bbb=2 aaa=1');

  expect(cache.get('x')).toEqual(undefined);

  cache.set('ddd', 4);
  cache.set('eee', 5);
  expect(cache.get('ddd')).toEqual(4);
  expect(cache.toString()).toEqual('ddd=4 eee=5 ccc=3 bbb=2 aaa=1');

  cache.set('fff', 6);
  expect(cache.toString()).toEqual('fff=6 ddd=4 eee=5 ccc=3 bbb=2');

  cache.set('ccc', 33);
  expect(cache.toString()).toEqual('ccc=33 fff=6 ddd=4 eee=5 bbb=2');

  cache.set('ggg', 6);
  expect(cache.toString()).toEqual('ggg=6 ccc=33 fff=6 ddd=4 eee=5');
});

test('defaults', () => {
  const cache = new LRU<string>();
  for (let i = 0; i < 200; i++) {
    cache.set(i, String(i));
  }
  expect(cache.size()).toEqual(100);
  for (let i = 17; i < 300; i += 3) {
    cache.get(i);
  }
  for (let i = 15; i < 400; i += 3) {
    cache.get(i);
  }
  expect(cache.size()).toEqual(100);
});

test('zero capacity', () => {
  // Special case where nothing is retained in the lru. This is used
  // to performance test code that depends on a cache, in order to
  // factor out the caching itself.
  const cache = new LRU<number>(0);
  cache.set('aaa', 1);
  expect(cache.size()).toEqual(0);
  expect(cache.get('aaa')).toEqual(undefined);
});
