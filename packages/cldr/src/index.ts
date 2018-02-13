import {
  buildSchema,
  Cache,
  Locale,
  LocaleMatcher,
  LanguageResolver,
  Pack,
  GregorianEngine,
  GregorianInternal,
} from '@phensley/cldr-core';

const SCHEMA = buildSchema();

// TODO: rename me
export class Engine {

  constructor(
    readonly Gregorian: GregorianEngine
  ) {}

}

export interface CLDROptions {
  /**
   * Given a language identifier, fetch the resource pack from the
   * filesystem, webserver, etc, and return the raw decompressed string.
   */
  loader: (language: string) => string;

  /**
   * Number of language packs to keep in memory. Note that a language pack
   * will only be garbage collected once all engines using it are garbage
   * collected, so if you hold onto instances the cache may be
   * ineffective.
   */
  packCacheSize: number;

  /**
   * Size of internal pattern caches.
   */
  patternCacheSize: number;
}

/**
 * TODO: rename me
 */
export class CLDR {

  protected packCache: Cache<Pack>;
  protected gregorianInternal: GregorianInternal;

  constructor(protected readonly options: CLDROptions) {
    const packLoader = (language: string): Pack => {
      const raw = this.options.loader(language);
      return new Pack(raw);
    };
    this.packCache = new Cache(packLoader, options.packCacheSize || 2);
    const patternCacheSize = options.patternCacheSize || 50;
    this.gregorianInternal = new GregorianInternal(SCHEMA, patternCacheSize);
  }

  info(): string {
    return `packs loaded: ${this.packCache.size()}`;
  }

  /**
   * Parse a locale identifier into a locale object that includes the original
   * id plus a resolved LanguageTag.
   */
  resolve(id: string): Locale {
    const tag = LanguageResolver.resolve(id);
    return { id, tag };
  }

  /**
   * Given a list of supported locales, return a LocaleMatcher object. This
   * performs distance-based enhanced language matching:
   * http://www.unicode.org/reports/tr35/tr35.html#EnhancedLanguageMatching
   */
  getLocaleMatcher(supported: string | string[]): LocaleMatcher {
    return new LocaleMatcher(supported);
  }

  /**
   * Builds an instance of an Engine for the given locale.
   */
  get(locale: Locale | string): Engine {
    const { tag } = typeof locale === 'string' ? this.resolve(locale) : locale;
    const language = tag.language();
    const pack = this.packCache.get(language);
    const bundle = pack.get(tag);
    return new Engine(
      new GregorianEngine(this.gregorianInternal, bundle)
    );
  }

}
