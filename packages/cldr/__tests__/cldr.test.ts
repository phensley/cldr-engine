import { getCLDR, loader, asyncLoader } from './helpers';

test('loaders', () => {
  const framework = getCLDR();
  const api = framework.get('en');

  expect(() => framework.get('xx')).toThrowError();

  expect(api.Locales.current().id).toEqual('en');
  expect(api.Locales.resolve('zh').tag.expanded()).toEqual('zh-Hans-CN');
  expect(api.Locales.bundle().id()).toEqual('en-Latn-US');

  expect(api.General.characterOrder()).toEqual('ltr');
  expect(api.General.lineOrder()).toEqual('ttb');

  // TODO:
  // expect(api.Calendars.getMonth('3')).toEqual('March');

  expect(framework.getAsync('en')).resolves.toEqual(api);
  expect(framework.info()).toEqual('packs loaded: 1');

  framework.get('es');
  expect(framework.info()).toEqual('packs loaded: 2');
  framework.get('es');
  expect(framework.info()).toEqual('packs loaded: 2');

  expect(framework.getAsync('xx')).rejects.toContain('no such file');
  expect(framework.getAsync('de')).resolves.toBeTruthy();
});
