import {
  Alt,
  Bundle,
  Schema,
  Territories,
  TerritoryType
} from '@phensley/cldr-schema';

export class NamesInternal {

  readonly Territories: Territories;

  constructor(
    readonly root: Schema,
    readonly cacheSize: number = 50
  ) {
    this.Territories = root.Territories;
  }

  getTerritoryDisplayName(bundle: Bundle, code: string, alt: Alt): string {
    const id = code as TerritoryType;
    const name = this.Territories.displayName(bundle, id, alt);
    // Fall back if preferred form is not available
    return name === '' ? this.Territories.displayName(bundle, id, Alt.NONE) : name;
  }

}
