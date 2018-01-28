import {
  Locale,
  LocaleMatcher,
  LanguageResolver,
} from '@phensley/cldr-core';

/**
 * Parse a locale identifier into a locale object that includes the original
 * id plus a resolved LanguageTag.
 */
export const getLocale = (id: string): Locale => {
  const tag = LanguageResolver.resolve(id);
  return { id, tag };
};

/**
 * Given a list of supported locales, return a LocaleMatcher object. This
 * performs distance-based enhanced language matching:
 * http://www.unicode.org/reports/tr35/tr35.html#EnhancedLanguageMatching
 */
export const getLocaleMatcher = (supported: string | string[]): LocaleMatcher => new LocaleMatcher(supported);

/**
 * Callback function that an application must provide to the framework.
 * It returns the raw contents of a given language resource pack when called.
 */
export interface PackLoader {

  /**
   * Given a language identifier (e.g. 'en') fetch the data
   * from the filesystem, webserver, etc, and return the raw
   * string.
   *
   * // TODO: support async loading
   */
  (language: string): string;

}

// TODO: rename me
export class Engine {

  // constructor(bundle) {
  //   this.bundle = bundle;
  // }
}

/**
 * TODO: rename me
 */
export class CLDR {

  constructor(
    private readonly loader: PackLoader) {}

  /**
   * Builds an instance of CldrEngine for the given locale.
   */
  get(locale: Locale | string): Engine {
    const { tag } = typeof locale === 'string' ? getLocale(locale) : locale;
    const language = tag.language();

    const raw = this.loader(language);

    return {};
  }

}
