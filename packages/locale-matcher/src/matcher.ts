import { parseLanguageTag, LanguageTag } from '@phensley/language-tag';
import { LanguageResolver, Locale } from '@phensley/locale';

import { getDistance, DEFAULT_THRESHOLD, MAX_DISTANCE } from './distance';
import { paradigmLocales } from './autogen.distance';

// Space and comma-separated bundle ids.
const TAG_SEP = /[,\s]+/g;

const U = undefined;

const numberCmp = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);

class Entry implements Locale {
  readonly compact: string;
  constructor(readonly id: string, readonly tag: LanguageTag) {
    this.compact = tag.compact();
  }
}

type LangTag = Locale | LanguageTag | string;

/**
 * Flatten and split the string or array into a list of matcher entries.
 *
 * Visible for testing.
 */
export const parse = (locales: string | (Locale | LangTag)[] = [], options: LocaleMatcherOptions = {}): Entry[] => {
  let raw: LangTag[];
  if (typeof locales === 'string') {
    raw = locales.split(TAG_SEP);
  } else {
    raw = locales.reduce((a: LangTag[], e: Locale | LanguageTag | string): LangTag[] => {
      if (typeof e === 'string') {
        const tmp = e.split(TAG_SEP);
        return a.concat(tmp);
      }
      if ((e as Locale).tag instanceof LanguageTag) {
        a.push(e as Locale);
      } else if (e instanceof LanguageTag) {
        a.push(e);
      }
      return a;
    }, [] as LangTag[]);
  }

  const resolve = options.resolve !== false;
  const result: Entry[] = [];
  const len = raw.length;
  for (let i = 0; i < len; i++) {
    const e = raw[i];
    let id: string;
    let tag: LanguageTag;
    if (e instanceof LanguageTag) {
      tag = e;
      id = tag.compact();
    } else if (typeof e === 'string') {
      id = e.trim();
      tag = parseLanguageTag(id);
    } else {
      // Have a full Locale object, so optionally substitute aliases and add it
      tag = e.tag;
      id = e.id;
      result.push(new Entry(e.id, resolve ? LanguageResolver.substituteAliases(e.tag) : e.tag));
      continue;
    }

    // This code preserves the 'und' undefined locale. If we resolve it, adding
    // likely subtags will expand it to 'en-Latn-US'.

    const l = tag.hasLanguage();
    const s = tag.hasScript();
    const r = tag.hasRegion();

    if (l && s && r) {
      // If all subtags are present, substitute aliases
      result.push(new Entry(id, resolve ? LanguageResolver.substituteAliases(tag) : tag));
    } else if (l || s || r) {
      // If at least one subtag is present, resolve
      result.push(new Entry(id, resolve ? LanguageResolver.resolve(tag) : tag));
    } else {
      // Preserve undefined core fields, but include input's extensions
      result.push(
        new Entry(id, new LanguageTag(undefined, undefined, undefined, undefined, tag.extensions(), tag.privateUse())),
      );
    }
  }
  return result;
};

/**
 * A result returned by the LocaleMatcher.
 *
 * @public
 */
export interface LocaleMatch {
  /**
   * The locale that was matched.
   */
  locale: Locale;

  /**
   * Distance of the match from the desired locale.
   */
  distance: number;
}

/**
 * Options for the LocaleMatcher.
 *
 * @public
 */
export interface LocaleMatcherOptions {
  /**
   * Resolve language tags. (default true)
   */
  resolve?: boolean;
}

/**
 * Sort the supported locale entries. The result will have the following order:
 *
 *  First: default locale
 *   Next: all paradigm locales
 *   Last: all other locales
 *
 * Visible for testing.
 */
export const sortEntries =
  (d: Entry) =>
  (a: Entry, b: Entry): number => {
    // Check if entry is our default tag, to keep it at the front of the array.
    if (a.tag === d.tag) {
      return -1;
    }
    if (b.tag === d.tag) {
      return 1;
    }

    // Sort all paradigm locales before non-paradigms.
    const pa = paradigmLocales[a.compact];
    const pb = paradigmLocales[b.compact];
    if (pa !== undefined) {
      return pb === U ? -1 : numberCmp(pa, pb);
    } else if (pb !== undefined) {
      return 1;
    }

    // All other locales stay in their relative positions.
    return 0;
  };

/**
 * Given a list of supported locales, and a list of a user's desired locales
 * (sorted in the order of preference, descending), returns the supported
 * locale closest to the user preference. The first locale in the list will
 * be used as the default. The default will be selected if no match is within
 * the distance threshold.
 *
 * Implementation of CLDR enhanced language matching:
 * http://www.unicode.org/reports/tr35/tr35.html#EnhancedLanguageMatching
 *
 * @public
 */
export class LocaleMatcher {
  private supported: Entry[];
  private count: number;
  private default: Entry;
  private exactMap: { [x: string]: Entry[] } = {};

  constructor(supportedLocales: string | (Locale | LanguageTag | string)[], options: LocaleMatcherOptions = {}) {
    this.supported = parse(supportedLocales, options);
    this.count = this.supported.length;
    if (!this.count) {
      throw new Error('LocaleMatcher expects at least one supported locale');
    }

    // The first locale in the list is used as the default.
    this.default = this.supported[0];
    this.supported.sort(sortEntries(this.default));

    // Wire up a map for quick lookups of exact matches. These have a
    // distance of 0 and will short-circuit the matching loop.
    this.supported.forEach((locale) => {
      const key = locale.compact;
      let bundles = this.exactMap[key];
      if (bundles === U) {
        bundles = [locale];
        this.exactMap[key] = bundles;
      } else {
        bundles.push(locale);
      }
    });
  }

  /**
   * Find the desired locale that is the closed match to a supported locale, within
   * the given threshold. Any matches whose distance is greater than or equal to the
   * threshold will be treated as having maximum distance.
   */
  match(desiredLocales: string | string[], threshold: number = DEFAULT_THRESHOLD): LocaleMatch {
    const desireds = parse(desiredLocales);
    const len = desireds.length;
    let bestDistance = MAX_DISTANCE;
    let bestMatch = undefined;
    let bestDesired = len === 0 ? this.default : desireds[0];
    for (let i = 0; i < len; i++) {
      const desired = desireds[i];

      // Short-circuit if we find an exact match
      const exact = this.exactMap[desired.compact];
      if (exact !== undefined) {
        bestMatch = exact[0];
        bestDistance = 0;
        bestDesired = desired;
        break;
      }

      for (let j = 0; j < this.count; j++) {
        const supported = this.supported[j];
        const distance = getDistance(desired.tag, supported.tag, threshold);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = supported;
          bestDesired = desired;
        }
      }
    }
    const extensions = bestDesired.tag.extensions();
    const privateUse = bestDesired.tag.privateUse();
    const { id, tag } = bestMatch === U ? this.default : bestMatch;
    const result = new LanguageTag(tag.language(), tag.script(), tag.region(), tag.variant(), extensions, privateUse);
    return {
      locale: { id, tag: result },
      distance: bestMatch === U ? MAX_DISTANCE : bestDistance,
    };
  }
}
