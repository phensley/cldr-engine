import { LanguageTag } from './languagetag';
import { LanguageResolver } from './resolver';

/**
 * Wrapper pairing an application's opaque locale identifier with a
 * parsed and resolved language tag object.
 *
 * @alpha
 */
export interface Locale {

  /**
   * Application's own identifier for the locale, e.g. 'en_US', 'fr-CA', etc.
   * We preserve this since applications may use it as a unique key to
   * resolve translated messages, and may be forced to use a legacy
   * identifier.
   */
  readonly id: string;

  /**
   * Language tag that has been parsed and resolved. Parsing canonicalizes
   * the subtags, while resolution includes substituting language and
   * territory aliases and adding likely subtags.
   */
  readonly tag: LanguageTag;
}

/**
 * Merged declaration to add a parse() method to Locale interface.
 *
 * @alpha
 */
export class Locale {
  static parse(id: string): Locale {
    const tag = LanguageResolver.resolve(id);
    return { id, tag };
  }
}
