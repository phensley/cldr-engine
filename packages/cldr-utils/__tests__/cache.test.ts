import { Cache } from '../src/cache';

interface Foo {
  key: string;
}

const parser = (k: string): Foo => ({ key: k });

test('basics', () => {
  const cache = new Cache<Foo>(parser, 3);
  expect(cache.get('foo')).toEqual({ key: 'foo' });
  expect(cache.size()).toEqual(1);
  expect(cache.get('foo')).toEqual({ key: 'foo' });
  expect(cache.size()).toEqual(1);

  expect(cache.get('bar')).toEqual({ key: 'bar' });
  expect(cache.get('quux')).toEqual({ key: 'quux' });
  expect(cache.size()).toEqual(3);

  expect(cache.get('zzz')).toEqual({ key: 'zzz' });
  expect(cache.size()).toEqual(3);
});
