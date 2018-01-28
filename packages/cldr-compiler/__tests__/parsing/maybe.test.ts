import { just, nothing, Nothing, Just } from '../../src/parsing';

test('just', () => {
  expect(just('hello')).toEqual(new Just('hello'));
  expect(just(123)).toEqual(just(123));
  expect(just(123).get()).toEqual(123);
  expect(just(123).isJust()).toEqual(true);
  expect(just('hello').isNothing()).toEqual(false);
});

test('nothing', () => {
  expect(nothing).toEqual(new Nothing<string>());
  expect(nothing.isJust()).toEqual(false);
  expect(nothing.isNothing()).toEqual(true);
  expect(() => nothing.get()).toThrowError();
});
