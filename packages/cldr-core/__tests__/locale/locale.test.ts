import { LanguageTag } from '../../src/locale';

test('basics', () => {
  const tag = new LanguageTag('en', undefined, 'US');

  expect(tag.language()).toEqual('en');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('US');
  expect(tag.variant()).toEqual('');
  expect(tag.extensions()).toEqual([]);
  expect(tag.privateUse()).toEqual('');

  expect(tag.compact()).toEqual('en-US');
  expect(tag.expanded()).toEqual('en-Zzzz-US');
});

test('defaults', () => {
  let tag = new LanguageTag();
  expect(tag.compact()).toEqual('und');
  expect(tag.compact()).toEqual(tag.toString());
  expect(tag.language()).toEqual('und');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('ZZ');

  tag = new LanguageTag('und', 'Zzzz', 'ZZ');
  expect(tag.compact()).toEqual('und');
  expect(tag.compact()).toEqual(tag.toString());
  expect(tag.language()).toEqual('und');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('ZZ');

  tag = new LanguageTag('root', undefined, 'US');
  expect(tag.compact()).toEqual('und-US');
  expect(tag.compact()).toEqual(tag.toString());
  expect(tag.language()).toEqual('und');
  expect(tag.script()).toEqual('Zzzz');
  expect(tag.region()).toEqual('US');
});