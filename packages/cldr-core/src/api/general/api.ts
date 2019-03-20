import {
  AltType,
  CharacterOrderType,
  LanguageIdType,
  LineOrderType,
  RegionIdType,
  ScriptIdType
} from '@phensley/cldr-schema';

import { General } from '../api';
import { ListPatternType, MeasurementCategory, MeasurementSystem } from '../../common';
import { Bundle } from '../../resource';
import { Part } from '../../types';
import { GeneralInternals, Internals } from '../../internals';

export class GeneralImpl implements General {

  protected general: GeneralInternals;

  constructor(
    protected bundle: Bundle,
    protected internal: Internals
  ) {
    this.general = internal.general;
  }

  characterOrder(): CharacterOrderType {
    return this.general.characterOrder(this.bundle) as CharacterOrderType;
  }

  lineOrder(): LineOrderType {
    return this.general.lineOrder(this.bundle) as LineOrderType;
  }

  measurementSystem(category?: MeasurementCategory): MeasurementSystem {
    const region = this.bundle.region();
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
    return this.general.formatList(this.bundle, items, type || 'and');
  }

  formatListToParts(items: string[], type?: ListPatternType): Part[] {
    return this.general.formatListToParts(this.bundle, items, type || 'and');
  }

  getLanguageDisplayName(code: LanguageIdType | string): string {
    return this.general.getLanguageDisplayName(this.bundle, code);
  }

  getScriptDisplayName(code: ScriptIdType | string): string {
    return this.general.getScriptDisplayName(this.bundle, code);
  }

  getRegionDisplayName(code: RegionIdType | string, type?: string): string {
    const name = this.general.getRegionDisplayName(this.bundle, code, (type || 'none') as AltType);
    return name !== '' ? name : this.general.getRegionDisplayName(this.bundle, code, 'none');
  }

}
