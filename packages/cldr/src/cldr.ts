import {
  buildSchema,
  GregorianEngine,
  GregorianInternal,
  LanguageTag,
  Locale,
  LocaleMatcher,
  LanguageResolver,
  LRU,
  NumbersEngine,
  NumbersInternal,
  Pack,
} from '@phensley/cldr-core';

const SCHEMA = buildSchema();

export interface Engine {
  readonly locale: Locale;
  readonly Gregorian: GregorianEngine;
  readonly Numbers: NumbersEngine;
}

/**
 * Options to initialize the library.
 */
export class CLDROptions {
  /**
   * Given a language identifier, fetch the resource pack from the
   * filesystem, webserver, etc, and return the raw decompressed string.
   */
  syncLoader?: (language: string) => any;

  promiseLoader?: (language: string) => Promise<any>;

  /**
   * Number of language packs to keep in memory. Note that a language pack
   * will only be garbage collected once all engines using it are garbage
   * collected, so if you hold onto instances the cache may be
   * ineffective.
   */
  packCacheSize?: number;

  /**
   * Size of internal pattern caches.
   */
  patternCacheSize?: number;
}

/**
 * Initializes the library.
 */
export class CLDR {

  protected readonly packCache: LRU<string, Pack>;
  protected readonly syncLoader?: (language: string) => any;
  protected readonly promiseLoader?: (language: string) => Promise<any>;
  protected readonly gregorianInternal: GregorianInternal;
  protected readonly numbersInternal: NumbersInternal;

  protected readonly outstanding: Map<string, Promise<Engine>> = new Map();

  constructor(protected readonly options: CLDROptions) {
    this.packCache = new LRU(options.packCacheSize || 2);
    this.syncLoader = options.syncLoader;
    this.promiseLoader = options.promiseLoader;

    const patternCacheSize = options.patternCacheSize || 50;
    this.gregorianInternal = new GregorianInternal(SCHEMA, patternCacheSize);
    this.numbersInternal = new NumbersInternal(SCHEMA, patternCacheSize);
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
   * Synchronously load a bundle and construct an instance of an Engine for
   * a given locale. Mainly used when you want to load a language statically
   * when your application's state store is initialized.
   */
  get(locale: Locale | string): Engine {
    if (this.syncLoader === undefined) {
      throw new Error('a synchronous resource loader is not defined');
    }
    const resolved = typeof locale === 'string' ? this.resolve(locale) : locale;
    const language = resolved.tag.language();
    let pack = this.packCache.get(language);
    if (pack === undefined) {
      const data = this.syncLoader(language);
      pack = new Pack(data);
      this.packCache.set(language, pack);
    }
    return this._get(resolved, pack);
  }

  /**
   * Asynchronously load a bundle and construct an instance of an Engine for
   * a given locale.
   */
  getAsync(locale: Locale | string): Promise<Engine> {
    const promiseLoader = this.promiseLoader;
    if (promiseLoader === undefined) {
      throw new Error('a Promise-based resource loader is not defined');
    }
    const resolved = typeof locale === 'string' ? this.resolve(locale) : locale;
    const language = resolved.tag.language();

    // If the same language is loaded multiple times in rapid succession,
    // reuse the promise that is already in flight.
    let promise = this.outstanding.get(language);
    if (promise !== undefined) {
      return promise;
    }

    promise = new Promise<Engine>((resolve, reject) => {
      const pack = this.packCache.get(language);
      if (pack !== undefined) {
        resolve(this._get(resolved, pack));
        return;
      }

      // Resolve via the promise loader
      promiseLoader(language).then(raw => {
        const _pack = new Pack(raw);
        this.packCache.set(language, _pack);
        resolve(this._get(resolved, _pack));
        this.outstanding.delete(language);
      }).catch(reason => reject(reason));
    });

    this.outstanding.set(language, promise);
    return promise;
  }

  /**
   * Builds an engine instance.
   */
  protected _get(locale: Locale, pack: Pack): Engine {
    const bundle = pack.get(locale.tag);
    return {
      locale,
      Gregorian: new GregorianEngine(this.gregorianInternal, bundle),
      Numbers: new NumbersEngine(this.numbersInternal, bundle),
    };
  }
}
