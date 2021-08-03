import { buildConfig, generalApi } from '../_helpers';

test('custom language display names', () => {
  const cfg = buildConfig({ 'language-id': ['en'] });
  const api = generalApi('en', cfg);
  let s: string;

  s = api.getLanguageDisplayName('en');
  expect(s).toEqual('English');

  s = api.getLanguageDisplayName('fr');
  expect(s).toEqual('');
});

test('custom script display names', () => {
  const cfg = buildConfig({ 'script-id': ['Latn'] });
  const api = generalApi('en', cfg);
  let s: string;

  s = api.getScriptDisplayName('Latn');
  expect(s).toEqual('Latin');

  s = api.getLanguageDisplayName('Arab');
  expect(s).toEqual('');
});

test('custom region display names', () => {
  const cfg = buildConfig({ 'region-id': ['001', 'US'] });
  const api = generalApi('en', cfg);
  let s: string;

  s = api.getRegionDisplayName('001');
  expect(s).toEqual('world');

  s = api.getRegionDisplayName('US');
  expect(s).toEqual('United States');

  s = api.getRegionDisplayName('FR');
  expect(s).toEqual('');
});
