import { mphashCreate } from '../../cldr-compiler/src/mphash';
import { mplookup } from '../src';
import { RandString } from './rng';

const CHARS = 'abcdefghijklmnopqrstuvwxyz';

test('mp hash', () => {
  const keys = ['foo', 'bar', 'baz'];
  const o: any = {};
  keys.forEach(k => o[k] = k.toUpperCase());

  const t = mphashCreate(o);

  expect(mplookup(t, 'foo')).toEqual('FOO');
  expect(mplookup(t, 'bar')).toEqual('BAR');
  expect(mplookup(t, 'baz')).toEqual('BAZ');

  // elements not present will map to something
  expect(mplookup(t, 'quux')).toEqual('BAZ');
  expect(mplookup(t, 'FOOBAR')).toEqual('FOO');
});

test('random', () => {
  const rng = new RandString('cldr-engine', CHARS);

  // Use random key widths from 1 to 14
  for (let w = 1; w < 15; w++) {
    // Build tables containing between 3 and 200 keys
    for (let i = 3; i < 200; i += 7) {

      // Generate random keys and build an object having those
      // keys with uppercase values.
      const o: any = {};
      const keys: string[] = [];
      for (let j = 1; j < i; j++) {
        const s = rng.rand(w);
        o[s] = s.toUpperCase();
        keys.push(s);
      }

      // Build an mphash table and lookup every key
      const t = mphashCreate(o);
      for (let j = 0; j < keys.length; j++) {
        const k = keys[j];
        const r = mplookup(t, k);
        expect(r).toEqual(k.toUpperCase());
      }
    }
  }
});
