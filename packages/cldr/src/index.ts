export * from './exports';

import * as config from './config.json';

import {
  CLDRFramework as CLDRFrameworkBase,
} from '@phensley/cldr-core';

/**
 * @alpha
 */
export interface CLDROptions {
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
 * @alpha
 */
export class CLDRFramework extends CLDRFrameworkBase {

  constructor(options: CLDROptions) {
    super({ ...options, config });
  }
}
