import { substituteRegionAliases, LanguageTagField as Tag } from '../src';
import { FastTag } from '../src/util';

test('region alias substitution', () => {
  const t: FastTag = [Tag.LANGUAGE, Tag.SCRIPT, Tag.REGION];

  substituteRegionAliases(t);
  expect(t[Tag.REGION]).toEqual(Tag.REGION);

  t[Tag.REGION] = 'ARG';
  substituteRegionAliases(t);
  expect(t[Tag.REGION]).toEqual('AR');

  t[Tag.REGION] = 'US';
  substituteRegionAliases(t);
  expect(t[Tag.REGION]).toEqual('US');
});
