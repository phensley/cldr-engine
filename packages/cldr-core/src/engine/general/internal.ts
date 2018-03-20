import {
  Alt,
  Bundle,
  CharacterOrderType,
  Layout,
  LineOrderType,
  Names,
  Schema,
  ScriptType,
  TerritoryType
} from '@phensley/cldr-schema';

export class GeneralInternal {

  protected layout: Layout;
  protected names: Names;

  constructor(
    readonly root: Schema,
    readonly cacheSize: number = 50) {

    this.layout = root.Layout;
    this.names = root.Names;
  }

  characterOrder(bundle: Bundle): string {
    return this.layout.characterOrder(bundle);
  }

  lineOrder(bundle: Bundle): string {
    return this.layout.lineOrder(bundle);
  }

  getScriptDisplayName(bundle: Bundle, code: string): string {
    const id = code as ScriptType;
    return this.names.scripts.displayName(bundle, id);
  }

  getTerritoryDisplayName(bundle: Bundle, code: string, alt: Alt): string {
    const id = code as TerritoryType;
    const name = this.names.territories.displayName(bundle, id, alt);
    // Fall back if preferred form is not available
    return name === '' ? this.names.territories.displayName(bundle, id, Alt.NONE) : name;
  }

}
