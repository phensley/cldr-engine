import {
  Bundle,
  Calendars,
  CalendarsImpl,
  General,
  GeneralImpl,
  Internals,
  InternalsImpl,
  LanguageResolver,
  LanguageTag,
  Locale,
  Numbers,
  NumbersImpl,
  Pack,
  PrivateApiImpl,
  Units,
  UnitsImpl
} from '@phensley/cldr-core';
import { LRU } from '@phensley/cldr-utils';

/**
 * Parse a locale identifier and resolve it. This returns a Locale object
 * that includes the original id string or tag's compact form, and
 * a resolved LanguageTag.
 */
export const resolveLocale = (id: string | LanguageTag): Locale => {
  const _id = typeof id === 'string' ? id : id.compact();
  const tag = LanguageResolver.resolve(id);
  return { id: _id, tag };
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
    return resolveLocale(tag);
  }

}

/**
 * Interface exporting all functionality for a given locale.
 *
 * @alpha
 */
export class CLDR {

  private _calendars?: Calendars;
  private _general?: General;
  private _locales?: Locales;
  private _numbers?: Numbers;
  private _privateApi?: PrivateApiImpl;
  private _units?: Units;

  constructor(
    private readonly locale: Locale,
    private readonly bundle: Bundle,
    private readonly internals: Internals
  ) {}

  /**
   * Locale functions.
   */
  get Locales(): Locales {
    if (this._locales === undefined) {
      this._locales = new Locales(this.locale, this.bundle);
    }
    return this._locales;
  }

  /**
   * Calendar functions.
   */
  get Calendars(): Calendars {
    if (this._calendars === undefined) {
      this._calendars = new CalendarsImpl(this.bundle, this.internals, this.privateApi);
    }
    return this._calendars;
  }

  /**
   * General functions.
   */
  get General(): General {
    if (this._general === undefined) {
      this._general = new GeneralImpl(this.bundle, this.internals);
    }
    return this._general;
  }

  /**
   * Number and currency functions.
   */
  get Numbers(): Numbers {
    if (this._numbers === undefined) {
      this._numbers = new NumbersImpl(this.bundle, this.internals, this.privateApi);
    }
    return this._numbers;
  }

  /**
   * Unit quantity functions.
   */
  get Units(): Units {
    if (this._units === undefined) {
      this._units = new UnitsImpl(this.bundle, this.internals, this.privateApi);
    }
    return this._units;
  }

  private get privateApi(): PrivateApiImpl {
    if (this._privateApi === undefined) {
      this._privateApi = new PrivateApiImpl(this.bundle, this.internals);
    }
    return this._privateApi;
  }
}

/**
 * Options to initialize the library.
 *
 * @alpha
 */
export class CLDROptions {

  /**
   * Log some messages.
   */
  debug?: boolean;

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

  protected readonly packCache: LRU<Pack>;
  protected readonly loader?: (language: string) => any;
  protected readonly asyncLoader?: (language: string) => Promise<any>;
  protected readonly internals: Internals;

  constructor(protected readonly options: CLDROptions) {
    this.packCache = new LRU(options.packCacheSize || 2);
    this.loader = options.loader;
    this.asyncLoader = options.asyncLoader;

    const patternCacheSize = options.patternCacheSize || 50;
    this.internals = new InternalsImpl(options.debug || false, patternCacheSize);
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
    const resolved = typeof locale === 'string' ? resolveLocale(locale) : locale;
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
    const resolved = typeof locale === 'string' ? resolveLocale(locale) : locale;
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
    return new CLDR(locale, bundle, this.internals);
  }
}
