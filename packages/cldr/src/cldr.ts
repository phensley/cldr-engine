import {
  Bundle,
  Calendars,
  CalendarsImpl,
  General,
  GeneralImpl,
  Internals,
  InternalsImpl,
  LanguageTag,
  Locale,
  LocaleMatcher,
  LanguageResolver,
  LRU,
  Numbers,
  NumbersImpl,
  Pack,
  PrivateApiImpl,
  Units,
  UnitsImpl
} from '@phensley/cldr-core';

/**
 * Parse a locale identifier into a locale object that includes the original
 * id plus a resolved LanguageTag.
 */
export const parseLocale = (id: string): Locale => {
  const tag = LanguageResolver.resolve(id);
  return { id, tag };
};

/**
 * Top-level namespace to expose info about the current locale and bundle,
 * and attach helper methods for dealing with locales.
 *
 * @alpha
 */
export class Locales {

  constructor(
    protected readonly _locale: Locale,
    protected readonly _bundle: Bundle) {}

  /**
   * The current language bundle.
   */
  bundle(): Bundle {
    return this._bundle;
  }

  /**
   * The current locale.
   */
  current(): Locale {
    return this._locale;
  }

  /**
   * Resolve a language tag to a Locale.
   */
  resolve(tag: string): Locale {
    return parseLocale(tag);
  }

}

/**
 * Interface exporting all functionality for a given locale.
 *
 * @alpha
 */
export interface CLDR {

  /**
   * Locale functions.
   */
  readonly Locales: Locales;

  /**
   * Calendar functions.
   */
  readonly Calendars: Calendars;

  /**
   * General functions.
   */
  readonly General: General;

  /**
   * Number and currency functions.
   */
  readonly Numbers: Numbers;

  /**
   * Unit quantity functions.
   */
  readonly Units: Units;
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
   * Number of language-wide resource packs to keep in memory.
   *
   * Note: a language pack will only be garbage collected once all instances
   * using it are garbage collected, so if you hold onto instances the cache
   * may be ineffective.
   */
  packCacheSize?: number;

  /**
   * Size of internal pattern caches.
   */
  patternCacheSize?: number;
}

/**
 * Top-level entry point for the library. It's only purpose at the
 * moment is to construct API instances for a particular locale.
 * All other functionality should be available statically through
 * exported types and functions.
 *
 * @alpha
 */
export class CLDRFramework {

  protected readonly packCache: LRU<string, Pack>;
  protected readonly loader?: (language: string) => any;
  protected readonly asyncLoader?: (language: string) => Promise<any>;
  protected readonly internals: Internals;

  constructor(protected readonly options: CLDROptions) {
    this.packCache = new LRU(options.packCacheSize || 2);
    this.loader = options.loader;
    this.asyncLoader = options.asyncLoader;

    this.internals = new InternalsImpl();
    const patternCacheSize = options.patternCacheSize || 50;
  }

  info(): string {
    return `packs loaded: ${this.packCache.size()}`;
  }

  /**
   * Synchronously load a bundle and construct an instance of an API for
   * a given locale. Mainly used when you want to load a language statically
   * when your application's state store is initialized.
   */
  get(locale: Locale | string): CLDR {
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
   * Asynchronously load a bundle and construct an instance of an API for
   * a given locale.
   */
  getAsync(locale: Locale | string): Promise<CLDR> {
    const asyncLoader = this.asyncLoader;
    if (asyncLoader === undefined) {
      throw new Error('a Promise-based resource loader is not defined');
    }
    const resolved = typeof locale === 'string' ? parseLocale(locale) : locale;
    const language = resolved.tag.language();

    const promise = new Promise<CLDR>((resolve, reject) => {
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
   * Builds an API instance.
   */
  protected build(locale: Locale, pack: Pack): CLDR {
    const bundle = pack.get(locale.tag);
    const privateApi = new PrivateApiImpl(bundle, this.internals);

    return {
      Calendars: new CalendarsImpl(bundle, this.internals, privateApi),
      General: new GeneralImpl(bundle, this.internals),
      Locales: new Locales(locale, bundle),
      Numbers: new NumbersImpl(bundle, this.internals, privateApi),
      Units: new UnitsImpl(bundle, this.internals, privateApi)
    };
  }
}
