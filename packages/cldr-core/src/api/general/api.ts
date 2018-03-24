import {
  Alt,
  CharacterOrderType,
  LineOrderType,
  ScriptIdType,
  RegionIdType
} from '@phensley/cldr-schema';

import { General } from '../api';
import { ListPatternType } from '../../common';
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

  formatList(items: string[], type?: ListPatternType): string {
    return this.general.formatList(this.bundle, items, type || 'and');
  }

  formatListToParts(items: string[], type?: ListPatternType): Part[] {
    return this.general.formatListToParts(this.bundle, items, type || 'and');
  }

  getScriptDisplayName(code: ScriptIdType | string): string {
    return this.general.getScriptDisplayName(this.bundle, code);
  }

  getRegionDisplayName(code: RegionIdType | string, type?: string): string {
    const alt = type === 'short' ? Alt.SHORT : type === 'variant' ? Alt.VARIANT : Alt.NONE;
    const name = this.general.getRegionDisplayName(this.bundle, code, alt);
    return name !== '' ? name : this.general.getRegionDisplayName(this.bundle, code, Alt.NONE);
  }

}
