import {
  buildSchema,
  DateFieldsEngine,
  DateFieldsInternal,
  GeneralEngine,
  GeneralInternal,
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
  readonly General: GeneralEngine;
  readonly Gregorian: GregorianEngine;
  readonly Numbers: NumbersEngine;
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
  protected readonly generalInternal: GeneralInternal;
  protected readonly gregorianInternal: GregorianInternal;
  protected readonly numbersInternal: NumbersInternal;
  protected readonly unitsInternal: UnitsInternal;
  protected readonly wrapperInternal: WrapperInternal;

  constructor(protected readonly options: CLDROptions) {
    this.packCache = new LRU(options.packCacheSize || 2);
    this.loader = options.loader;
    this.asyncLoader = options.asyncLoader;

    const patternCacheSize = options.patternCacheSize || 50;
    this.wrapperInternal = new WrapperInternal(patternCacheSize);
    this.dateFieldsInternal = new DateFieldsInternal(SCHEMA, this.wrapperInternal);
    this.generalInternal = new GeneralInternal(SCHEMA, patternCacheSize);
    this.gregorianInternal = new GregorianInternal(SCHEMA, this.wrapperInternal, patternCacheSize);
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
    return this.build(resolved, pack);
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

    const promise = new Promise<Engine>((resolve, reject) => {
      const pack = this.packCache.get(language);
      if (pack !== undefined) {
        resolve(this.build(resolved, pack));
        return;
      }

      // Resolve via the promise loader
      asyncLoader(language).then(raw => {
        const _pack = new Pack(raw);
        this.packCache.set(language, _pack);
        resolve(this.build(resolved, _pack));
      }).catch(reject);
    });

    return promise;
  }

  /**
   * Builds an engine instance.
   */
  protected build(locale: Locale, pack: Pack): Engine {
    const bundle = pack.get(locale.tag);
    return {
      locale,
      DateFields: new DateFieldsEngine(this.dateFieldsInternal, bundle),
      General: new GeneralEngine(this.generalInternal, bundle),
      Gregorian: new GregorianEngine(this.gregorianInternal, bundle),
      Numbers: new NumbersEngine(this.numbersInternal, bundle),
      Units: new UnitsEngine(this.unitsInternal, this.numbersInternal, bundle)
    };
  }
}
