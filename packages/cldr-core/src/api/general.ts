import {
  AltType,
  CharacterOrderType,
  ContextType,
  LineOrderType,
  NamesSchema,
  Vector2Arrow
} from '@phensley/cldr-types';

import { MessageFormatter, MessageFormatterOptions } from '@phensley/messageformat';
import { Part } from '@phensley/decimal';

import { parseLanguageTag, LanguageResolver, LanguageTag, Locale } from '../locale';
import { DisplayNameOptions, ListPatternType, MeasurementCategory, MeasurementSystem } from '../common';
import { Bundle } from '../resource';
import { GeneralInternals, Internals } from '../internals';

import { General } from './api';
import { PrivateApiImpl } from './private/api';
import { ContextTransformInfo } from '../common/private';

const DEFAULT_NAME_OPTIONS: DisplayNameOptions = { context: 'begin-sentence' };

// Compound fields for language display name
type LanguageTagFunc = (t: LanguageTag) => string;

const F_LANG_REGION = (t: LanguageTag) => `${t.language()}-${t.region()}`;
const F_LANG_SCRIPT = (t: LanguageTag) => `${t.language()}-${t.script()}`;

const LANGUAGE_FUNCS: LanguageTagFunc[] = [
  F_LANG_REGION,
  F_LANG_SCRIPT,
  t => t.language()
];

/**
 * @internal
 */
export class GeneralImpl implements General {

  private general: GeneralInternals;
  private names: NamesSchema;
  private transform: ContextTransformInfo;

  constructor(
    private _bundle: Bundle,
    private _locale: Locale,
    internal: Internals,
    _private: PrivateApiImpl
  ) {
    this.general = internal.general;
    this.names = internal.schema.Names;
    this.transform = _private.getContextTransformInfo();
  }

  characterOrder(): CharacterOrderType {
    return this.general.characterOrder(this._bundle) as CharacterOrderType;
  }

  lineOrder(): LineOrderType {
    return this.general.lineOrder(this._bundle) as LineOrderType;
  }

  bundle(): Bundle {
    return this._bundle;
  }

  locale(): Locale {
    return this._locale;
  }

  resolveLocale(id: string | LanguageTag): Locale {
    const _id = typeof id === 'string' ? id : id.compact();
    const tag = LanguageResolver.resolve(id);
    return { id: _id, tag };
  }

  parseLanguageTag(tag: string): LanguageTag {
    return parseLanguageTag(tag);
  }

  messageFormatter(options?: MessageFormatterOptions): MessageFormatter {
    const plurals = this._bundle.plurals();
    return new MessageFormatter({ ...options, plurals });
  }

  measurementSystem(category?: MeasurementCategory): MeasurementSystem {
    const region = this._bundle.region();
    switch (category) {
      case 'temperature':
        switch (region) {
          case 'BS':
          case 'BZ':
          case 'PR':
          case 'PW':
            return 'us';
          default:
            return 'metric';
        }

      default:
        switch (region) {
          case 'GB':
            return 'uk';
          case 'LR':
          case 'MM':
          case 'US':
            return 'us';
          default:
            return 'metric';
        }
    }
  }

  formatList(items: string[], type?: ListPatternType): string {
    return this.general.formatList(this._bundle, items, type || 'and');
  }

  formatListToParts(items: string[], type?: ListPatternType): Part[] {
    return this.general.formatListToParts(this._bundle, items, type || 'and');
  }

  getLanguageDisplayName(code: string | LanguageTag, options: DisplayNameOptions = DEFAULT_NAME_OPTIONS): string {
    const type = options.type || 'none';
    const arrow = this.names.languages.displayName;

    let tag: LanguageTag = typeof code === 'string' ? parseLanguageTag(code) : code;
    let s: string = '';

    // First attempt to match the exact string
    if (typeof code === 'string') {
      s = this._getVectorAlt(arrow, code, type);
    }
    // Try language + region
    if (!s && tag.hasLanguage() && tag.hasRegion()) {
      s = this._getVectorAlt(arrow, F_LANG_REGION(tag), type);
    }
    // Try language + script
    if (!s && tag.hasLanguage() && tag.hasScript()) {
      s = this._getVectorAlt(arrow, F_LANG_SCRIPT(tag), type);
    }
    // Try language if script and region are empty
    if (!s && !tag.hasScript() && !tag.hasRegion()) {
      s = this._getVectorAlt(arrow, tag.language(), type);
    }

    // Resolve to fill in unknown subtags, then attempt combinations
    if (!s) {
      const locale = this.resolveLocale(tag);
      tag = locale.tag;
      for (const func of LANGUAGE_FUNCS) {
        const id = func(tag);
        s = this._getVectorAlt(arrow, id, type);
        if (s) {
          // Found one
          break;
        }
      }
    }
    return this.general.contextTransform(s, this.transform, _ctx(options), 'languages');
  }

  getScriptDisplayName(code: string | LanguageTag, options: DisplayNameOptions = DEFAULT_NAME_OPTIONS): string {
    const arrow = this.names.scripts.displayName;
    const type = options.type || 'none';
    let s: string = '';
    if (typeof code === 'string') {
      s = this._getVectorAlt(arrow, code, type);

      // If language is blank or we have an explicit script subtag, use the
      // script subtag as-is. This will resolve "und-Zzzz" to "Unknown" but
      // "en-Zzzz" will fall through to resolve "Latin"
    } else if (!code.hasLanguage() || code.hasScript()) {
      s = this._getVectorAlt(arrow, code.script(), type);
    }
    if (!s) {
      // Resolve to populate the script
      const locale = this.resolveLocale(code);
      s = this._getVectorAlt(arrow, locale.tag.script(), type);
    }
    return this.general.contextTransform(s, this.transform, _ctx(options), 'script');
  }

  getRegionDisplayName(code: string | LanguageTag, options: DisplayNameOptions = DEFAULT_NAME_OPTIONS): string {
    const arrow = this.names.regions.displayName;
    const type = options.type || 'none';
    let s: string = '';
    if (typeof code === 'string') {
      s = this._getVectorAlt(arrow, code, type);

      // If language is blank or we have an explicit region subtag, use
      // the region subtag as-is. This will resolve "und-ZZ" to "Unknown" but
      // "en-Zzzz" will fall through to resolve "United States"
    } else if (!code.hasLanguage() || code.hasRegion()) {
      s = this._getVectorAlt(arrow, code.region(), type);
    }
    if (!s) {
      // Resolve to populate the region
      const { tag } = this.resolveLocale(code);
      s = this._getVectorAlt(arrow, tag.region(), type);
    }
    // No context transform for region
    return s;
  }

  // Check if the given alt type field exists, and fall back to alt type 'none'
  protected _getVectorAlt<T extends string>(arrow: Vector2Arrow<AltType, T>,
    code: string, type: AltType): string {
    return arrow.get(this._bundle, type, code as unknown as T)
      || arrow.get(this._bundle, 'none', code as unknown as T);
  }

}

// Default an options context value
const _ctx = (o: DisplayNameOptions) => _def(o, 'context', 'begin-sentence' as ContextType);

// Default an option value
const _def = <O, K extends keyof O, T>(o: O, k: K, t: T): T =>
  (o ? (o[k] as unknown as T) : t) || t;
