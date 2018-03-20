import {
  Alt,
  Bundle,
  CharacterOrderType,
  LineOrderType,
  ScriptType,
  TerritoryType
} from '@phensley/cldr-schema';
import { GeneralInternal } from './internal';

export class GeneralEngine {

  constructor(
    protected internal: GeneralInternal,
    protected bundle: Bundle) {}

  characterOrder(): CharacterOrderType {
    return this.internal.characterOrder(this.bundle) as CharacterOrderType;
  }

  lineOrder(): LineOrderType {
    return this.internal.lineOrder(this.bundle) as LineOrderType;
  }

  getScriptDisplayName(code: ScriptType | string): string {
    return this.internal.getScriptDisplayName(this.bundle, code);
  }

  getTerritoryDisplayName(code: TerritoryType | string, type?: string): string {
    const alt = type === 'short' ? Alt.SHORT : type === 'variant' ? Alt.VARIANT : Alt.NONE;
    const name = this.internal.getTerritoryDisplayName(this.bundle, code, alt);
    return name !== '' ? name : this.internal.getTerritoryDisplayName(this.bundle, code, Alt.NONE);
  }

}
