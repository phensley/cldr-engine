import {
  Bundle,
  CharacterOrderType,
  Layout,
  LineOrderType,
  Schema
} from '@phensley/cldr-schema';

export class GeneralInternal {

  protected layout: Layout;

  constructor(
    readonly root: Schema,
    readonly cacheSize: number = 50) {

    this.layout = root.Layout;
  }

  characterOrder(bundle: Bundle): string {
    return this.layout.characterOrder(bundle);
  }

  lineOrder(bundle: Bundle): string {
    return this.layout.lineOrder(bundle);
  }

}
