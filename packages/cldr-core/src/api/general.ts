import {
  AltType,
  CharacterOrderType,
  LanguageIdType,
  LineOrderType,
  RegionIdType,
  ScriptIdType
} from '@phensley/cldr-schema';
import { Part } from '@phensley/decimal';

import { parseLanguageTag, LanguageResolver, LanguageTag, Locale } from '../locale';
import { ListPatternType, MeasurementCategory, MeasurementSystem } from '../common';
import { Bundle } from '../resource';
import { GeneralInternals, Internals } from '../internals';

import { General } from './api';

export class GeneralImpl implements General {

  protected general: GeneralInternals;

  constructor(
    protected _bundle: Bundle,
    protected _locale: Locale,
    protected internal: Internals
  ) {
    this.general = internal.general;
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

  formatList(items: string[], type?: ListPatternType): string {
    return this.general.formatList(this._bundle, items, type || 'and');
  }

  formatListToParts(items: string[], type?: ListPatternType): Part[] {
    return this.general.formatListToParts(this._bundle, items, type || 'and');
  }

  getLanguageDisplayName(code: LanguageIdType | string): string {
    return this.general.getLanguageDisplayName(this._bundle, code);
  }

  getScriptDisplayName(code: ScriptIdType | string): string {
    return this.general.getScriptDisplayName(this._bundle, code);
  }

  getRegionDisplayName(code: RegionIdType | string, type?: string): string {
    return this.general.getRegionDisplayName(this._bundle, code, (type || 'none') as AltType);
  }

}
