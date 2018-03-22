import {
  Alt,
  CharacterOrderType,
  LayoutSchema,
  LineOrderType,
  NamesSchema,
  Schema,
  ScriptIdType,
  RegionIdType
} from '@phensley/cldr-schema';

import { Bundle } from '../../resource';
import { GeneralInternals } from '..';

export class GeneralInternalsImpl implements GeneralInternals {

  protected layout: LayoutSchema;
  protected names: NamesSchema;

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
    const id = code as ScriptIdType;
    return this.names.scripts.displayName(bundle, id);
  }

  getRegionDisplayName(bundle: Bundle, code: string, alt: Alt = Alt.NONE): string {
    const id = code as RegionIdType;
    const name = this.names.regions.displayName(bundle, id, alt);
    // Fall back if preferred form is not available
    return name === '' ? this.names.regions.displayName(bundle, id, Alt.NONE) : name;
  }

}
