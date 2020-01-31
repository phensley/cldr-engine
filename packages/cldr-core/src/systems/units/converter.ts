import { UnitType } from '@phensley/cldr-types';
import { Decimal, MathContext } from '@phensley/decimal';
import { UnitFactorMap } from './factormap';
import { UnitFactorMapEntry } from './types';

/**
 * Converts between units.
 */
export class UnitConverter {

  private factors: { [category: string]: UnitFactorMap } = {};

  // Mapping of unit to category that converts it
  private units: { [unit: string]: string[] } = {};

  /**
   * Add a set of conversion factors with the given category name.
   */
  add(category: string, factors: UnitFactorMapEntry[]): void {
    if (this.factors[category]) {
      throw new Error(`this converter has registered factors for category ${category}`);
    }
    const factormap = new UnitFactorMap(category, factors);
    this.factors[category] = new UnitFactorMap(category, factors);
    for (const u of factormap.units) {
      let cats = this.units[u];
      if (!cats) {
        this.units[u] = cats = [];
      }
      cats.push(category);
    }
  }

  categories(): string[] {
    return Object.keys(this.factors).sort();
  }

  /**
   * Dump the conversion factors for debugging.
   */
  dump(): string {
    let s = '';
    for (const category of this.categories()) {
      s += `CATEGORY ${category}:`;
      s += this.factors[category].dump();
    }
    return s;
  }

  /**
   * Convert 'n' from units 'from' into 'to', using the given optional math context.
   * If a conversion category is provided, it will be used. Otherwise it will try
   * all converters that know about the 'from' unit.
   */
  convert(n: Decimal, from: UnitType, to: UnitType, context?: MathContext, category?: string): Decimal {
    let r: Decimal | undefined;
    const categories = category ? [category] : (this.units[from] || []);
    for (const c of categories) {
      const f = this.factors[c];
      if (f) {
        r = f.convert(n, from, to, context);
        if (r) {
          return r;
        }
      }
    }
    throw new Error(`no valid conversion from ${from} to ${to} is available`);
  }
}
