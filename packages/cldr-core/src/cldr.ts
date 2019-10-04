import {
  Schema,
  SchemaConfig
} from '@phensley/cldr-schema';

import { LRU } from '@phensley/cldr-utils';

import {
  Calendars,
  CalendarsImpl,
  General,
  GeneralImpl,
  Numbers,
  NumbersImpl,
  PrivateApiImpl,
  Units,
  UnitsImpl
} from './api';

import {
  Internals,
  InternalsImpl
} from './internals';

import {
  availableLocales,
  parseLanguageTag,
  LanguageResolver,
  LanguageTag,
  Locale
} from './locale';

import {
  Bundle,
  Pack
} from './resource';

import { VERSION } from './utils/version';

const enum Messages {
  CHECKSUM = 'Checksum mismatch on resource pack! The schema config used to ' +
    'generate the resource pack must be identical to the one used at runtime.',
  LOCALE_UNDEFINED = 'The "locale" argument is undefined',
  NO_ASYNC_LOADER = 'A Promise-based resource loader is not defined',
  NO_SYNC_LOADER = 'A synchronous resource loader is not defined',
}

/**
 * Interface exporting all functionality for a given locale.
 *
 * @alpha
 */
export interface CLDR {

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

 /**
   * UNDOCUMENTED AND EXPERIMENTAL
   *
   * Provides access to the low-level schema for accessing CLDR fields.
   *
   * Currently undocumented. In the future an internal api can be
   * exposed allowing access to low-level functions of the library.
   *
   * @internal
   */
  readonly Schema: Schema;

 /**
   * UNDOCUMENTED AND EXPERIMENTAL
   *
   * Provides access to the low-level library internals.
   *
   * @internal
   */
  readonly Internals: Internals;

}

/**
 * Implements CLDR
 *
 * @alpha
 */
class CLDRImpl implements CLDR {

  private _calendars?: Calendars;
  private _general?: General;
  private _numbers?: Numbers;
  private _privateApi?: PrivateApiImpl;
  private _units?: Units;

  constructor(
    private readonly locale: Locale,
    private readonly bundle: Bundle,
    private readonly internals: Internals
  ) {}

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
      this._general = new GeneralImpl(this.bundle, this.locale, this.internals, this.privateApi);
    }
    return this._general;
  }

  /**
   * Number and currency functions.
   */
  get Numbers(): Numbers {
    if (this._numbers === undefined) {
      this._numbers = new NumbersImpl(this.bundle, this.internals.numbers, this.internals.general, this.privateApi);
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

  /**
   * UNDOCUMENTED AND EXPERIMENTAL
   *
   * Provides access to the low-level schema for accessing CLDR fields.
   *
   * Currently undocumented. In the future an internal api can be
   * exposed allowing access to low-level functions of the library.
   *
   * @internal
   */
  get Schema(): Schema {
    return this.internals.schema;
  }

  /**
   * UNDOCUMENTED AND EXPERIMENTAL
   *
   * Provides access to the low-level library internals.
   *
   * @internal
   */
  get Internals(): Internals {
    return this.internals;
  }

  private get privateApi(): PrivateApiImpl {
    if (this._privateApi === undefined) {
      this._privateApi = new PrivateApiImpl(this.bundle, this.internals);
    }
    return this._privateApi;
  }
}

const EMPTY_CONFIG: SchemaConfig = {};

/**
 * Options to initialize the library.
 *
 * @alpha
 */
export interface CLDROptions {

  /**
   * Log some messages.
   */
  debug?: boolean;

  /**
   * Customizing of the schema.
   */
  config?: SchemaConfig;

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
  protected static defaultConfig?: SchemaConfig;

  constructor(protected options: CLDROptions) {
    this.packCache = new LRU(options.packCacheSize || 2);
    this.loader = options.loader;
    this.asyncLoader = options.asyncLoader;

    const patternCacheSize = options.patternCacheSize || 200;
    this.internals = new InternalsImpl(
      options.config || CLDRFramework.defaultConfig || EMPTY_CONFIG,
      VERSION, options.debug, patternCacheSize);
  }

  /**
   * Specify a configuration to use as a fallback.
   */
  static setDefaultConfig(config: SchemaConfig): void {
    this.defaultConfig = config;
  }

  info(): string {
    return `packs loaded: ${this.packCache.size()}`;
  }

  /**
   * Return the library version.
   */
  static version(): string {
    return VERSION;
  }

  /**
   * Return an array of the available locales.
   */
  static availableLocales(): Locale[] {
    return availableLocales();
  }

  /**
   * Parse a locale identifier and resolve it. This returns a Locale object
   * that includes the original id string or tag's compact form, and
   * a resolved LanguageTag.
   */
  static resolveLocale(id: string | LanguageTag): Locale {
    const _id = typeof id === 'string' ? id : id.compact();
    const tag = LanguageResolver.resolve(id);
    return { id: _id, tag };
  }

  /**
   * Parses a string into a BCP47 language tag
   */
  static parseLanguageTag(s: string): LanguageTag {
    return parseLanguageTag(s);
  }

  /**
   * Synchronously load a bundle and construct an instance of an API for
   * a given locale. Mainly used when you want to load a language statically
   * when your application's state store is initialized.
   */
  get(locale: Locale | string): CLDR {
    must(this.loader, Messages.NO_SYNC_LOADER);
    must(locale, Messages.LOCALE_UNDEFINED);
    const resolved = typeof locale === 'string' ? CLDRFramework.resolveLocale(locale) : locale;
    const language = resolved.tag.language();

    let pack = this.packCache.get(language);
    if (pack === undefined) {
      const data = this.loader!(language);
      pack = new Pack(data);
      this.check(pack);
      this.packCache.set(language, pack);
    }
    return this.build(resolved, pack);
  }

  /**
   * Asynchronously load a bundle and construct an instance of an API for
   * a given locale.
   */
  getAsync(locale: Locale | string): Promise<CLDR> {
    must(this.asyncLoader, Messages.NO_ASYNC_LOADER);
    must(locale, Messages.LOCALE_UNDEFINED);
    const resolved = typeof locale === 'string' ? CLDRFramework.resolveLocale(locale) : locale;
    const language = resolved.tag.language();

    const promise = new Promise<CLDR>((resolve, reject) => {
      const pack = this.packCache.get(language);
      if (pack !== undefined) {
        resolve(this.build(resolved, pack));
        return;
      }

      // Resolve via the promise loader
      this.asyncLoader!(language).then(raw => {
        const _pack = new Pack(raw);
        this.check(_pack);
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
    return new CLDRImpl(locale, bundle, this.internals);
  }

  /**
   * Verify the resource pack is compatible with the schema config checksum.
   */
  protected check(pack: Pack): void {
    if (pack.checksum !== this.internals.checksum) {
      throw new Error(Messages.CHECKSUM);
    }
  }
}

const must = (arg: any, message: string) => {
  if (arg === undefined) {
    throw new Error(message);
  }
};
