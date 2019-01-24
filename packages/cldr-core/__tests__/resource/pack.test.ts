import { loadPack } from '../_helpers';
import { Pack } from '../../src/resource/pack';
import { LanguageTag } from '../../src';

test('error bad format', () => {
  expect(() => new Pack({})).toThrowError('Severe error');
  expect(() => new Pack('')).toThrowError('JSON input');
  expect(() => new Pack('{}')).toThrowError('Severe error');
});

test('resolve tag', () => {
  const pack = loadPack('en');
  const b = pack.get(new LanguageTag(undefined));
  expect(b.id()).toEqual('en-Latn-US');
});
