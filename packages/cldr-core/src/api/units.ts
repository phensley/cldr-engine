import { UnitType } from '@phensley/cldr-types';
import { Part } from '@phensley/decimal';

import { GeneralInternals, Internals, NumberInternals, UnitInternals } from '../internals';
import { ListPatternType, Quantity, UnitFormatOptions, UnitLength } from '../common';
import { Bundle } from '../resource';
import { PartsValue } from '../utils/render';

import { Units } from './api';
import { PrivateApiImpl } from './private';

const DEFAULT_OPTIONS: UnitFormatOptions = { length: 'long', style: 'decimal' };

export class UnitsImpl implements Units {

  private general: GeneralInternals;
  private numbers: NumberInternals;
  private units: UnitInternals;

  constructor(
    private bundle: Bundle,
    private internal: Internals,
    private privateApi: PrivateApiImpl
  ) {
    this.general = internal.general;
    this.numbers = internal.numbers;
    this.units = internal.units;
  }

  availableUnits(): UnitType[] {
    return this.internal.indices['unit-id'].keys.slice(0) as UnitType[];
  }

  getUnitDisplayName(name: UnitType, length?: UnitLength): string {
    return this.units.getDisplayName(this.bundle, name, length || 'long');
  }

  formatQuantity(q: Quantity, options?: UnitFormatOptions): string {
    options = options || DEFAULT_OPTIONS;
    const params = this.privateApi.getNumberParams(options.nu);
    const renderer = this.numbers.stringRenderer(params);
    return this.units.format(this.bundle, renderer, q, options, params);
  }

  formatQuantityToParts(q: Quantity, options?: UnitFormatOptions): Part[] {
    options = options || DEFAULT_OPTIONS;
    const params = this.privateApi.getNumberParams(options.nu);
    const renderer = this.numbers.partsRenderer(params);
    return this.units.format(this.bundle, renderer, q, options, params);
  }

  formatQuantitySequence(qs: Quantity[], options?: UnitFormatOptions): string {
    options = options || DEFAULT_OPTIONS;
    const items = qs.map(q => this.formatQuantity(q, options));
    const type = this.selectListType(options);
    return this.general.formatList(this.bundle, items, type);
  }

  formatQuantitySequenceToParts(qs: Quantity[], options?: UnitFormatOptions): Part[] {
    options = options || DEFAULT_OPTIONS;
    const parts: Part[][] = qs.map(q => this.formatQuantityToParts(q, options));
    const type = this.selectListType(options);
    return this.general.formatListImpl(this.bundle, new PartsValue(), parts, type);
  }

  protected selectListType(options: UnitFormatOptions): ListPatternType {
    switch (options.length) {
    case 'narrow':
      return 'unit-narrow';
    case 'short':
      return 'unit-short';
    default:
      return 'unit-long';
    }
  }
}
