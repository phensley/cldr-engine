import { getCLDR } from './helpers';
import { LocaleMatcher } from '../src';

test('loaders', () => {
  const cldr = getCLDR();
  const engine = cldr.get('en');
  expect(engine.Gregorian.getMonth('3')).toEqual('March');
  expect(() => cldr.get('xx')).toThrowError();

  expect(cldr.getAsync('en')).resolves.toEqual(engine);
  expect(cldr.info()).toEqual('packs loaded: 1');

  cldr.get('es');
  expect(cldr.info()).toEqual('packs loaded: 2');
  cldr.get('es');
  expect(cldr.info()).toEqual('packs loaded: 2');

  expect(cldr.getAsync('xx')).rejects.toContain('no such file');
  expect(cldr.getAsync('de')).resolves.toBeTruthy();
});

test('locale matcher', () => {
  const cldr = getCLDR();
  const matcher = cldr.getLocaleMatcher('en, es-419, zh, en-GB, pt, fr');
  expect(matcher.match('en-VI').locale.id).toEqual('en');
  expect(matcher.match('en-PR').locale.id).toEqual('en');
  expect(matcher.match('en-CA').locale.id).toEqual('en-GB');
  expect(matcher.match('en-ZA').locale.id).toEqual('en-GB');
  expect(matcher.match('en-AU').locale.id).toEqual('en-GB');
  expect(matcher.match('pt-BR').locale.id).toEqual('pt');
  expect(matcher.match('fr-CA').locale.id).toEqual('fr');
  expect(matcher.match('zh-TW').locale.id).toEqual('zh');
  expect(matcher.match('ja').locale.id).toEqual('en');
});
