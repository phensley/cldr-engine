import { CLDRFramework } from '../src';
import { getCLDR } from './helpers';
import { CurrencyFormatOptions, Quantity } from '@phensley/cldr-core';

const { parseLanguageTag, resolveLocale } = CLDRFramework;

test('init framework', () => {
  const framework = getCLDR();
  let api = framework.get('en');
  expect(framework.info()).toEqual('packs loaded: 1');

  expect(() => framework.get('xx')).toThrowError();

  expect(api.General.bundle().id()).toEqual('en-Latn-US');
  expect(api.General.locale().id).toEqual('en');
  expect(api.General.resolveLocale('zh').tag.expanded()).toEqual('zh-Hans-CN');

  expect(api.General.characterOrder()).toEqual('ltr');
  expect(api.General.lineOrder()).toEqual('ttb');

  expect(api.Calendars.months({ width: 'wide' })[3]).toEqual('March');

  let s: string;

  const ux = { date: 1109934428000, zoneId: 'America/New_York'};
  s = api.Calendars.formatDate(ux, { datetime: 'full' });
  s = api.Calendars.formatDate(ux, { datetime: 'full' });
  expect(s).toEqual('Friday, March 4, 2005 at 6:07:08 AM Eastern Standard Time');

  const currOpts: CurrencyFormatOptions = { style: 'short' };
  s = api.Numbers.formatCurrency('345678', 'USD', currOpts);
  s = api.Numbers.formatCurrency('345678', 'USD', currOpts);
  expect(s).toEqual('$346K');

  const qty: Quantity = { value: '17.69', unit: 'pound' };
  const unitOpts = { maximumFractionDigits: 1 };
  s = api.Units.formatQuantity(qty, unitOpts);
  s = api.Units.formatQuantity(qty, unitOpts);
  expect(s).toEqual('17.7 pounds');

  framework.get('es');
  expect(framework.info()).toEqual('packs loaded: 2');
  framework.get('es');
  expect(framework.info()).toEqual('packs loaded: 2');

  // Bundle with invalid region
  api = framework.get('ar-Arab-XX');
  expect(api.General.bundle().language()).toEqual('ar');
  expect(api.General.bundle().languageRegion()).toEqual('ar-EG');
  expect(api.General.bundle().languageScript()).toEqual('ar-Arab');

  // Bundle with invalid script
  api = framework.get('ar-Cyrl-SA');
  expect(api.General.bundle().language()).toEqual('ar');
  expect(api.General.bundle().languageRegion()).toEqual('ar-EG');
  expect(api.General.bundle().languageScript()).toEqual('ar-Arab');

  // Load with a locale object
  const l = resolveLocale('gu');
  api = framework.get(l);
  expect(api.General.bundle().language()).toEqual('gu');
});

test('parsing language tags', () => {
  let r = parseLanguageTag('und-Zzzz-BR');
  expect(r.compact()).toEqual('und-BR');

  r = parseLanguageTag('und');
  expect(r.compact()).toEqual('und');

  let l = resolveLocale('und-Zzzz-BR');
  expect(l.tag.compact()).toEqual('pt-Latn-BR');

  l = resolveLocale('und');
  expect(l.tag.compact()).toEqual('en-Latn-US');
});

test('enumerating locales', () => {
  const locales = CLDRFramework.availableLocales();
  expect(locales).toContainEqual(CLDRFramework.resolveLocale('en'));
});

test('accessing schema', () => {
  const framework = getCLDR();
  let api = framework.get('en');
  let bundle = api.General.bundle();

  let system = api.Schema.Numbers.numberSystem.get('latn');
  let symbols = system.symbols.mapping(bundle);
  expect(symbols.group).toEqual(',');
  expect(symbols.decimal).toEqual('.');

  let pattern = system.decimalFormats.standard.get(bundle);
  expect(pattern).toEqual('#,##0.###');

  api = framework.get('de');
  bundle = api.General.bundle();

  system = api.Schema.Numbers.numberSystem.get('latn');
  symbols = system.symbols.mapping(bundle);
  expect(symbols.group).toEqual('.');
  expect(symbols.decimal).toEqual(',');

  pattern = system.currencyFormats.standard.get(bundle);
  expect(pattern).toEqual('#,##0.00\u00a0\u00a4');
});

test('accessing internals', () => {
  const framework = getCLDR();
  const api = framework.get('en');

  const p = api.Internals.calendars.parseDatePattern('yyyy/MM/dd h:m:s');
  expect(p).toEqual([
    ['y', 4],
    '/',
    ['M', 2],
    '/',
    ['d', 2],
    ' ',
    ['h', 1],
    ':',
    ['m', 1],
    ':',
    ['s', 1]
  ]);
});

test('resolving locales', () => {
  let r = parseLanguageTag('und-Zzzz-US');
  let { id, tag } = resolveLocale(r);
  expect(id).toEqual('und-US');
  expect(tag.compact()).toEqual('en-Latn-US');

  r = parseLanguageTag('es');
  ({ id, tag } = resolveLocale(r));
  expect(id).toEqual('es');
  expect(tag.compact()).toEqual('es-Latn-ES');
});

test('async loader', () => {
  const framework = getCLDR();
  const en = framework.get('en');
  const es = framework.get('es');

  const path = ['bundle', '_id'];

  expect(framework.getAsync('en')).resolves.toEqual(en);
  expect(framework.getAsync('es')).resolves.toEqual(es);

  expect(framework.getAsync('xx')).rejects.toContain('no such file');

  expect(framework.getAsync('de')).resolves.toHaveProperty(path, 'de-Latn-DE');
  expect(framework.getAsync('zh-TW')).resolves.toHaveProperty(path, 'zh-Hant-TW');

  expect(framework.getAsync('de')).resolves.toHaveProperty(path, 'de-Latn-DE');
  expect(framework.getAsync('zh-TW')).resolves.toHaveProperty(path, 'zh-Hant-TW');

  const l = resolveLocale('gu');
  expect(framework.getAsync(l)).resolves.toHaveProperty(path, 'gu-Gujr-IN');
});

test('async await loader', async () => {
  const framework = getCLDR();
  const path = ['bundle', '_id'];

  const de = await framework.getAsync('de');
  expect(de).toHaveProperty(path, 'de-Latn-DE');

  const zh = await framework.getAsync('zh-TW');
  expect(zh).toHaveProperty(path, 'zh-Hant-TW');
});

test('loader errors', () => {
  const framework = new CLDRFramework({});
  expect(() => framework.get('en')).toThrowError();
  expect(() => framework.getAsync('en')).toThrowError();
});

test('version', () => {
  const version = CLDRFramework.version().split(/\./g);
  expect(version.length).toBeGreaterThanOrEqual(3);
});
