import {
  DigitsArrow,
  FieldArrow,
  KeyIndex,
  PluralIndex,
  PluralType,
  PrimitiveBundle,
  ScopeArrow,
  Vector1Arrow,
  Vector2Arrow,
} from '../../src';

type Foo = 'foo1' | 'foo2';
type Bar = 'bar1' | 'bar2' | 'bar3';

const FOO: Foo[] = ['foo1', 'foo2'];
const BAR: Bar[] = ['bar1', 'bar2', 'bar3'];

const PluralDigitValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

class DummyBundle implements PrimitiveBundle {

  constructor(
    readonly exists: boolean,
    readonly header: boolean = true) {
  }

  id(): string {
    return 'und-ZZ';
  }

  language(): string {
    return 'und';
  }

  region(): string {
    return 'ZZ';
  }

  get(offset: number): string {
    if (this.header) {
      if (offset === 0) {
        return this.exists ? 'E' : '';
      }
    }
    return offset.toString();
  }
}

test('field arrow', () => {
  const bundle = new DummyBundle(true);

  const a = new FieldArrow(1);
  expect(a.get(bundle)).toEqual('1');

  const b = new FieldArrow(123);
  expect(b.get(bundle)).toEqual('123');
});

test('digits arrow', () => {
  const bundle = new DummyBundle(true, false);
  const a = new DigitsArrow(0, PluralIndex, PluralDigitValues);

  expect(a.get(bundle, 'other', -1)).toEqual(['', 0]);

  expect(a.get(bundle, 'other', 1)).toEqual(['0', 1]);
  expect(a.get(bundle, 'other', 2)).toEqual(['2', 3]);
  expect(a.get(bundle, 'other', 3)).toEqual(['4', 5]);

  expect(a.get(bundle, 'other', 15)).toEqual(['28', 29]);
  expect(a.get(bundle, 'other', 16)).toEqual(['28', 29]);
  expect(a.get(bundle, 'other', 17)).toEqual(['28', 29]);

  expect(a.get(bundle, 'zero', 10)).toEqual(['48', 49]);
  expect(a.get(bundle, 'zero', 11)).toEqual(['50', 51]);
  expect(a.get(bundle, 'zero', 12)).toEqual(['52', 53]);

  expect(a.get(bundle, 'zero', 15)).toEqual(['58', 59]);
  expect(a.get(bundle, 'zero', 16)).toEqual(['58', 59]);
  expect(a.get(bundle, 'zero', 17)).toEqual(['58', 59]);

  expect(a.get(bundle, 'foo' as PluralType, 10)).toEqual(['', 0]);
});

type FooScope = {
  [k in Foo]: any
};

test('scope arrow', () => {
  const map: FooScope = { foo1: { bar: 1 }, foo2: { bar: 2 }};
  const a = new ScopeArrow(map);
  expect(a.get('foo1')).toEqual({ bar: 1 });
  expect(a.get('foo2')).toEqual({ bar: 2 });
  expect(a.get('bar' as any as Foo)).toBe(undefined);
});

test('1d arrow', () => {
  const bundle = new DummyBundle(true);
  const index = new KeyIndex<Foo>(FOO);
  const a = new Vector1Arrow<Foo>(0, index);

  expect(a.get(bundle, 'foo1')).toEqual('1');
  expect(a.get(bundle, 'foo2')).toEqual('2');
  expect(a.get(bundle, 'quux' as Foo)).toEqual('');
  expect(a.mapping(bundle)).toEqual({
    foo1: '1', foo2: '2'
  });
});

test('missing 1d arrow', () => {
  const bundle = new DummyBundle(false);
  const index = new KeyIndex<Foo>(FOO);
  const a = new Vector1Arrow<Foo>(0, index);

  expect(a.get(bundle, 'foo1')).toEqual('');
  expect(a.get(bundle, 'foo2')).toEqual('');
  expect(a.get(bundle, 'quux' as Foo)).toEqual('');
  expect(a.mapping(bundle)).toEqual({});
});

test('2d arrow', () => {
  const bundle = new DummyBundle(true, true);
  const i1 = new KeyIndex<Foo>(FOO);
  const i2 = new KeyIndex<Bar>(BAR);
  const a = new Vector2Arrow<Foo, Bar>(0, i1, i2);

  expect(a.exists(bundle)).toEqual(true);
  expect(a.get(bundle, 'foo1', 'bar1')).toEqual('1');
  expect(a.get(bundle, 'foo1', 'bar2')).toEqual('2');
  expect(a.get(bundle, 'foo1', 'bar3')).toEqual('3');
  expect(a.get(bundle, 'foo2', 'bar1')).toEqual('4');
  expect(a.get(bundle, 'foo2', 'bar2')).toEqual('5');
  expect(a.get(bundle, 'foo2', 'bar3')).toEqual('6');
  expect(a.get(bundle, 'foo2', 'quux' as Bar)).toEqual('');
  expect(a.get(bundle, 'quux' as Foo, 'bar1')).toEqual('');
  expect(a.get(bundle, 'quux' as Foo, 'quux' as Bar)).toEqual('');
  expect(a.mapping(bundle)).toEqual({
    foo1: { bar1: '1', bar2: '2', bar3: '3' },
    foo2: { bar1: '4', bar2: '5', bar3: '6'}
  });
});

test('missing 2d arrow', () => {
  const bundle = new DummyBundle(false);
  const i1 = new KeyIndex<Foo>(FOO);
  const i2 = new KeyIndex<Bar>(BAR);
  const a = new Vector2Arrow<Foo, Bar>(0, i1, i2);

  expect(a.get(bundle, 'foo1', 'bar1')).toEqual('');
  expect(a.get(bundle, 'foo1', 'bar2')).toEqual('');
  expect(a.get(bundle, 'foo1', 'bar3')).toEqual('');
  expect(a.get(bundle, 'foo2', 'bar1')).toEqual('');
  expect(a.get(bundle, 'foo2', 'bar2')).toEqual('');
  expect(a.get(bundle, 'foo2', 'bar3')).toEqual('');
  expect(a.get(bundle, 'foo2', 'quux' as Bar)).toEqual('');
  expect(a.get(bundle, 'quux' as Foo, 'bar1')).toEqual('');
  expect(a.get(bundle, 'quux' as Foo, 'quux' as Bar)).toEqual('');
  expect(a.mapping(bundle)).toEqual({});
});
