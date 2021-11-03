import { LanguageResolver } from '@phensley/locale';
import { getDistance } from '../src/distance';
import { loadDistanceCases } from './util';

const { resolve } = LanguageResolver;

const distance = (a: string, b: string) => getDistance(resolve(a), resolve(b));

loadDistanceCases().forEach((c) => {
  test(`locale-distance-cases.txt - line ${c.lineno}`, () => {
    expect(distance(c.desired, c.supported)).toEqual(c.distanceDS);
    expect(distance(c.supported, c.desired)).toEqual(c.distanceSD);
  });
});

/**

TODO: these additional test cases come from ICU which implements additional
matching logic not described in the TR35 specification:
https://www.unicode.org/reports/tr35/tr35-63/tr35.html#EnhancedLanguageMatching
https://github.com/unicode-org/icu/blob/main/icu4j/main/classes/core/src/com/ibm/icu/impl/locale/LocaleDistance.java

Uncomment when matching logic is modified so that these all pass.

loadDistanceCasesNew().forEach((c) => {
  test(`locale-distance-cases-new.txt - line ${c.lineno}`, () => {
    expect(distance(c.desired, c.supported)).toEqual(c.distanceDS);
    expect(distance(c.supported, c.desired)).toEqual(c.distanceSD);
  });
});
*/
