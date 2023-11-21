import { PluralType, PrimitiveBundle } from '@phensley/cldr-types';
import {
  DigitsArrowImpl,
  FieldArrowImpl,
  KeyIndexImpl,
  PluralIndex,
  ScopeArrowImpl,
  VectorArrowImpl,
} from '../../../src';

type Foo = 'foo1' | 'foo2';
type Bar = 'bar1' | 'bar2' | 'bar3';

const FOO: Foo[] = ['foo1', 'foo2'];
const BAR: Bar[] = ['bar1', 'bar2', 'bar3'];

const PluralDigitValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

class DummyBundle implements PrimitiveBundle {
  constructor(
    readonly exists: boolean,
    readonly header: boolean = true,
  ) {}

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
    return this.exists ? offset.toString() : '';
  }
}

class EmptyBundle implements PrimitiveBundle {
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
    return offset === 0 ? 'E' : '';
  }
}

test('field arrow', () => {
  const bundle = new DummyBundle(true);

  const a = new FieldArrowImpl(1);
  expect(a.get(bundle)).toEqual('1');

  const b = new FieldArrowImpl(123);
  expect(b.get(bundle)).toEqual('123');
});

test('digits arrow', () => {
  const bundle = new DummyBundle(true, false);
  const a = new DigitsArrowImpl(0, PluralIndex, PluralDigitValues);

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
  [k in Foo]: any;
};

test('scope arrow', () => {
  const map: FooScope = { foo1: { bar: 1 }, foo2: { bar: 2 } };
  const a = new ScopeArrowImpl(map);
  expect(a.get('foo1')).toEqual({ bar: 1 });
  expect(a.get('foo2')).toEqual({ bar: 2 });
  expect(a.get('bar' as any as Foo)).toBe(undefined);
});

test('1d arrow', () => {
  const bundle = new DummyBundle(true);
  const index = new KeyIndexImpl<Foo>(FOO);
  const a = new VectorArrowImpl(0, [index]);

  expect(a.get(bundle, 'foo1')).toEqual('1');
  expect(a.get(bundle, 'foo2')).toEqual('2');
  expect(a.get(bundle, 'quux' as Foo)).toEqual('');
  expect(a.mapping(bundle)).toEqual({
    foo1: '1',
    foo2: '2',
  });
});

test('1d arrow empty', () => {
  const bundle = new EmptyBundle();
  const index = new KeyIndexImpl<Foo>(FOO);
  const a = new VectorArrowImpl(0, [index]);

  expect(a.get(bundle, 'foo1')).toEqual('');
  expect(a.mapping(bundle)).toEqual({});
});

test('missing 1d arrow', () => {
  let bundle: PrimitiveBundle;
  const index = new KeyIndexImpl<Foo>(FOO);
  const a = new VectorArrowImpl(0, [index]);

  bundle = new DummyBundle(false);

  expect(a.exists(bundle)).toEqual(false);
  expect(a.get(bundle, 'foo1')).toEqual('');
  expect(a.get(bundle, 'foo2')).toEqual('');
  expect(a.get(bundle, 'quux' as Foo)).toEqual('');
  expect(a.mapping(bundle)).toEqual({});

  bundle = new EmptyBundle();
  expect(a.exists(bundle)).toEqual(true);
  expect(a.get(bundle, 'foo1')).toEqual('');
  expect(a.get(bundle, 'foo2')).toEqual('');
  expect(a.get(bundle, 'quux' as Foo)).toEqual('');
  expect(a.mapping(bundle)).toEqual({});
});

test('2d arrow', () => {
  const bundle = new DummyBundle(true, true);
  const i1 = new KeyIndexImpl<Foo>(FOO);
  const i2 = new KeyIndexImpl<Bar>(BAR);
  const a = new VectorArrowImpl(0, [i1, i2]);

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
    foo2: { bar1: '4', bar2: '5', bar3: '6' },
  });

  // invalid keys
  expect(a.get(bundle, 'xxxxx', 'yyyyy')).toEqual('');
  expect(a.get(bundle, 'xxxxx', 'yyyyy')).toEqual('');

  // invalid mixed with valid
  expect(a.get(bundle, ['xxxxx', 'foo2'], ['yyyyy', 'bar3'])).toEqual('6');
  expect(a.get(bundle, ['foo2', 'xxxxx'], ['bar3', 'yyyyy'])).toEqual('6');

  // invalid multiple
  expect(a.get(bundle, ['xxxxx', 'yyyyy'], ['xxxxx', 'yyyyy'])).toEqual('');
  expect(a.get(bundle, ['xxxxx', 'yyyyy'], ['xxxxx', 'yyyyy'])).toEqual('');

  // number of arguments don't match vector's dimension throws error
  expect(() => a.get(bundle, 'xxxxx')).toThrowError();
  expect(() => a.get(bundle, 'xxxxx')).toThrowError();
  expect(() => a.get(bundle, 'foo1', 'bar1', 'xxxxx')).toThrowError();
  expect(() => a.get(bundle, 'foo1', 'bar1', 'xxxxx')).toThrowError();
});

test('missing 2d arrow', () => {
  const i1 = new KeyIndexImpl<Foo>(FOO);
  const i2 = new KeyIndexImpl<Bar>(BAR);
  const a = new VectorArrowImpl(0, [i1, i2]);
  let bundle: PrimitiveBundle;

  bundle = new DummyBundle(false);
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

  bundle = new EmptyBundle();
  expect(a.exists(bundle)).toEqual(true);
  expect(a.get(bundle, 'foo1', 'bar1')).toEqual('');
  expect(a.mapping(bundle)).toEqual({
    foo1: {},
    foo2: {},
  });
});

test('valid 2d arrow', () => {
  const i1 = new KeyIndexImpl<Foo>(FOO);
  const i2 = new KeyIndexImpl<Bar>(BAR);
  const a = new VectorArrowImpl(0, [i1, i2]);
  expect(a.valid('foo1', 'bar1')).toEqual(true);
  expect(a.valid('quux' as Foo, 'bar1')).toEqual(false);
  expect(a.valid('foo1', 'quux' as Bar)).toEqual(false);
  expect(a.valid('quux' as Foo, 'quux' as Bar)).toEqual(false);

  // Fallbacks
  expect(a.valid(['quux', 'foo1'], ['quux', 'bar1'])).toEqual(true);
  expect(a.valid(['quux', 'quux'], ['bar1'])).toEqual(false);
  expect(a.valid(['foo1'], ['quux', 'quux'])).toEqual(false);
  expect(a.valid(['quux', 'quux'], ['quux', 'quux'])).toEqual(false);
});
