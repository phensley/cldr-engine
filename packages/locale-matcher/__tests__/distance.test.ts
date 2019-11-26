import { LanguageResolver } from '@phensley/locale';
import { getDistance } from '../src/distance';
import { loadDistanceCases } from './util';

const { resolve } = LanguageResolver;

const distance = (a: string, b: string) => getDistance(resolve(a), resolve(b));

loadDistanceCases().forEach(c => {
  test(`locale-distance-cases.txt - line ${c.lineno}`, () => {
    expect(distance(c.desired, c.supported)).toEqual(c.distanceDS);
  });
});
