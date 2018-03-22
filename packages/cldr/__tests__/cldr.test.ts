import { getCLDR, loader, asyncLoader } from './helpers';

test('loaders', () => {
  const cldr = getCLDR();
  const cldrapi = cldr.get('en');

  expect(() => cldr.get('xx')).toThrowError();

  expect(cldrapi.General.characterOrder()).toEqual('ltr');
  expect(cldrapi.General.lineOrder()).toEqual('ttb');

  // TODO:
  // expect(api.Calendars.getMonth('3')).toEqual('March');

  expect(cldr.getAsync('en')).resolves.toEqual(cldrapi);
  expect(cldr.info()).toEqual('packs loaded: 1');

  cldr.get('es');
  expect(cldr.info()).toEqual('packs loaded: 2');
  cldr.get('es');
  expect(cldr.info()).toEqual('packs loaded: 2');

  expect(cldr.getAsync('xx')).rejects.toContain('no such file');
  expect(cldr.getAsync('de')).resolves.toBeTruthy();
});
