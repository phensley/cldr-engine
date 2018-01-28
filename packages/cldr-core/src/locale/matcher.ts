import { LanguageTag, Locale } from './locale';
import { getDistance, DEFAULT_THRESHOLD, MAX_DISTANCE } from './distance';
import { parseLanguageTag } from './parser';
import { LanguageResolver } from './resolver';
import { paradigmLocales } from './autogen.distance';

// Space and comma-separated bundle ids.
const TAG_SEP = /[,\s]+/g;

const numberCmp = (a: number, b: number) => a === b ? 0 : a < b ? -1 : 1;

const UNDEFINED = new LanguageTag();

// Mapping of paradigm locales to their relative position.
type ParadigmMap = { [x: string]: number };
const paradigmLocaleMap: ParadigmMap = paradigmLocales.reduce((o: ParadigmMap, k: string, i: number) => {
  const compact = LanguageResolver.resolve(k).compact();
  o[compact] = i;
  return o;
}, {});

class Entry implements Locale {
  readonly compact: string;
  constructor(readonly id: string, readonly tag: LanguageTag) {
    this.compact = tag.compact();
  }
}

/**
 * Flatten and split the string or array into a list of matcher entries.
 */
const parse = (locales: string | string[]): Entry[] => {
  let raw: string[];
  if (typeof locales === 'string') {
    raw = locales.split(TAG_SEP);
  } else {
    raw = locales.reduce((a: string[], e: string): string[] => {
      const tmp = e.split(TAG_SEP);
      return a.concat(tmp);
    }, []);
  }

  const result: Entry[] = [];
  const len = raw.length;
  for (let i = 0; i < len; i++) {
    const id = raw[i].trim();
    const tag = parseLanguageTag(id);

    // Preserve 'und' undefined locale. If we resolve it, adding
    // likely subtags will expand it to 'en-Latn-US'.
    if (tag.hasLanguage() || tag.hasScript() || tag.hasRegion()) {
      result.push(new Entry(id, LanguageResolver.resolve(tag)));
    } else {
      result.push(new Entry(id, UNDEFINED));
    }
  }
  return result;
};

/**
 * A result returned by the LanguageMatcher.
 */
export class LanguageMatch {
  constructor(readonly locale: Locale, readonly distance: number) {}
}

/**
 * Given a list of supported locales, and a list of a user's desired locales
 * (sorted in the order of preference, descending), returns the supported
 * locale closest to the user preference. The first locale in the list will
 * be used as the default. The default will be selected if no match is within
 * the distance threshold.
 *
 * Implementation of CLDR enhanced language matching:
 * http://www.unicode.org/reports/tr35/tr35.html#EnhancedLanguageMatching
 */
export class LocaleMatcher {

  private supported: Entry[];
  private count: number;
  private default: Entry;
  private exactMap: { [x: string]: Entry[] } = {};

  constructor(supportedLocales: string | string[]) {
    this.supported = parse(supportedLocales);
    this.count = this.supported.length;

    // The first locale in the list is used as the default.
    this.default = this.supported[0];

    this.supported.sort((a: Entry, b: Entry): number => {
      // Keep default tag at the front.
      if (a.tag === this.default.tag) {
        return -1;
      }
      if (b.tag === this.default.tag) {
        return 1;
      }

      // Sort all paradigm locales before non-paradigms.
      const pa = paradigmLocaleMap[a.compact];
      const pb = paradigmLocaleMap[b.compact];
      if (pa !== undefined) {
        return pb === undefined ? -1 : numberCmp(pa, pb);
      } else if (pb !== undefined) {
        return 1;
      }

      // All other locales stay in their relative positions.
      return 0;
    });

    // Wire up a map for quick lookups of exact matches. These have a
    // distance of 0 and will short-circuit the matching loop.
    this.supported.forEach(locale => {
      const key = locale.compact;
      let bundles = this.exactMap[key];
      if (bundles === undefined) {
        bundles = [locale];
        this.exactMap[key] = bundles;
      } else {
        bundles.push(locale);
      }
    });
  }

  /**
   * Find the desired locale that is the closed match to a supported locale, within
   * the given threshold. Any matches whose distance is >= threshold will be treated
   * as having maximum distance.
   */
  match(desiredLocales: string | string[], threshold: number = DEFAULT_THRESHOLD): LanguageMatch {
    const desired = parse(desiredLocales);
    let bestDistance = MAX_DISTANCE;
    let bestMatch = undefined;
    for (let i = 0; i < desired.length; i++) {
      const current = desired[i];
      const exact = this.exactMap[current.compact];
      if (exact !== undefined) {
        return new LanguageMatch({ id: exact[0].id, tag: exact[0].tag }, 0);
      }

      for (let j = 0; j < this.count; j++) {
        const supported = this.supported[j];
        const distance = getDistance(current.tag, supported.tag, threshold);
        if (bestDistance === undefined || distance < bestDistance) {
          bestDistance = distance;
          bestMatch = supported;
        }
      }
    }
    return bestMatch === undefined ?
      new LanguageMatch({ id: this.default.id, tag: this.default.tag }, MAX_DISTANCE) :
      new LanguageMatch({ id: bestMatch.id, tag: bestMatch.tag }, bestDistance);
  }

}
