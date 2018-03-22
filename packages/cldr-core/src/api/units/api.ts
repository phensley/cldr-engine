import { UnitType } from '@phensley/cldr-schema';

import { Units } from '../api';
import { Internals, NumberInternals, UnitInternals } from '../../internals';
import { UnitFormatOptions, UnitNameLength, Quantity } from '../../common';
import { Part } from '../../types';
import { Bundle } from '../../resource';
import { PrivateApiImpl } from '../private';

const defaultOptions: UnitFormatOptions = { length: 'long', style: 'decimal' };

export class UnitsImpl implements Units {

  private numbers: NumberInternals;
  private units: UnitInternals;

  constructor(
    protected bundle: Bundle,
    protected internal: Internals,
    protected privateApi: PrivateApiImpl
  ) {
    this.numbers = internal.numbers;
    this.units = internal.units;
  }

  getUnitDisplayName(name: UnitType, length: UnitNameLength = 'long'): string {
    return this.units.getDisplayName(this.bundle, name, length as string);
  }

  formatQuantity(q: Quantity, options: UnitFormatOptions = defaultOptions): string {
    const params = this.privateApi.getNumberParams(options.nu);
    const renderer = this.numbers.stringRenderer();
    return this.units.format(this.bundle, renderer, q, options, params);
  }

  formatQuantityToParts(q: Quantity, options: UnitFormatOptions = defaultOptions): Part[] {
    const params = this.privateApi.getNumberParams(options.nu);
    const renderer = this.numbers.partsRenderer();
    return this.units.format(this.bundle, renderer, q, options, params);
  }

  // TODO: use list pattern formatter to join unit sequences instead of single space

  formatQuantitySequence(qs: Quantity[], options: UnitFormatOptions = defaultOptions): string {
    return qs.map(q => this.formatQuantity(q, options)).join(' ');
  }

  formatQuantitySequenceToParts(qs: Quantity[], options: UnitFormatOptions = defaultOptions): Part[] {
    let res: Part[] = [];
    const len = qs.length;
    for (let i = 0; i < len; i++) {
      if (i > 0) {
        res.push({ type: 'literal', value: ' '});
      }
      const q = qs[i];
      res = res.concat(this.formatQuantityToParts(q, options));
    }
    return res;
  }
}
