import {
  Bundle,
  UnitType
} from '@phensley/cldr-schema';

import { getNumberParams, NumbersInternal, NumberParams } from '../numbers';
import { STRING_RENDERER, PARTS_RENDERER } from '../numbers/render';
import { UnitsInternal } from './internal';
import { UnitFormatOptions, UnitLength, Quantity } from './options';
import { Part } from '../../types';

const defaultOptions: UnitFormatOptions = { length: 'long', style: 'decimal' };

export class UnitsEngine {

  private numberParams: NumberParams;

  constructor(
    protected internal: UnitsInternal,
    protected numbers: NumbersInternal,
    protected bundle: Bundle
  ) {
    this.numberParams = getNumberParams(bundle, numbers);
  }

  getDisplayName(name: UnitType, length: UnitLength = 'long'): string {
    return this.internal.getDisplayName(this.bundle, name, length as string);
  }

  format(q: Quantity, options: UnitFormatOptions = defaultOptions): string {
    return this.internal.format(this.bundle, STRING_RENDERER, q, options, this.numberParams);
  }

  formatParts(q: Quantity, options: UnitFormatOptions = defaultOptions): Part[] {
    return this.internal.format(this.bundle, PARTS_RENDERER, q, options, this.numberParams);
  }

  // TODO: use list pattern formatter to join unit sequences instead of single space

  formatSequence(qs: Quantity[], options: UnitFormatOptions = defaultOptions): string {
    return qs.map(q => this.format(q, options)).join(' ');
  }

  formatSequenceParts(qs: Quantity[], options: UnitFormatOptions = defaultOptions): Part[] {
    let res: Part[] = [];
    const len = qs.length;
    for (let i = 0; i < len; i++) {
      if (i > 0) {
        res.push({ type: 'literal', value: ' '});
      }
      const q = qs[i];
      res = res.concat(this.formatParts(q, options));
    }
    return res;
  }
}
