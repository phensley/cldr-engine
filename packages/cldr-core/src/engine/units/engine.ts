import {
  Bundle,
  UnitType
} from '@phensley/cldr-schema';

import { UnitsInternal } from './internal';

export type UnitWidth = 'short' | 'narrow' | 'long';

export class UnitsEngine {

  constructor(
    protected internal: UnitsInternal,
    protected bundle: Bundle
  ) { }

  getDisplayName(name: UnitType, width: UnitWidth = 'long'): string {
    return this.internal.getDisplayName(this.bundle, name, width as string);
  }
}
