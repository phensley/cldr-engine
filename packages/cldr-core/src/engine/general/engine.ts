import { Bundle, CharacterOrderType, LineOrderType } from '@phensley/cldr-schema';
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

}
