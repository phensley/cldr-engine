import {
  CharacterOrderType,
  ContextType,
  LanguageIdType,
  LineOrderType,
  NamesSchema,
  RegionIdType,
  ScriptIdType,
} from '@phensley/cldr-schema';
import { Part } from '@phensley/decimal';

import { parseLanguageTag, LanguageResolver, LanguageTag, Locale } from '../locale';
import { DisplayNameOptions, ListPatternType, MeasurementCategory, MeasurementSystem } from '../common';
import { Bundle } from '../resource';
import { GeneralInternals, Internals } from '../internals';

import { General } from './api';
import { PrivateApiImpl } from './private/api';
import { ContextTransformInfo } from '../common/private';
import { MessageArgs, MessageEngine } from '../systems/message';
import { buildMessageMatcher, parseMessagePattern } from '../parsing/message';

const DEFAULT_NAME_OPTIONS: DisplayNameOptions = { context: 'begin-sentence' };

export class GeneralImpl implements General {

  protected general: GeneralInternals;
  protected names: NamesSchema;
  protected transform: ContextTransformInfo;

  constructor(
    protected _bundle: Bundle,
    protected _locale: Locale,
    protected internal: Internals,
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

  formatMessage(message: string, ...args: MessageArgs): string {
    const m = buildMessageMatcher(message);
    const code = parseMessagePattern(message, m);
    const engine = new MessageEngine(this._locale.tag.language(), code);
    return engine.evaluate(...args);
  }

  formatList(items: string[], type?: ListPatternType): string {
    return this.general.formatList(this._bundle, items, type || 'and');
  }

  formatListToParts(items: string[], type?: ListPatternType): Part[] {
    return this.general.formatListToParts(this._bundle, items, type || 'and');
  }

  getLanguageDisplayName(code: string, options: DisplayNameOptions = DEFAULT_NAME_OPTIONS): string {
    const s = this.names.languages.displayName.get(this._bundle, code as LanguageIdType);
    return this.general.contextTransform(s, this.transform, _ctx(options), 'languages');
  }

  getScriptDisplayName(code: string, options: DisplayNameOptions = DEFAULT_NAME_OPTIONS): string {
    const s = this.names.scripts.displayName.get(this._bundle, code as ScriptIdType);
    return this.general.contextTransform(s, this.transform, _ctx(options), 'script');
  }

  getRegionDisplayName(code: string, options: DisplayNameOptions = DEFAULT_NAME_OPTIONS): string {
    const impl = this.names.regions.displayName;
    const name = impl.get(this._bundle, _def(options, 'type', 'none'), code as RegionIdType);
    return name ? name : impl.get(this._bundle, 'none', code as RegionIdType);
  }

}

// Default an options context value
const _ctx = (o: DisplayNameOptions) => _def(o, 'context', 'begin-sentence' as ContextType);

// Default an option value
const _def = <O, K extends keyof O, T>(o: O, k: K, t: T): T =>
  (o ? (o[k] as unknown as T) : t) || t;
