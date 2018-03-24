import { makeEnum } from '../../src/types/enum';

test('basics', () => {
  const [ Foo, FooValues ] = makeEnum([
    'bar', 'baz', 'quux'
  ]);

  expect(Foo.bar).toEqual('bar');
  expect(Foo.baz).toEqual('baz');
  expect(Foo.quux).toEqual('quux');

  expect(FooValues).toEqual(['bar', 'baz', 'quux']);

  // expect(FooIndex.bar).toEqual(0);
  // expect(FooIndex.baz).toEqual(1);
  // expect(FooIndex.quux).toEqual(2);
});
