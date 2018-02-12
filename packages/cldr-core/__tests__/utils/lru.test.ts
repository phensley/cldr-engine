import { LRU } from '../../src/utils/lru';

test('basics', () => {
  const cache = new LRU<string, number>(5);
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
