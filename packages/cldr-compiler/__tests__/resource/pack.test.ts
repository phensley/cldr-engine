import { ResourcePack } from '../../src/resource/pack';
import { LanguageResolver } from '@phensley/cldr-core';

const parseLocale = (id: string) => ({ id, tag: LanguageResolver.resolve(id) });

const EN_US = parseLocale('en');
const EN_CA = parseLocale('en-CA');
const EN_GB = parseLocale('en-GB');
const EN_DE = parseLocale('en-DE');

test('creation', () => {
  const pack = new ResourcePack('en', '0.1.0', '32.0.1');
  const checksum = '12345';

  pack.push(EN_US);
  pack.add('foo');
  pack.add('bar');
  pack.add('baz');
  pack.add('quux');

  pack.push(EN_GB);
  pack.add('foo');
  pack.add('bar.gb');
  pack.add('baz');
  pack.add('quux.gb');

  pack.push(EN_CA);
  pack.add('foo');
  pack.add('bar');
  pack.add('baz');
  pack.add('quux.ca');

  pack.push(EN_DE);
  pack.add('foo.de');
  pack.add('bar.de');
  pack.add('baz');
  pack.add('quux.de');

  const raw = pack.render(checksum);
  const p = JSON.parse(raw);
  expect(p.language).toEqual('en');
  expect(p.version).toEqual('0.1.0');
  expect(p.cldr).toEqual('32.0.1');

  expect(Object.keys(p.scripts)).toEqual(['Latn']);

  const { strings, exceptions, regions } = p.scripts.Latn;
  expect(strings).toEqual('foo_bar_baz_quux');
  expect(exceptions).toEqual('bar.gb_quux.gb_quux.ca_foo.de_bar.de_quux.de');

  // US is the base since it has the minimum distance to the other regions.
  expect(regions.US).toEqual('');

  // GB exception index:  {1: 0, 3: 1}
  expect(regions.GB).toEqual('1 0 3 1');

  // CA exception index: {3: 2}
  expect(regions.CA).toEqual('3 2');

  // DE exception index: {0: 3, 1: 4, 3: 5}
  expect(regions.DE).toEqual('0 3 1 4 3 5');
});
