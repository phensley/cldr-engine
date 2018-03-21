import { getCLDR, loader, asyncLoader } from './helpers';

test('loaders', () => {
  const cldr = getCLDR();
  const engine = cldr.get('en');

  // TODO:
  // expect(engine.Gregorian.getMonth('3')).toEqual('March');

  expect(() => cldr.get('xx')).toThrowError();

  expect(engine.General.characterOrder()).toEqual('ltr');
  expect(engine.General.lineOrder()).toEqual('ttb');

  expect(cldr.getAsync('en')).resolves.toEqual(engine);
  expect(cldr.info()).toEqual('packs loaded: 1');

  cldr.get('es');
  expect(cldr.info()).toEqual('packs loaded: 2');
  cldr.get('es');
  expect(cldr.info()).toEqual('packs loaded: 2');

  expect(cldr.getAsync('xx')).rejects.toContain('no such file');
  expect(cldr.getAsync('de')).resolves.toBeTruthy();
});
