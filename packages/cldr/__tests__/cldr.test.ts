import { getCLDR, loader, asyncLoader } from './helpers';

test('init framework', () => {
  const framework = getCLDR();
  let api = framework.get('en');
  expect(framework.info()).toEqual('packs loaded: 1');

  expect(() => framework.get('xx')).toThrowError();

  expect(api.Locales.current().id).toEqual('en');
  expect(api.Locales.resolve('zh').tag.expanded()).toEqual('zh-Hans-CN');
  expect(api.Locales.bundle().id()).toEqual('en-Latn-US');

  expect(api.General.characterOrder()).toEqual('ltr');
  expect(api.General.lineOrder()).toEqual('ttb');

  // TODO:
  // expect(api.Calendars.getMonth('3')).toEqual('March');

  framework.get('es');
  expect(framework.info()).toEqual('packs loaded: 2');
  framework.get('es');
  expect(framework.info()).toEqual('packs loaded: 2');

  // Bundle with invalid region
  api = framework.get('ar-Arab-XX');
  expect(api.Locales.bundle().language()).toEqual('ar');
  expect(api.Locales.bundle().languageRegion()).toEqual('ar-EG');
  expect(api.Locales.bundle().languageScript()).toEqual('ar-Arab');

  // Bundle with invalid script
  api = framework.get('ar-Cyrl-SA');
  expect(api.Locales.bundle().language()).toEqual('ar');
  expect(api.Locales.bundle().languageRegion()).toEqual('ar-EG');
  expect(api.Locales.bundle().languageScript()).toEqual('ar-Arab');
});

test('async loader', () => {
  const framework = getCLDR();
  const en = framework.get('en');
  const es = framework.get('es');

  expect(framework.getAsync('en')).resolves.toEqual(en);
  expect(framework.getAsync('es')).resolves.toEqual(es);

  expect(framework.getAsync('xx')).rejects.toContain('no such file');

  expect(framework.getAsync('de')).resolves.toBeTruthy();
  expect(framework.getAsync('zh-TW')).resolves.toBeTruthy();
});
