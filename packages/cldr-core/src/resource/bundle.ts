import { PrimitiveBundle } from '@phensley/cldr-types';
import { pluralRules, PluralRules } from '@phensley/plurals';
import { LanguageTag } from '@phensley/language-tag';

/**
 * @internal
 */
export type ExceptionIndex = { [y: number]: number };

/**
 * @public
 */
export interface Bundle extends PrimitiveBundle {
  tag(): LanguageTag;
  calendarSystem(): string;
  numberSystem(): string;
  languageScript(): string;
  languageRegion(): string;
  spellout(): any;
  plurals(): PluralRules;
}

/**
 * @internal
 */
export class StringBundle implements Bundle {
  // Properties for fast internal lookups into maps.
  // For example, extended day periods cover all of 'es' except for 'es-CO'.
  // Pre-computing these to avoid string creation for lookups at runtime.
  private _languageRegion: string;
  private _languageScript: string;

  // Empty string will select the preferred calendar for the region.
  private _calendarSystem: string = '';
  private _numberSystem: string = 'default';

  // Plural rules are used in many places, so provide them on the bundle
  private _plurals: PluralRules;

  constructor(
    private _id: string,
    private _tag: LanguageTag,
    private strings: string[],
    private exceptions: string[],
    private index: ExceptionIndex,
    private _spellout: any,
  ) {
    const language = _tag.language();
    this._languageRegion = `${language}-${_tag.region()}`;
    this._languageScript = `${language}-${_tag.script()}`;
    this._plurals = pluralRules.get(language, _tag.region());

    // When bundle is constructed, see if there are unicode extensions for
    // number and calendar systems.
    for (const subtag of _tag.extensionSubtags('u')) {
      if (subtag.startsWith('nu-')) {
        this._numberSystem = subtag.substring(3);
      } else if (subtag.startsWith('ca-')) {
        this._calendarSystem = subtag.substring(3);
      }
    }
  }

  id(): string {
    return this._id;
  }

  tag(): LanguageTag {
    return this._tag;
  }

  language(): string {
    return this._tag.language();
  }

  region(): string {
    return this._tag.region();
  }

  languageScript(): string {
    return this._languageScript;
  }

  languageRegion(): string {
    return this._languageRegion;
  }

  calendarSystem(): string {
    return this._calendarSystem;
  }

  numberSystem(): string {
    return this._numberSystem;
  }

  get(offset: number): string {
    // If there is an exception index, attempt to resolve it.
    /* istanbul ignore else -- @preserve */
    if (this.index) {
      const i = this.index[offset];
      if (i !== undefined) {
        return this.exceptions[i] || '';
      }
    }

    // Return the actual string.
    return this.strings[offset] || '';
  }

  /**
   * Group of spellout rules inside this bundle.
   */
  spellout(): any {
    return this._spellout;
  }

  /**
   * Plural rules for cardinals and ordinals for this locale.
   */
  plurals(): PluralRules {
    return this._plurals;
  }
}
