import {
  buildMessageMatcher,
  Matcher,
  Range,
} from '../src';

const build = (type: string, formatters: string[]) =>
  (input: string): [Matcher, Range] =>
    [buildMessageMatcher(input, formatters, type === 'sticky'), { s: 0, e: input.length }];

['sticky', 'substring'].forEach(type => {
  let m: Matcher;
  let r: Range;
  const matcher = build(type, ['foo', 'bar']);

  test(`${type} builder`, () => {
    const input = 'abc foo';

    m = buildMessageMatcher(input, ['foo']);
    r = { s: 0, e: input.length };

    expect(m.arguments(r)).toEqual(['abc']);
    expect(m.spaces(r)).toEqual(true);
    expect(m.formatter(r)).toEqual('foo');
    expect(m.complete(r)).toEqual(true);

    m = buildMessageMatcher(input, ['foo'], type === 'sticky');
    r = { s: 0, e: input.length };

    expect(m.arguments(r)).toEqual(['abc']);
    expect(m.spaces(r)).toEqual(true);
    expect(m.formatter(r)).toEqual('foo');
    expect(m.complete(r)).toEqual(true);
  });

  test(`${type} spaces`, () => {
    [m, r] = matcher(' \t , , \n \u00a0 , \ufeff \n ');
    m.spaces(r);
    expect(m.complete(r)).toEqual(true);

    [m, r] = matcher(' abc');
    expect(m.complete(r)).toEqual(false);
  });

  test(`${type} char`, () => {
    [m, r] = matcher('abc');
    expect(m.char(r)).toEqual('a');
    r.s++;
    expect(m.char(r)).toEqual('b');
    r.s++;
    expect(m.char(r)).toEqual('c');
    r.s++;
    expect(m.char(r)).toEqual(undefined);
  });

  test(`${type} arguments`, () => {
    [m, r] = matcher('  a ::foo 123');
    m.spaces(r);
    expect(m.arguments(r)).toEqual(['a']);

    [m, r] = matcher('a;b;c  d;e;f');
    expect(m.arguments(r)).toEqual(['a', 'b', 'c']);

    [m, r] = matcher('::quux');
    expect(m.arguments(r)).toEqual(undefined);

    [m, r] = matcher('abc;::quux');
    expect(m.arguments(r)).toEqual(['abc']);
  });

  test(`${type} identifier`, () => {
    [m, r] = matcher('::');
    expect(m.identifier(r)).toEqual(undefined);

    [m, r] = matcher(';;');
    expect(m.identifier(r)).toEqual(undefined);
  });

  test(`${type} formatters`, () => {
    [m, r] = matcher('{0 foo a b c}');

    r.s = 2;
    expect(m.formatter(r)).toEqual(undefined);

    r.s = 3;
    expect(m.formatter(r)).toEqual('foo');

    r.s = 4;
    expect(m.formatter(r)).toEqual(undefined);

    [m, r] = matcher('{0 ::}');
    r.s = 3;
    expect(m.formatter(r)).toEqual(undefined);
  });

  test(`${type} options`, () => {
    [m, r] = matcher('  a ::foo 123  , .bar } .quux');
    m.spaces(r);

    expect(m.options(r)).toEqual(['a', '::foo', '123', '.bar']);
  });

  test(`${type} plural offset`, () => {
    [m, r] = matcher('offset:12');
    expect(m.pluralOffset(r)).toEqual(12);

    [m, r] = matcher('offset:-infinity');
    expect(m.pluralOffset(r)).toEqual(0);

    [m, r] = matcher('offset:ab');
    expect(m.pluralOffset(r)).toEqual(0);

    [m, r] = matcher('xoffset:ab');
    expect(m.pluralOffset(r)).toEqual(0);
  });

  test(`${type} plural choice`, () => {
    [m, r] = matcher('=2');
    expect(m.pluralChoice(r)).toEqual('=2');

    [m, r] = matcher('two');
    expect(m.pluralChoice(r)).toEqual('two');

    [m, r] = matcher('many');
    expect(m.pluralChoice(r)).toEqual('many');

    [m, r] = matcher('xyz');
    expect(m.pluralChoice(r)).toEqual(undefined);
  });
});
