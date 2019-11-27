import { LanguageTag } from '../src';

test('basics', () => {
  let tag: LanguageTag;

  tag = new LanguageTag();
  expect(tag.compact()).toEqual('und');
  expect(tag.expanded()).toEqual('und-Zzzz-ZZ');

  tag = new LanguageTag('root');
  expect(tag.compact()).toEqual('und');
  expect(tag.toString()).toEqual('und');

  tag = new LanguageTag('', '', '', '');
  expect(tag.compact()).toEqual('und');

  tag = new LanguageTag('', '', '', 'VARIANT');
  expect(tag.compact()).toEqual('und-variant');
  expect(tag.toString()).toEqual('und-variant');
  expect(tag.expanded()).toEqual('und-Zzzz-ZZ-variant');
  // 2nd call to ensure cached value is returned
  expect(tag.expanded()).toEqual('und-Zzzz-ZZ-variant');

  tag = new LanguageTag('en', '', '', '', {});
  expect(tag.compact()).toEqual('en');

  tag = new LanguageTag('en', '', '', '', {'u': ['nu-latn']});
  expect(tag.compact()).toEqual('en-u-nu-latn');

  tag = new LanguageTag('en', '', '', '', {'u': ['nu-latn', 'ca-gregory']});
  expect(tag.compact()).toEqual('en-u-nu-latn-ca-gregory');

  const unkarray = undefined as unknown as string[];
  tag = new LanguageTag('en', '', '', '', {'u': unkarray });
  expect(tag.compact()).toEqual('en');

  // NOTE: constructing language tags directly allows creation
  // of malformed tags. validation and normalization is done in
  // the language tag parser, not the constructor.
  tag = new LanguageTag('en', '', '', '', undefined, 'q');
  expect(tag.compact()).toEqual('en-q');
});

test('properties', () => {
  let tag: LanguageTag;

  tag = new LanguageTag();
  expect(tag.language()).toEqual('und');
  expect(tag.hasLanguage()).toEqual(false);

  expect(tag.script()).toEqual('Zzzz');
  expect(tag.hasScript()).toEqual(false);

  expect(tag.region()).toEqual('ZZ');
  expect(tag.hasRegion()).toEqual(false);

  expect(tag.variant()).toEqual('');
  expect(tag.extensions()).toEqual({});
  expect(tag.extensionSubtags('u')).toEqual([]);
  expect(tag.privateUse()).toEqual('');

  tag = new LanguageTag('en', 'Latn', 'US', 'VARIANT', { u: ['nu-latn', 'ca-gregory'] }, 'x-private');
  expect(tag.expanded()).toEqual('en-Latn-US-variant-u-nu-latn-ca-gregory-x-private');
  expect(tag.language()).toEqual('en');
  expect(tag.script()).toEqual('Latn');
  expect(tag.region()).toEqual('US');
  expect(tag.variant()).toEqual('variant');
  expect(tag.extensionSubtags('u')).toEqual(['nu-latn', 'ca-gregory']);
  expect(tag.privateUse()).toEqual('x-private');
});
