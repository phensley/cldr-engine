import { parseLanguageTag, LanguageTag } from '@phensley/language-tag';
import { fastTag, returnTag } from '../src/resolver';

test('fast tag merging', () => {
  const f = fastTag(new LanguageTag(undefined, 'Latn', 'US'));

  const tag = parseLanguageTag('und-POSIX-u-ca-calendar');
  const r = returnTag(tag, f);
  expect(r.expanded()).toEqual('und-Latn-US-posix-u-ca-calendar');
});
