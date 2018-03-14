import {
  buildSchema,
  DateFieldsEngine,
  DateFieldsInternal,
  GregorianEngine,
  GregorianInternal,
  LanguageTag,
  Locale,
  LocaleMatcher,
  LanguageResolver,
  LRU,
  NamesEngine,
  NamesInternal,
  NumbersEngine,
  NumbersInternal,
  Pack,
  UnitsEngine,
  UnitsInternal,
  WrapperInternal
} from '@phensley/cldr-core';

const SCHEMA = buildSchema();

/**
 * Parse a locale identifier into a locale object that includes the original
 * id plus a resolved LanguageTag.
 */
export const parseLocale = (id: string): Locale => {
  const tag = LanguageResolver.resolve(id);
  return { id, tag };
};

/**
 * Interface exporting all functionality for a given locale.
 *
 * @alpha
 */
export interface Engine {
  readonly locale: Locale;
  readonly DateFields: DateFieldsEngine;
  readonly Gregorian: GregorianEngine;
  readonly Numbers: NumbersEngine;
  readonly Names: NamesEngine;
  readonly Units: UnitsEngine;
}

/**
 * Options to initialize the library.
 *
 * @alpha
 */
export class CLDROptions {
  /**
   * Given a language identifier, fetch the resource pack from the
   * filesystem, webserver, etc, and return the raw decompressed string.
   */
  loader?: (language: string) => any;

  asyncLoader?: (language: string) => Promise<any>;

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
 * Top-level entry point for the library. It's only purpose at the
 * moment is to construct instances of Engine for a particular locale.
 * All other functionality should be available statically through
 * exported types and functions.
 *
 * @alpha
 */
export class CLDR {

  protected readonly packCache: LRU<string, Pack>;
  protected readonly loader?: (language: string) => any;
  protected readonly asyncLoader?: (language: string) => Promise<any>;
  protected readonly dateFieldsInternal: DateFieldsInternal;
  protected readonly gregorianInternal: GregorianInternal;
  protected readonly namesInternal: NamesInternal;
  protected readonly numbersInternal: NumbersInternal;
  protected readonly unitsInternal: UnitsInternal;
  protected readonly wrapperInternal: WrapperInternal;

  // Keeps track of in-flight promises.
  protected readonly outstanding: Map<string, Promise<Engine>> = new Map();

  constructor(protected readonly options: CLDROptions) {
    this.packCache = new LRU(options.packCacheSize || 2);
    this.loader = options.loader;
    this.asyncLoader = options.asyncLoader;

    const patternCacheSize = options.patternCacheSize || 50;
    this.wrapperInternal = new WrapperInternal(patternCacheSize);
    this.dateFieldsInternal = new DateFieldsInternal(SCHEMA, this.wrapperInternal);
    this.gregorianInternal = new GregorianInternal(SCHEMA, this.wrapperInternal, patternCacheSize);
    this.namesInternal = new NamesInternal(SCHEMA, patternCacheSize);
    this.numbersInternal = new NumbersInternal(SCHEMA, this.wrapperInternal, patternCacheSize);
    this.unitsInternal = new UnitsInternal(SCHEMA, this.numbersInternal, this.wrapperInternal, patternCacheSize);
  }

  info(): string {
    return `packs loaded: ${this.packCache.size()}`;
  }

  /**
   * Synchronously load a bundle and construct an instance of an Engine for
   * a given locale. Mainly used when you want to load a language statically
   * when your application's state store is initialized.
   */
  get(locale: Locale | string): Engine {
    if (this.loader === undefined) {
      throw new Error('a synchronous resource loader is not defined');
    }
    const resolved = typeof locale === 'string' ? parseLocale(locale) : locale;
    const language = resolved.tag.language();

    let pack = this.packCache.get(language);
    if (pack === undefined) {
      const data = this.loader(language);
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
    const asyncLoader = this.asyncLoader;
    if (asyncLoader === undefined) {
      throw new Error('a Promise-based resource loader is not defined');
    }
    const resolved = typeof locale === 'string' ? parseLocale(locale) : locale;
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
      asyncLoader(language).then(raw => {
        const _pack = new Pack(raw);
        this.packCache.set(language, _pack);
        resolve(this._get(resolved, _pack));
        this.outstanding.delete(language);
      }).catch(reject);
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
      DateFields: new DateFieldsEngine(this.dateFieldsInternal, bundle),
      Gregorian: new GregorianEngine(this.gregorianInternal, bundle),
      Names: new NamesEngine(this.namesInternal, bundle),
      Numbers: new NumbersEngine(this.numbersInternal, bundle),
      Units: new UnitsEngine(this.unitsInternal, this.numbersInternal, bundle)
    };
  }
}
