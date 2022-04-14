import { LanguageResolver } from '@phensley/locale';
import { getDistance } from '../src/distance';
import { loadDistanceCases, loadDistanceCasesNew } from './util';

const { resolve } = LanguageResolver;

const distance = (a: string, b: string) => getDistance(resolve(a), resolve(b));

loadDistanceCases().forEach((c) => {
  test(`locale-distance-cases.txt - line ${c.lineno}`, () => {
    expect(distance(c.desired, c.supported)).toEqual(c.distanceDS);
    expect(distance(c.supported, c.desired)).toEqual(c.distanceSD);
  });
});

loadDistanceCasesNew().forEach((c) => {
  test(`locale-distance-cases-new.txt - line ${c.lineno}`, () => {
    expect(distance(c.desired, c.supported)).toEqual(c.distanceDS);
    expect(distance(c.supported, c.desired)).toEqual(c.distanceSD);
  });
});
