import { LanguageTag } from '../../src/locale';

test('basics', () => {
  let tag = new LanguageTag('', '', '', '');
  expect(tag.compact()).toEqual('und');

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
