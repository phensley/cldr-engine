import {
  Alt,
  Bundle,
  TerritoryType,
  Territories
} from '@phensley/cldr-schema';

import { NamesInternal } from './internal';

export class NamesEngine {

  constructor(
    protected internal: NamesInternal,
    protected bundle: Bundle
  ) { }

  getTerritoryDisplayName(code: TerritoryType | string, type?: string): string {
    const alt = type === 'short' ? Alt.SHORT : type === 'variant' ? Alt.VARIANT : Alt.NONE;
    const name = this.internal.getTerritoryDisplayName(this.bundle, code, alt);
    return name !== '' ? name : this.internal.getTerritoryDisplayName(this.bundle, code, Alt.NONE);
  }
}
